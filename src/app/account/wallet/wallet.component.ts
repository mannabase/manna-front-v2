import {ChangeDetectorRef, Component, Inject, Injector, Input, OnInit} from '@angular/core'
import {MetamaskBrightIdService, MetamaskState} from 'src/app/metamask-bright-id.service'
import {UserClaimingState, UserService} from '../../user.service'
import {ethers} from 'ethers'
import {TuiAlertService, TuiDialogService} from '@taiga-ui/core'
import {TuiMobileDialogService} from '@taiga-ui/addon-mobile'
import {TUI_IS_IOS} from '@taiga-ui/cdk'
import {PolymorpheusComponent} from '@tinkoff/ng-polymorpheus'
import {DailyRewardDialogComponent} from './daily-reward-dialog/daily-reward-dialog.component'
import {mannaChainName ,mannaContractAddress} from "../../config"
import { ContractService } from '../../contract.service';
import { Subscription } from 'rxjs';

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
    ],
})
export class WalletComponent implements OnInit {
    balance: string | null = null
    showWalletPage = false
    showPanel = false
    state = MetamaskState.NOT_CONNECTED
    @Input() showBanner: boolean = false
    MetamaskState = MetamaskState
    mannaChain = mannaChainName
    walletAddress: string | null = null
    private accountSubscription: Subscription | undefined;
    buttonMessageMap = new Map<UserClaimingState, string>([
        [UserClaimingState.ZERO, 'Connect Metamask'],
        [UserClaimingState.METAMASK_CONNECTED, 'Change to ID Chain'],
        [UserClaimingState.CORRECT_CHAIN, 'Verify'],
        [UserClaimingState.VERIFIED, 'Enter email'],
        [UserClaimingState.READY, 'Claim'],
    ])
    sortColumn: keyof Transaction | null = null
    sortDirection: number = 1
    
    transactions: Transaction[] = [
        {
            type: 'receive',
            date: new Date('2023-12-04'),
            amount: 50,
            result: 'pending',
        },
        {
            type: 'receive',
            date: new Date('2023-12-02'),
            amount: 50,
            result: 'pending',
        },
        {
            type: 'withdraw',
            date: new Date('2023-12-01'),
            amount: 100,
            result: 'complete',
        },
        {
            type: 'withdraw',
            date: new Date('2023-10-14'),
            amount: 100,
            result: 'complete',
        },
    ]
    filteredTransactions: Transaction[] = this.transactions

    dateFilter: 'today' | 'week' | 'month' | 'all' = 'all'
    typeFilter: 'withdraw' | 'receive' | 'all' = 'all'
    connectedToMetamask: boolean = false
    

    constructor(
        readonly metamaskBrightIdService: MetamaskBrightIdService,
        readonly dialogService: TuiDialogService,
        readonly injector: Injector,
        readonly userService: UserService,
        readonly alertService: TuiAlertService,
        private readonly alerts: TuiAlertService,
        private cdRef: ChangeDetectorRef,
        @Inject(TuiMobileDialogService)
        private readonly dialogs: TuiMobileDialogService,
        private readonly contractService: ContractService,
    ) {
    }

    ngOnInit() {
        this.updateState();
        this.subscribeToAccount();
        this.fetchContractBalance();
      }
    ngOnDestroy() {
        if (this.accountSubscription) {
          this.accountSubscription.unsubscribe();
        }
      }
      private subscribeToAccount() {
        this.accountSubscription = this.metamaskBrightIdService.account$.subscribe((address) => {
          this.walletAddress = address;
          console.log('Wallet address updated:', address);
          if (address) {
            this.fetchContractBalance();
          }
        });
      }

    updateState() {
        this.metamaskBrightIdService.checkMetamaskState().subscribe({
            next: (value) => {
                console.log('Metamask state:', value)
                if (value === MetamaskState.READY) {
                    this.state = value
                    this.connectedToMetamask = true
                } else if (
                    value === MetamaskState.NOT_CONNECTED ||
                    value === MetamaskState.NOT_INSTALLED
                ) {
                    this.state = value
                    this.connectedToMetamask = false
                } else {
                    this.state = value
                    this.connectedToMetamask = false
                }
            },
        })
    }

    toggleWalletPage() {
        this.showWalletPage = !this.showWalletPage
    }
    async fetchContractBalance() {
        try {
          if (!this.walletAddress) {
            console.error('Wallet address not available');
            return;
          }
        
          console.log('Sending wallet address to contract:', this.walletAddress);
          const contractBalance = await this.contractService.balanceOf(this.walletAddress);
          console.log('Contract response - Balance:', contractBalance);
        
          this.balance = contractBalance;
        } catch (error) {
          console.error('Error fetching contract balance:', error);
        }
      }

    Claim(result: string): void {
        this.alerts.open(result).subscribe()
    }

    openMetamaskExtension() {
        if (typeof window.ethereum === 'undefined') {
            this.alertService
                .open(
                    'Metamask is not installed. Please install Metamask and try again.',
                    {
                        status: 'error',
                    },
                )
                .subscribe()
            window.open('https://metamask.io/')
            return
        }

        this.metamaskBrightIdService.connect().subscribe({
            next: account => {
                this.alertService.open("Connected to account: " + account, {
                    status: "success",
                }).subscribe()
                this.state = MetamaskState.CONNECTED
                this.updateState()
            },
            error: (err) => {
                this.alertService.open("Failed to connect Metamask", {
                    status: "error",
                }).subscribe()
                this.state = MetamaskState.NOT_CONNECTED
            },
        })
    }

    switchChain() {
        this.metamaskBrightIdService.switchToMannaChain().subscribe({
            next: value => {
                this.alertService.open("Chain Switched to " + mannaChainName, {
                    status: "success",
                }).subscribe()
                this.state = MetamaskState.READY
                this.showPanel = true
            },
            error: err => {
                this.alertService.open("Failed to switch chain", {
                    status: "error",
                }).subscribe()
            },
        })
    }

    show(): void {
        this.dialogs
            .open(
                new PolymorpheusComponent(
                    DailyRewardDialogComponent,
                    this.injector,
                ),
                // {
                //     dismissible: true,
                // }
            )
            // .pipe(switchMap(index => this.alerts.open(`Selected: ${actions[index]}`)))
            .subscribe()
    }

    sortData(column: keyof Transaction): void {
        if (this.sortColumn === column) {
            this.sortDirection *= -1
        } else {
            this.sortColumn = column
            this.sortDirection = 1
        }

        this.transactions.sort((a, b) => {
            return (a[column] < b[column] ? -1 : 1) * this.sortDirection
        })
    }

    filterTransactions(): void {
        const today = new Date()
        const oneWeekAgo = new Date(today)
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
        const oneMonthAgo = new Date(today)
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)

        this.filteredTransactions = this.transactions.filter((transaction) => {
            const isDateValid =
                (this.dateFilter === 'today' &&
                    transaction.date.toDateString() === today.toDateString()) ||
                (this.dateFilter === 'week' &&
                    transaction.date >= oneWeekAgo) ||
                (this.dateFilter === 'month' &&
                    transaction.date >= oneMonthAgo) ||
                this.dateFilter === 'all'

            const isTypeValid =
                this.typeFilter === 'all' ||
                transaction.type === this.typeFilter

            return isDateValid && isTypeValid
        })
    }
}
