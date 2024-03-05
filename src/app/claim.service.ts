import {EventEmitter, Injectable} from '@angular/core'
import {MetamaskService} from './metamask.service'
import {MannaService} from './manna.service'
import {ContractService} from './contract.service'
import {TuiAlertService} from '@taiga-ui/core'
import {EMPTY, Subscription} from 'rxjs'

@Injectable({
    providedIn: 'root',
})
export class ClaimService {
    onClaimSuccess: EventEmitter<void> = new EventEmitter()

    constructor(
        private metamaskService: MetamaskService,
        private mannaService: MannaService,
        private contractService: ContractService,
        private alertService: TuiAlertService,
    ) {
    }

    claimDailyReward(walletAddress: string, successCallback: () => void, errorCallback: (errorMessage: string) => void): Subscription {
        const timestamp = Math.floor(Date.now() / 1000)
        const message = `Check-in\naddress: ${walletAddress}\ntimestamp: ${timestamp}`

        return this.metamaskService.signMessage(message).subscribe(
            signature => {
                return this.mannaService.sendCheckIn(walletAddress, signature, timestamp).subscribe(
                    () => {
                        this.onClaimSuccess.emit()
                        successCallback()
                    },
                    error => {
                        console.error("Failed to Claim. Please try again.", error)
                    },
                )
            },
            error => {
                console.error("Failed to sign the Claim message. Please try again.", error)
            },
        )
    }


    claimWithSignatures(walletAddress: string, successCallback: () => void, errorCallback: (errorMessage: string) => void): Subscription {
        const timestamp = Math.floor(Date.now() / 1000)
        const message = `Request for check-in signatures\naddress: ${walletAddress}\ntimestamp: ${timestamp}`
    
        console.log('Signing message:', message)
    
        return this.metamaskService.signMessage(message).subscribe(
            signature => {
                console.log('Signature received:', signature)
    
                return this.mannaService.sendClaimWithSig(walletAddress, signature, timestamp).subscribe(
                    serverResponse => {
                        console.log('Server response:', serverResponse)
    
                        if (serverResponse.status === 'ok' && serverResponse.signatures) {
                            const formattedSignatures = serverResponse.signatures.map((sig: any) => {
                                return [sig.day, sig.signature.v, sig.signature.r, sig.signature.s]
                            })

                            const formattedForContract = formattedSignatures.map((sig: any) => {
                                return [sig[0], sig[1], `${sig[2]}`, `${sig[3]}`]
                            })
    
                            console.log('Formatted for Contract:', formattedForContract)
    
                            return this.contractService.claimWithSigsContract(formattedForContract).subscribe(
                                () => {
                                    successCallback()
                                },
                                contractError => {
                                    console.error('Contract error:', contractError)
                                    errorCallback('Failed to claim on smart contract with signatures.')
                                },
                            )
                        } else {
                            errorCallback(`Error: ${serverResponse?.msg || 'Invalid server response'}`)
                            return EMPTY.subscribe()
                        }
                    },
                    serverError => {
                        console.error('Server error on sending claim request:', serverError)
                        errorCallback('Failed to send claim request.')
                        return EMPTY.subscribe()
                    },
                )
            },
            signError => {
                console.error('Error signing message:', signError) // Log errors during the signing process
                errorCallback('Failed to sign the claim message.')
                return EMPTY.subscribe()
            },
        )
    }
    


}
