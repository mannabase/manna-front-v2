import {Injectable} from '@angular/core'
import {BehaviorSubject, Observable, Subscription, throwError} from 'rxjs'
import {catchError, switchMap, tap} from 'rxjs/operators'
import {ContractService} from './contract.service'
import {MetamaskService} from './metamask.service'
import {MannaService} from './manna.service'
import {TuiAlertService} from "@taiga-ui/core"

export enum VerifyState {
    NOT_VERIFIED = 'NOT_VERIFIED',
    EXPIRED = 'EXPIRED',
    VERIFIED = 'VERIFIED',
}

export interface localScoreData {
    timestamp: number;
    score: number;
}

@Injectable({
    providedIn: 'root',
})
export class VerifyService {
    private verificationStateSubject = new BehaviorSubject<VerifyState>(VerifyState.NOT_VERIFIED)
    verificationState$ = this.verificationStateSubject.asObservable()

    private contractScoreSource = new BehaviorSubject<number | undefined>(undefined)
    contractScore$ = this.contractScoreSource.asObservable()

    private serverScoreSource = new BehaviorSubject<number | null>(null)
    serverScore$ = this.serverScoreSource.asObservable()

    private thresholdSource = new BehaviorSubject<number | undefined>(undefined)
    threshold$ = this.thresholdSource.asObservable()

    walletAddress: string | null = null
    accountSubscription: Subscription = new Subscription()
    serverScoreSignature?: string

    constructor(
        private contractService: ContractService,
        private metamaskService: MetamaskService,
        private mannaService: MannaService,
        private readonly alertService: TuiAlertService,
    ) {
        this.accountSubscription = this.metamaskService.account$.subscribe((address) => {
            this.walletAddress = address
            if (address)
                this.updateVerificationState()
        })

        this.serverScoreSource.subscribe(score => {
                if (score != null) {
                    localStorage.setItem('localScore', JSON.stringify({
                        timestamp: Date.now(),
                        score: score,
                    }))
                }
            },
        )
    }

    public updateVerificationState() {
        this.contractService.getScoreThreshold()
            .pipe(
                tap(threshold => this.thresholdSource.next(threshold)),
                switchMap(value => this.contractService.getUserScore(this.walletAddress!)),
            )
            .subscribe({
                next: (scoreObj) => {
                    this.contractScoreSource.next(scoreObj?.score)
                    if (scoreObj != null) {
                        const oneMonthAgo = Date.now() - (30 * 24 * 60 * 60 * 1000) // 30 days in milliseconds
                        const scoreDate = new Date(scoreObj.timestamp)
                        if (scoreDate.getTime() < oneMonthAgo) {
                            if (scoreObj.score > this.thresholdSource.value!)
                                this.verificationStateSubject.next(VerifyState.VERIFIED)
                            else
                                this.verificationStateSubject.next(VerifyState.NOT_VERIFIED)
                        } else
                            this.verificationStateSubject.next(VerifyState.EXPIRED)
                    } else
                        this.verificationStateSubject.next(VerifyState.NOT_VERIFIED)
                },
            })
    }

    updateServerScore(): Observable<any> {
        const timestamp = Math.floor(Date.now() / 1000)
        return this.getVerificationSignatureFromUser()
            .pipe(
                tap(signature => this.serverScoreSignature = signature),
                switchMap(signature =>
                    this.mannaService.getGitcoinScore(this.walletAddress!, this.serverScoreSignature!, timestamp),
                ),
                tap(response => this.serverScoreSource.next(response.data.score)),
            )
    }

    sendScoreToContract(walletAddress: string): Observable<void> {
        if (!walletAddress) {
            console.error('No wallet address available.')
            return throwError('No wallet address provided')
        }

        const timestamp = Math.floor(Date.now() / 1000)

        return this.getVerificationSignatureFromUser().pipe(
            switchMap(signature => {
                if (!signature) {
                    throw new Error('No signature received.')
                }
                return this.mannaService.getGitcoinScore(walletAddress, signature, timestamp)
            }),
            switchMap(serverResponse => {
                return this.contractService.submitUserScore(walletAddress, serverResponse.data)
            }),
            tap(() => {
                console.log('Score submitted and updated successfully.')
            }),
            catchError(error => {
                console.error('Error during score submission:', error)
                return throwError(error)
            }),
        )
    }

    getVerificationSignatureFromUser(): Observable<string> {
        const timestamp = Math.floor(Date.now() / 1000)
        const address = this.metamaskService.account$.value
        const message = `Verification request\naddress: ${address}\ntimestamp: ${timestamp}`

        console.log('Requesting signature for message:', message)

        return this.metamaskService.signMessage(message).pipe(
            tap(signature => {
                console.log('Message signed:', signature)
                this.alertService.open('Message successfully signed.', {
                    status: 'success',
                    label: 'Success',
                }).subscribe()
            }),
            catchError(error => {
                console.error('Error signing message:', error)
                this.alertService.open('Failed to sign the message. Please try again.', {
                    status: 'error',
                    label: 'Error',
                }).subscribe()
                return throwError(error)
            }),
        )
    }
}
