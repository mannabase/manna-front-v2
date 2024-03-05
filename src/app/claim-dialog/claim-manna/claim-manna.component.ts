import {ChangeDetectorRef, Component, Inject, OnInit} from '@angular/core'
import {MetamaskService} from '../../metamask.service'
import {MannaService} from '../../manna.service'
import {Router} from '@angular/router'
import {TuiDialogContext} from '@taiga-ui/core'
import {POLYMORPHEUS_CONTEXT} from '@tinkoff/ng-polymorpheus'
import {ClaimService} from '../../claim.service'
import {TuiAlertService} from '@taiga-ui/core'


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
        private claimService: ClaimService,
        readonly alertService: TuiAlertService,
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
        this.claimDailyLoader = true;
        this.claimService.claimDailyReward(this.walletAddress!).subscribe(
            () => {
                this.alertService.open('Daily reward claimed successfully.', { status: 'success' });
                this.successMessage = true
            },
            error => {
                console.error('Failed to claim daily reward:', error);
            }
        ).add(() => {
            this.claimDailyLoader = false;
        });
    }
    

    openWallet() {
        this.router.navigate(['account'])
        this.context.completeWith(0)

    }
}
