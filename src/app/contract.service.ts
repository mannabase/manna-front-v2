import {Injectable} from '@angular/core'
import {Contract, ethers} from 'ethers'
import {BehaviorSubject, from, Observable, of, switchMap} from 'rxjs'
import {filter, map} from 'rxjs/operators'
import {MetamaskService} from './metamask.service'
import {claimMannaContractABI, claimMannaContractAddress, mannaContractABI, mannaContractAddress} from './config'
import {takeUntilDestroyed} from "@angular/core/rxjs-interop"
import {Signature, UserScore} from "./types"


@Injectable({
    providedIn: 'root',
})
export class ContractService {
    private mannaContract?: Contract
    private claimMannaContract?: Contract
    private initializing: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false)

    constructor(
        private metamaskService: MetamaskService,
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
                .pipe(
                    map(balance => {
                        const formattedBalance = ethers.formatEther(balance);
                        return (parseFloat(formattedBalance) / 1000000).toString();
                    })
                );
        } else {
            return this.initializing.pipe(
                filter(value => !value),
                switchMap(value => {
                    return from(this.mannaContract!['balanceOf'](walletAddress))
                        .pipe(
                            map(balance => {
                                const formattedBalance = ethers.formatEther(balance);
                                return (parseFloat(formattedBalance) / 1000000).toString();
                            })
                        );
                }),
            );
        }
    }
    

    getUserScore(userAddress: string): Observable<UserScore | undefined> {
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
                .pipe(
                    map(threshold => parseInt(threshold.toString()) / 1000000)
                );
        } else {
            return this.initializing.pipe(
                filter(value => !value),
                switchMap(value => {
                    return from(this.claimMannaContract!['scoreThreshold']())
                        .pipe(
                            map(threshold => parseInt(threshold.toString()) / 1000000)
                        );
                }),
            );
        }
    }
    
    submitUserScore(address: string, scoreData: any): Observable<void> {
        console.log("Submitting user score data:", scoreData);
        return from(this.claimMannaContract!['submitScore'](
                scoreData.score,
                [
                    scoreData.timestamp,
                    scoreData.signature.v,
                    scoreData.signature.r,
                    scoreData.signature.s,
                ],
            ).then(tx => tx.wait()),
        )
    }

    claimWithSigsContract(signatures: Signature[]): Observable<void> {
        return from(this.claimMannaContract!['claimWithSigs'](signatures).then(tx => tx.wait()))
    }
}
