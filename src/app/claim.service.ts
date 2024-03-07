import {Injectable} from '@angular/core'
import {MetamaskService} from './metamask.service'
import {MannaService} from './manna.service'
import {ContractService} from './contract.service'
import {Observable} from 'rxjs'
import {map, switchMap} from 'rxjs/operators'

@Injectable({
    providedIn: 'root',
})
export class ClaimService {

    constructor(
        private metamaskService: MetamaskService,
        private mannaService: MannaService,
        private contractService: ContractService,
    ) {
    }

    claimDailyReward(walletAddress: string): Observable<void> {
        const timestamp = Math.floor(Date.now() / 1000)
        const message = `Check-in\naddress: ${walletAddress.toLowerCase()}\ntimestamp: ${timestamp}`

        return this.metamaskService.signMessage(message).pipe(
            switchMap((signature) => {
                return this.mannaService.checkin(walletAddress, signature, timestamp)
            }),
        )
    }

    claimWithSignatures(walletAddress: string): Observable<void> {
        const timestamp = Math.floor(Date.now() / 1000)
        const message = `Request for check-in signatures\naddress: ${walletAddress.toLowerCase()}\ntimestamp: ${timestamp}`

        return this.metamaskService.signMessage(message)
            .pipe(
                switchMap((signature) => {
                        return this.mannaService
                            .claimWithSigs(walletAddress, signature, timestamp)
                            .pipe(
                                map((serverResponse) => {
                                    return serverResponse.signatures.map((sig: any) => {
                                        return [
                                            sig.day,
                                            sig.signature.v,
                                            `${sig.signature.r}`,
                                            `${sig.signature.s}`,
                                        ]
                                    })
                                }),
                                switchMap(signatures => {
                                    return this.contractService.claimWithSigsContract(signatures)
                                }),
                            )
                    },
                ),
            )
    }
}
