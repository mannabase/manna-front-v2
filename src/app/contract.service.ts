import { Injectable } from '@angular/core';
import { Contract, ethers } from 'ethers';
import { BehaviorSubject, from, Observable, of, throwError } from 'rxjs';
import { catchError, filter, map, switchMap, tap } from 'rxjs/operators';
import { MetamaskService } from './metamask.service';
import { claimMannaContractABI, claimMannaContractAddress, mannaContractABI, mannaContractAddress } from './config';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Signature, UserScore } from './types';


@Injectable({
    providedIn: 'root',
})
export class ContractService {
    private mannaContract?: Contract;
    private claimMannaContract?: Contract;
    private initializing: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

    constructor(private metamaskService: MetamaskService) {
        this.metamaskService.account$.pipe(
            takeUntilDestroyed(),
            switchMap(walletAddress => {
                this.initializing.next(true);
                if (walletAddress == null) {
                    return of(null);
                }
                const provider = new ethers.BrowserProvider(window.ethereum as any);
                return from(provider.getSigner());
            }),
        ).subscribe({
            next: (signer) => {
                if (signer == null) return;
                this.mannaContract = new Contract(mannaContractAddress, mannaContractABI, signer);
                this.claimMannaContract = new Contract(claimMannaContractAddress, claimMannaContractABI, signer);
                this.initializing.next(false);
            },
            error: (error) => {
                console.error('Error initializing contracts:', error);
                this.initializing.next(false);
            }
        });
    }

    balanceOf(): Observable<number> {
        if (!this.mannaContract) {
            return of(0);
        }
        return from(this.mannaContract['balanceOf'](this.metamaskService.account$.value)).pipe(
            map((balance: any) => parseInt(balance.toString()) / 1e18),
            catchError((error) => {
                console.error('Error fetching balance:', error);
                return of(0);
            })
        );
    }

    getUserScore(userAddress: string): Observable<UserScore | undefined> {
        return from(this.claimMannaContract!['userScores'](userAddress)).pipe(
            map(response => {
                const timestamp = parseInt(response[0].toString());
                if (timestamp == 0) return undefined;
                const score = parseInt(response[1].toString());
                return { timestamp, score };
            }),
            catchError((error) => {
                console.error('Error fetching user score:', error);
                return of(undefined);
            })
        );
    }

    getScoreThreshold(): Observable<number> {
        if (!this.initializing.value) {
            return from(this.claimMannaContract!['scoreThreshold']()).pipe(
                map((threshold: any) => parseInt(threshold.toString()) / 1e6),
                catchError((error) => {
                    console.error('Error fetching score threshold:', error);
                    return of(7);
                })
            );
        } else {
            return this.initializing.pipe(
                filter((value: boolean) => !value),
                switchMap(() => from(this.claimMannaContract!['scoreThreshold']()).pipe(
                    map((threshold: any) => parseInt(threshold.toString()) / 1e6),
                    catchError((error) => {
                        console.error('Error fetching score threshold:', error);
                        return of(7);
                    })
                )),
            );
        }
    }

    submitUserScore(address: string, scoreData: any): Observable<void> {
        return from(this.claimMannaContract!['submitScore'](
            scoreData.score,
            [
                scoreData.timestamp,
                scoreData.signature.v,
                scoreData.signature.r,
                scoreData.signature.s,
            ],
        )).pipe(
            switchMap(tx => from(tx.wait()) as Observable<void>),
            catchError((error) => {
                console.error('Error submitting user score:', error);
                return throwError(error);
            })
        );
    }

    claimWithSigsContract(signatures: Signature[]): Observable<void> {
        return from(this.claimMannaContract!['claimWithSigs'](signatures)).pipe(
            switchMap(tx => from(tx.wait()) as Observable<void>),
            catchError((error) => {
                console.error('Error claiming with signatures:', error);
                return throwError(error);
            })
        );
    }
}
