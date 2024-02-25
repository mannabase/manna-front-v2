import {ChangeDetectorRef, Component, Inject, OnInit} from '@angular/core'
import {MetamaskService} from '../../metamask.service'
import {MannaService} from '../../manna.service'
import {Router} from '@angular/router'
import {TuiDialogContext} from '@taiga-ui/core'
import {POLYMORPHEUS_CONTEXT} from '@tinkoff/ng-polymorpheus'


@Component({
    selector: 'app-claim-manna',
    templateUrl: './claim-manna.component.html',
    styleUrls: ['./claim-manna.component.scss'],
})
export class ClaimMannaComponent implements OnInit {
    walletAddress: string | null = null
    loader: boolean = false
    successMessage: boolean = false
    claimableAmount: number | null = null
    claimDailyLoader: boolean = false

    constructor(
        private metamaskService: MetamaskService,
        private mannaService: MannaService,
        private cdRef: ChangeDetectorRef,
        private router: Router,
        @Inject(POLYMORPHEUS_CONTEXT) readonly context: TuiDialogContext<number, number>,
    ) {
    }

    ngOnInit() {
        this.metamaskService.account$.subscribe(address => {
            this.walletAddress = address
        })
        this.fetchClaimableAmount()
    }

    private fetchClaimableAmount() {
        this.claimDailyLoader = true
        if (this.walletAddress) {
            this.mannaService.getClaimableAmount(this.walletAddress).subscribe(
                response => {
                    this.claimDailyLoader = false
                    if (response && response.status === 'ok') {
                        this.claimableAmount = response.toClaim
                        console.log('claimableAmount', this.claimableAmount)
                        if (this.claimableAmount === 0) {
                            this.successMessage = true
                        }
                    } else {
                        this.claimableAmount = null
                    }
                    this.cdRef.detectChanges()
                },
                error => {
                    this.claimDailyLoader = false
                    console.error('Error fetching claimable amount:', error)
                    this.claimableAmount = null
                },
            )
        }
    }

    claimDailyReward(): void {
        this.loader = true

        if (!this.walletAddress) {
            console.error("Please connect to a wallet first.")
            this.loader = false
            return
        }

        const timestamp = Math.floor(Date.now() / 1000)
        const message = `Check-in\naddress: ${this.walletAddress}\ntimestamp: ${timestamp}`

        this.metamaskService.signMessage(message).subscribe(
            signature => {
                this.mannaService.sendCheckIn(this.walletAddress as string, signature, timestamp).subscribe(
                    serverResponse => {
                        this.successMessage = true
                        console.log("Claim successful:", serverResponse)
                    },
                    error => {
                        console.error("Failed to claim. Please try again.", error)
                    },
                )
            },
            error => {
                console.error("Failed to sign the Claim message. Please try again.", error)
            },
        ).add(() => this.loader = false)
    }

    openWallet() {
        this.router.navigate(['account'])
        this.context.completeWith(0)

    }
}
