import { EventEmitter, Injectable } from '@angular/core';
import { MetamaskService } from './metamask.service';
import { MannaService } from './manna.service';
import { ContractService } from './contract.service';
import { TuiAlertService } from '@taiga-ui/core';
import { Observable, throwError } from 'rxjs';
import { switchMap, tap, catchError } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class ClaimService {
    onClaimSuccess: EventEmitter<void> = new EventEmitter();

    constructor(
        private metamaskService: MetamaskService,
        private mannaService: MannaService,
        private contractService: ContractService,
        private alertService: TuiAlertService
    ) {}

    claimDailyReward(walletAddress: string): Observable<void> {
        const timestamp = Math.floor(Date.now() / 1000);
        const message = `Check-in\naddress: ${walletAddress}\ntimestamp: ${timestamp}`;

        return this.metamaskService.signMessage(message).pipe(
            switchMap((signature) => {
                return this.mannaService
                    .sendCheckIn(walletAddress, signature, timestamp)
                    .pipe(
                        tap(() => {
                            this.onClaimSuccess.emit();
                        }),
                        catchError((error) => {
                            console.error(
                                'Failed to Claim. Please try again.',
                                error
                            );
                            return throwError(error);
                        })
                    );
            }),
            catchError((error) => {
                console.error(
                    'Failed to sign the Claim message. Please try again.',
                    error
                );
                return throwError(error);
            })
        );
    }

    claimWithSignatures(walletAddress: string): Observable<void> {
        const timestamp = Math.floor(Date.now() / 1000);
        const message = `Request for check-in signatures\naddress: ${walletAddress}\ntimestamp: ${timestamp}`;

        console.log('Signing message:', message);

        return this.metamaskService.signMessage(message).pipe(
            switchMap((signature) => {
                console.log('Signature received:', signature);
                return this.mannaService
                    .sendClaimWithSig(walletAddress, signature, timestamp)
                    .pipe(
                        switchMap((serverResponse) => {
                            console.log('Server response:', serverResponse);
                            if (
                                serverResponse.status === 'ok' &&
                                serverResponse.signatures
                            ) {
                                const formattedForContract = serverResponse.signatures.map((sig: any) => {
                                    return [
                                        sig.day,
                                        sig.signature.v,
                                        `${sig.signature.r}`,
                                        `${sig.signature.s}`,
                                    ];
                                });
                                console.log('Formatted for Contract:', formattedForContract);
                                
                                return this.contractService
                                    .claimWithSigsContract(formattedForContract)
                                    .pipe(
                                        catchError((contractError) => {
                                            console.error(
                                                'Contract error:',
                                                contractError
                                            );
                                            return throwError(
                                                'Failed to claim on smart contract with signatures.'
                                            );
                                        })
                                    );
                            } else {
                                return throwError(
                                    `Error: ${
                                        serverResponse?.msg ||
                                        'Invalid server response'
                                    }`
                                );
                            }
                        }),
                        catchError((serverError) => {
                            console.error(
                                'Server error on sending claim request:',
                                serverError
                            );
                            return throwError('Failed to send claim request.');
                        })
                    );
            }),
            catchError((signError) => {
                console.error('Error signing message:', signError);
                return throwError('Failed to sign the claim message.');
            })
        );
    }
}
