import {ChangeDetectorRef, Component, Inject, Injector, Input, OnInit} from '@angular/core'
import {MetamaskBrightIdService, MetamaskState} from 'src/app/metamask-bright-id.service'
import {VerifyState, VerifyService} from '../../verify.service'
import {ethers} from 'ethers'
import {TuiAlertService, TuiDialogService} from '@taiga-ui/core'
import {TuiMobileDialogService} from '@taiga-ui/addon-mobile'
import {TUI_IS_IOS} from '@taiga-ui/cdk'
import {PolymorpheusComponent} from '@tinkoff/ng-polymorpheus'
import {DailyRewardDialogComponent} from './daily-reward-dialog/daily-reward-dialog.component'
import {mannaChainName ,mannaContractAddress} from "../../config"
import { ContractService } from '../../contract.service';
import { Subscription } from 'rxjs';
import { MannaService } from '../../manna.service';

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
    sortColumn: keyof Transaction | null = null
    sortDirection: number = 1
    claimDailyLoader:boolean =false
    
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
        readonly verifyService: VerifyService,
        readonly alertService: TuiAlertService,
        private readonly alerts: TuiAlertService,
        private cdRef: ChangeDetectorRef,
        @Inject(TuiMobileDialogService)
        private readonly dialogs: TuiMobileDialogService,
        private readonly contractService: ContractService,
        private mannaService: MannaService,
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
        this.accountSubscription = this.metamaskBrightIdService.account$.subscribe(address => {
            this.walletAddress = address;
            if (address) {
                this.fetchContractBalance();
                this.refreshUserScore();
            } else {
                console.log('Waiting for wallet address...');
            }
        });
    }
    private updateState() {
        this.metamaskBrightIdService.checkMetamaskState().subscribe(state => {
            this.state = state;
            this.showPanel = state === MetamaskState.READY;
            this.showWalletPage = state !== MetamaskState.READY && state !== MetamaskState.NOT_CONNECTED;
            this.cdRef.detectChanges();
        });
    }

    toggleWalletPage() {
        this.showWalletPage = !this.showWalletPage
    }
    private fetchContractBalance() {
        if (this.walletAddress) {
            this.contractService.balanceOf(this.walletAddress).subscribe(
                contractBalance => {
                    this.balance = contractBalance;
                    this.cdRef.detectChanges();
                },
                error => console.error('Error fetching contract balance:', error)
            );
        }
    }
    private refreshUserScore() {
        if (this.walletAddress) {
            
        } else {
            console.error('No wallet address available for fetching user score.');
        }
    }
      
    claimDailyReward(): void {
        this.claimDailyLoader=true;

        if (!this.walletAddress) {
            this.alertService.open("Please connect to a wallet first.", { status: 'warning' }).subscribe();
            this.claimDailyLoader=false;
            return;
        }
        const timestamp = Math.floor(Date.now() / 1000);
        const message = `Check-in\naddress: ${this.walletAddress}\ntimestamp: ${timestamp}`;
        this.metamaskBrightIdService.signMessage(message).subscribe(
            signature => {
                this.mannaService.sendCheckIn(this.walletAddress as string, signature, timestamp).subscribe(
                    serverResponse => {
                        console.log('Claim sent to server:', serverResponse);
                        this.alertService.open("Claim in mannabase is successful!", { status: 'success' }).subscribe();
                        this.claimDailyLoader=false;
                    },
                    error => {
                        console.error('Error sending Claim to server:', error);
                        this.alertService.open("Failed to Claim. Please try again.", { status: 'error' }).subscribe();
                        this.claimDailyLoader=false;
                    }
                );
            },
            error => {
                console.error('Error signing Claim message:', error);
                this.alertService.open("Failed to sign the Claim message. Please try again.", { status: 'error' }).subscribe();
                this.claimDailyLoader=false;
            }
        );
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
