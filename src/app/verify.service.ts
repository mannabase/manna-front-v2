import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subscription, of, throwError } from 'rxjs';
import { map, switchMap, tap, catchError, finalize } from 'rxjs/operators';
import { ContractService } from './contract.service';
import { MetamaskService } from './metamask.service';
import { MannaService } from './manna.service';

export enum VerifyState {
    NOT_VERIFIED = 'NOT_VERIFIED',
    EXPIRED = 'EXPIRED',
    VERIFIED = 'VERIFIED',
}

export interface LocalScoreData {
    timestamp: number;
    score: number;
}

@Injectable({
    providedIn: 'root',
})
export class VerifyService {
    private verificationStateSubject = new BehaviorSubject<VerifyState>(VerifyState.NOT_VERIFIED);
    verificationState$ = this.verificationStateSubject.asObservable();

    private contractScoreSource = new BehaviorSubject<number | undefined>(undefined);
    contractScore$ = this.contractScoreSource.asObservable();

    private serverScoreSource = new BehaviorSubject<number | null>(null);
    serverScore$ = this.serverScoreSource.asObservable();

    private thresholdSource = new BehaviorSubject<number | undefined>(undefined);
    threshold$ = this.thresholdSource.asObservable();

    private loaderSource = new BehaviorSubject<boolean>(false);
    loader$ = this.loaderSource.asObservable();

    walletAddress: string | null = null;
    accountSubscription: Subscription = new Subscription();
    serverScoreSignature?: string;
    private cachedTimestamp: number | null = null;
    private cachedSignature: string | null = null;
    private cacheExpiry: number = 0;
    private refreshAccount$ = new BehaviorSubject<boolean>(false);
    
    constructor(
        private contractService: ContractService,
        private metamaskService: MetamaskService,
        private mannaService: MannaService
    ) {
        this.accountSubscription = this.metamaskService.account$.subscribe(
            (address) => {
                this.walletAddress = address;
                if (address) this.updateVerificationState();
            }
        );

        this.serverScoreSource.subscribe((score) => {
            if (score != null) {
                localStorage.setItem(
                    'localScore',
                    JSON.stringify({
                        timestamp: Date.now(),
                        score: score,
                    })
                );
            }
        });
    }

    public updateVerificationState() {
        this.contractService
            .getScoreThreshold()
            .pipe(
                tap((threshold) => this.thresholdSource.next(threshold)),
                switchMap(() =>
                    this.contractService.getUserScore(this.walletAddress!)
                )
            )
            .subscribe({
                next: (scoreObj) => {
                    this.contractScoreSource.next(scoreObj?.score);
                    if (scoreObj != null) {
                        const halfMonthAgo = Date.now() - 15 * 24 * 60 * 60 * 1000; // 15 days
                        const scoreDate = new Date(scoreObj.timestamp * 1000); // Convert to milliseconds
                        if (scoreDate.getTime() > halfMonthAgo) {
                            if (scoreObj.score / 1e6 > this.thresholdSource.value!) {
                                this.verificationStateSubject.next(VerifyState.VERIFIED);
                            } else {
                                this.verificationStateSubject.next(VerifyState.NOT_VERIFIED);
                            }
                        } else {
                            this.verificationStateSubject.next(VerifyState.EXPIRED);
                        }
                    } else {
                        this.verificationStateSubject.next(VerifyState.NOT_VERIFIED);
                    }
                },
                error: (error) => {
                    console.error('Error updating verification state:', error);
                    this.verificationStateSubject.next(VerifyState.NOT_VERIFIED);
                },
            });
    }

    updateServerScore(): Observable<any> {
        return this.getVerificationSignatureFromUser().pipe(
            switchMap(({ timestamp, signature }) =>
                this.mannaService.getGitcoinScore(this.walletAddress!, signature, timestamp)
            ),
            tap((response) => this.serverScoreSource.next(response.data.score)),
            catchError((error) => {
                console.error('Error updating server score:', error);
                return of(null);
            })
        );
    }

    sendScoreToContract(walletAddress: string): Observable<void> {
        this.loaderSource.next(true);
        return this.getVerificationSignatureFromUser().pipe(
            switchMap(({ timestamp, signature }) => {
                if (!signature) {
                    throw new Error('No signature received.');
                }
                return this.mannaService.getGitcoinScore(walletAddress, signature, timestamp);
            }),
            switchMap((serverResponse) => {
                return this.contractService.submitUserScore(walletAddress, serverResponse.data);
            }),
            catchError((error) => {
                console.error('Error sending score to contract:', error);
                return throwError(error);
            }),
            finalize(() => {
                this.loaderSource.next(false);
            })
        );
    }

    getVerificationSignatureFromUser(): Observable<{ timestamp: number; signature: string }> {
        const currentTime = this.getCurrentTimestamp();

        if (this.cachedSignature && currentTime < this.cacheExpiry) {
            return of({
                timestamp: this.cachedTimestamp!,
                signature: this.cachedSignature,
            });
        } else {
            const timestamp = currentTime;
            const address = this.metamaskService.account$.value;
            const message = `Verification request\naddress: ${address.toLowerCase()}\ntimestamp: ${timestamp}`;

            return this.metamaskService.signMessage(message).pipe(
                tap((signature) => {
                    this.cachedSignature = signature;
                    this.cachedTimestamp = timestamp;
                    this.cacheExpiry = currentTime + 60;
                    console.log('New signature and timestamp cached');
                }),
                map((signature) => ({
                    timestamp: this.cachedTimestamp!,
                    signature,
                }))
            );
        }
    }

    getRefreshAccount() {
        return this.refreshAccount$.asObservable();
    }

    triggerAccountRefresh() {
        this.refreshAccount$.next(true);
    }

    private getCurrentTimestamp(): number {
        return Math.floor(Date.now() / 1000);
    }
}
