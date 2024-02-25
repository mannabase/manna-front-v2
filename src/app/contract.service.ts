import {Injectable} from '@angular/core'
import {Contract, ethers} from 'ethers'
import {BehaviorSubject, from, Observable, of, switchMap, throwError} from 'rxjs'
import {catchError, filter, map, tap} from 'rxjs/operators'
import {MetamaskService} from './metamask.service'
import {TuiAlertService} from '@taiga-ui/core'
import {claimMannaContractABI, claimMannaContractAddress, mannaContractABI, mannaContractAddress} from './config'
import {takeUntilDestroyed} from "@angular/core/rxjs-interop"


@Injectable({
    providedIn: 'root',
})
export class ContractService {
    private mannaContract?: Contract
    private claimMannaContract?: Contract
    private initializing: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false)

    constructor(
        private metamaskService: MetamaskService,
        private alertService: TuiAlertService,
    ) {
        this.metamaskService.account$.pipe(
            takeUntilDestroyed(),
            switchMap(walletAddress => {
                this.initializing.next(true)
                if (walletAddress == null)
                    return of(null)
                const provider = new ethers.BrowserProvider(window.ethereum)
                return from(provider.getSigner())
            }),
        ).subscribe((signer) => {
            if (signer == null)
                return
            this.mannaContract = new Contract(
                mannaContractAddress,
                mannaContractABI,
                signer,
            )
            this.claimMannaContract = new Contract(
                claimMannaContractAddress,
                claimMannaContractABI,
                signer,
            )
            this.initializing.next(false)
        })
    }

    balanceOf(walletAddress: string): Observable<string> {
        if (!this.initializing.value) {
            return from(this.mannaContract!['balanceOf'](walletAddress))
        } else {
            return this.initializing.pipe(
                filter(value => !value),
                switchMap(value => {
                    return from(this.mannaContract!['balanceOf'](walletAddress))
                }),
                map(balance => ethers.formatEther(balance)),
            )
        }
    }

    getUserScore(userAddress: string): Observable<{ timestamp: number, score: number } | undefined> {
        return from(this.claimMannaContract!['userScores'](userAddress).then(response => {
            const timestamp = parseInt(response[0].toString())
            if (timestamp == 0)
                return undefined
            const score = parseInt(response[1].toString())
            return {timestamp, score}
        }))
    }

    getScoreThreshold(): Observable<number> {
        if (!this.initializing.value) {
            return from(this.claimMannaContract!['scoreThreshold']())
        } else {
            return this.initializing.pipe(
                filter(value => !value),
                switchMap(value => {
                    return from(this.claimMannaContract!['scoreThreshold']())
                }),
                map(threshold => parseInt(threshold.toString())),
            )
        }
    }

    submitUserScore(address: string, scoreData: any): Observable<void> {
        if (!scoreData.signature) {
            console.error('No signature in score data')
            return throwError('No signature in score data')
        }

        return from(this.claimMannaContract!['submitScore'](
            scoreData.score,
            [scoreData.timestamp,
                scoreData.signature.v,
                scoreData.signature.r,
                scoreData.signature.s],
        ).then(tx => tx.wait())).pipe(
            tap(() => this.alertService.open('Score submitted successfully.', {
                status: 'success',
                label: 'Success',
            }).subscribe()),
            catchError(error => {
                console.error('Error submitting score to contract:', error)
                this.alertService.open('Failed to submit score.', {status: 'error', label: 'Error'}).subscribe()
                return throwError(error)
            }),
        )
    }

    claimWithSigsContract(signatures: Array<[number, number, string, string]>): Observable<void> {
        console.log('claimWithSigsContract called with signatures:', signatures)
        if (!this.claimMannaContract) {
            console.error('Claim Manna Contract not initialized')
            return throwError('Contract not initialized')
        }

        return from(this.claimMannaContract!['claimWithSigs'](signatures).then(tx => tx.wait())).pipe(
            tap(() => this.alertService.open('Claim with signatures successful.', {
                status: 'success',
                label: 'Success',
            }).subscribe()),
            catchError(error => {
                console.error('Error claiming with signatures on smart contract:', error)
                this.alertService.open(`Failed to claim with signatures on smart contract. Error: ${error.message}`, {
                    status: 'error',
                    label: 'Error',
                }).subscribe()
                return throwError(error)
            }),
        )
    }

//   claimWithSigsContract(signatures: Signature[]): Observable<void> {
//     if (!this.claimMannaContract) {
//         console.error('ClaimManna contract is not initialized');
//         return throwError('Contract not initialized');
//     }

//     const method = this.claimMannaContract['claimWithSigs'];
//     if (typeof method !== 'function') {
//         console.error('claimWithSigs is not a function');
//         return throwError('Invalid method');
//     }
//     const formattedSignatures = signatures.map(sig => {
//       if (!sig.timestamp || !sig.v || !sig.r || !sig.s) {
//           console.error('Incomplete signature data:', sig);
//           throw new Error('Incomplete signature data');
//       }
//       return [sig.timestamp.toString(), sig.v, sig.r, sig.s];
//   });

//     return from(method(formattedSignatures).then(tx => tx.wait())).pipe(
//         tap(() => this.alertService.open('Claim processed successfully.', { status: 'success', label: 'Success' }).subscribe()),
//         catchError(error => {
//             console.error('Error processing claim on contract:', error);
//             this.alertService.open('Failed to process claim on contract.', { status: 'error', label: 'Error' }).subscribe();
//             return throwError(error);
//         })
//     );
// }

}
