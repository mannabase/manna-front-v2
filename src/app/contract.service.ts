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
        // Initialize the contracts once we have a connected signer
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
                console.log('[ContractService] Contracts initialized.');
                this.initializing.next(false);
            },
            error: (error) => {
                console.error('[ContractService] Error initializing contracts:', error);
                this.initializing.next(false);
            }
        });
    }

    balanceOf(): Observable<number> {
        if (!this.mannaContract) {
            // Wait until initialization is complete
            return this.initializing.pipe(
                filter(initializing => !initializing),
                switchMap(() => from(this.mannaContract!['balanceOf'](this.metamaskService.account$.value))),
                tap(balance => {
                    console.log('[ContractService] Raw balance from contract:', balance);
                }),
                map((balance: any) => parseInt(balance.toString()) / 1e18),
                tap(parsedBalance => {
                    console.log(`[ContractService] Parsed balance: ${parsedBalance} Manna`);
                }),
                catchError((error) => {
                    console.error('[ContractService] Error fetching balance:', error);
                    return of(0);
                })
            );
        } else {
            // Already initialized
            return from(this.mannaContract['balanceOf'](this.metamaskService.account$.value)).pipe(
                tap(balance => {
                    console.log('[ContractService] Raw balance from contract:', balance);
                }),
                map((balance: any) => parseInt(balance.toString()) / 1e18),
                tap(parsedBalance => {
                    console.log(`[ContractService] Parsed balance: ${parsedBalance} Manna`);
                }),
                catchError((error) => {
                    console.error('[ContractService] Error fetching balance:', error);
                    return of(0);
                })
            );
        }
    }

    getUserScore(userAddress: string): Observable<UserScore | undefined> {
        console.log('[ContractService] getUserScore() called with address:', userAddress);
        return from(this.claimMannaContract!['userScores'](userAddress)).pipe(
            tap(response => {
                console.log('[ContractService] Raw user score response:', response);
            }),
            map(response => {
                const timestamp = parseInt(response[0].toString());
                if (timestamp === 0) return undefined;
                const score = parseInt(response[1].toString());
                const userScore = { timestamp, score };
                console.log('[ContractService] Parsed user score:', userScore);
                return userScore;
            }),
            catchError((error) => {
                console.error('[ContractService] Error fetching user score:', error);
                return of(undefined);
            })
        );
    }

    // For testing, return a fixed threshold
    getScoreThreshold(): Observable<number> {
        console.log('[ContractService] getScoreThreshold() returning mock 0.5');
        return of(0.5);
    }

    submitUserScore(address: string, scoreData: any): Observable<void> {
        console.log('[ContractService] submitUserScore() called with:', { address, scoreData });
        return from(
            this.claimMannaContract!['submitScore'](
                scoreData.score,
                [
                    scoreData.timestamp,
                    scoreData.signature.v,
                    scoreData.signature.r,
                    scoreData.signature.s,
                ],
            )
        ).pipe(
            tap(tx => {
                console.log('[ContractService] submitScore transaction sent. Waiting for receipt...', tx);
            }),
            switchMap(tx => from(tx.wait()) as Observable<void>),
            tap(receipt => {
                console.log('[ContractService] submitScore transaction confirmed, receipt:', receipt);
            }),
            catchError((error) => {
                console.error('[ContractService] Error submitting user score:', error);
                return throwError(() => error);
            })
        );
    }

    claimWithSigsContract(signatures: Signature[]): Observable<void> {
        console.log('[ContractService] claimWithSigsContract() called with signatures:', signatures);
        return from(this.claimMannaContract!['claimWithSigs'](signatures)).pipe(
            tap(tx => {
                console.log('[ContractService] claimWithSigs transaction sent. Waiting for receipt...', tx);
            }),
            switchMap(tx => from(tx.wait()) as Observable<void>),
            tap(receipt => {
                console.log('[ContractService] claimWithSigs transaction confirmed, receipt:', receipt);
            }),
            catchError((error) => {
                console.error('[ContractService] Error claiming with signatures:', error);
                return throwError(() => error);
            })
        );
    }
}
