import {ChangeDetectorRef, Component, Inject, Injector, OnDestroy, OnInit} from '@angular/core'
import {MetamaskService, MetamaskState} from 'src/app/metamask.service'
import {VerifyService, VerifyState} from '../../verify.service'
import {TuiAlertService, TuiDialogService, tuiLoaderOptionsProvider} from '@taiga-ui/core'
import {TuiMobileDialogService} from '@taiga-ui/addon-mobile'
import {TUI_IS_IOS} from '@taiga-ui/cdk'
import {PolymorpheusComponent} from '@tinkoff/ng-polymorpheus'
import {DailyRewardDialogComponent} from './daily-reward-dialog/daily-reward-dialog.component'
import {ContractService} from '../../contract.service'
import {Subscription} from 'rxjs'
import {MannaService} from '../../manna.service'
import {ClaimService} from '../../claim.service'


interface Transaction {
    type: 'withdraw' | 'receive';
    date: Date;
    amount: number;
    result: 'complete' | 'canceled' | 'pending';
}

@Component({
    selector: 'app-wallet',
    templateUrl: './wallet.component.html',
    styleUrls: ['./wallet.component.scss'],
    providers: [
        {
            provide: TUI_IS_IOS,
            useValue: false,
        },
        tuiLoaderOptionsProvider({
            inheritColor: true,
            overlay: true,
        }),
    ],
})
export class WalletComponent implements OnInit, OnDestroy {
    balance: number | null = null
    MetamaskState = MetamaskState
    walletAddress: string | null = null
    claimDailyLoader: boolean = false
    mannabaseBalance: number | null = null
    VerifyState = VerifyState
    claimableAmount: number | null = null
    private accountSubscription: Subscription | undefined

    constructor(
        readonly metamaskService: MetamaskService,
        readonly dialogService: TuiDialogService,
        readonly injector: Injector,
        readonly verifyService: VerifyService,
        readonly alertService: TuiAlertService,
        private readonly alerts: TuiAlertService,
        private cdRef: ChangeDetectorRef,
        readonly contractService: ContractService,
        private mannaService: MannaService,
        private claimService: ClaimService,
    ) {
    }

    ngOnInit() {
        this.metamaskService.connectWallet()
        this.accountSubscription = this.metamaskService.account$.subscribe(address => {
            this.walletAddress = address
            this.fetchClaimableAmount()
            this.fetchBalances()
        })
    }

    ngOnDestroy() {
        this.accountSubscription?.unsubscribe()
    }

    private fetchBalances() {
        if (this.walletAddress) {
            this.contractService.balanceOf(this.walletAddress).subscribe(
                contractBalance => {
                    if (contractBalance) {
                        this.balance = parseFloat(contractBalance)
                    }
                },
            )
            this.fetchMannabaseBalance()
        }
    }

    private fetchClaimableAmount() {
        if (this.walletAddress) {
            this.mannaService.getClaimableAmount(this.walletAddress).subscribe(
                {
                    next: response => {
                        if (response && response.status === 'ok') {
                            this.claimableAmount = response.toClaim
                        } else {
                            this.claimableAmount = null
                        }
                    },
                    error: error => {
                        console.error('Error fetching claimable amount:', error)
                        this.claimableAmount = null
                    },
                },
            )
        }
    }

    private fetchMannabaseBalance() {
        if (this.walletAddress) {
            this.mannaService.getMannabaseBalance(this.walletAddress).subscribe(
                response => {
                    if (response && response.status === 'ok') {
                        console.log('Mannabase balance fetched:', response.balance)
                        this.mannabaseBalance = response.balance
                        this.cdRef.detectChanges()
                    }
                },
                error => {
                    console.error('Error fetching mannabase balance:', error)
                },
            )
        }
    }

    claimDailyReward(): void {
        this.claimDailyLoader = true
        const subscription = this.claimService.claimDailyReward(
            this.walletAddress!,
            () => {
                this.alertService.open('Daily reward claimed successfully.', {status: 'success'}).subscribe()
                this.fetchClaimableAmount()
                this.fetchBalances()
                this.fetchMannabaseBalance()
            },
            (errorMessage) => {
                this.alertService.open(errorMessage, {status: 'error'}).subscribe()
            },
        )

        subscription.add(() => this.claimDailyLoader = false)
    }

    claimWithSignatures(): void {
        this.claimDailyLoader = true
        const subscription = this.claimService.claimWithSignatures(
            this.walletAddress!,
            () => {
                this.alertService.open('Claim with signatures successful.', {status: 'success'}).subscribe()
            },
            (errorMessage) => {
                this.alertService.open(errorMessage, {status: 'error'}).subscribe()
            },
        )

        subscription.add(() => this.claimDailyLoader = false)
    }

    openRewardDialog() {
        this.dialogService.open(new PolymorpheusComponent(DailyRewardDialogComponent, this.injector), {
            data: {claimableAmount: this.claimableAmount},
        }).subscribe()
    }
}
