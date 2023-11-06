import {
    Component,
    Injector,
    Inject,
    OnInit,
    ChangeDetectionStrategy,
    Input,
    ChangeDetectorRef,
} from '@angular/core';
import {
    MetamaskBrightIdService,
    MetamaskState,
} from 'src/app/metamask-bright-id.service';
import { UserClaimingState, UserService } from '../../user.service';
import { ethers } from 'ethers';
import { TuiAlertService, TuiDialogService } from '@taiga-ui/core';
import {TuiMobileDialogService} from '@taiga-ui/addon-mobile';
import {switchMap} from 'rxjs/operators';
import {TUI_IS_IOS} from '@taiga-ui/cdk';
import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { DailyRewardDialogComponent } from './daily-reward-dialog/daily-reward-dialog.component';
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
    balance: string | null = null;
    showWalletPage = false;
    showPanel = false;
    state = MetamaskState.NOT_CONNECTED;
    @Input() showBanner: boolean = false;
    buttonMessageMap = new Map<UserClaimingState, string>([
        [UserClaimingState.ZERO, 'Connect Metamask'],
        [UserClaimingState.METAMASK_CONNECTED, 'Change to ID Chain'],
        [UserClaimingState.CORRECT_CHAIN, 'Verify'],
        [UserClaimingState.VERIFIED, 'Enter email'],
        [UserClaimingState.READY, 'Claim'],
    ]);
    sortColumn: keyof Transaction | null = null;
    sortDirection: number = 1;
    transactions: Transaction[] = [
        {
            type: 'withdraw',
            date: new Date('2023-10-01'),
            amount: 100,
            result: 'complete',
        },
        {
            type: 'receive',
            date: new Date('2023-10-10'),
            amount: 50,
            result: 'pending',
        },
        {
            type: 'withdraw',
            date: new Date('2023-10-01'),
            amount: 100,
            result: 'complete',
        },
        {
            type: 'receive',
            date: new Date('2023-10-10'),
            amount: 50,
            result: 'pending',
        },
    ];
    filteredTransactions: Transaction[] = this.transactions; 

    dateFilter: 'today' | 'week' | 'month' | 'all' = 'all';
    typeFilter: 'withdraw' | 'receive' | 'all' = 'all';

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
    ) {}

    ngOnInit() {
        this.metamaskBrightIdService.balance$.subscribe((balance) => {
            this.balance = balance ? ethers.utils.formatEther(balance) : null;
        });

        this.metamaskBrightIdService.loadBalance();

        this.metamaskBrightIdService
            .checkMetamaskState()
            .subscribe((metamaskState) => {
                if (metamaskState === MetamaskState.CONNECTED) {
                    this.state = MetamaskState.READY;
                    this.showPanel = true;
                    this.cdRef.detectChanges();
                } else {
                    this.state = metamaskState;
                }
            });
    }

    updateState() {
        this.metamaskBrightIdService.checkMetamaskState().subscribe({
            next: (value) => {
                console.log('Metamask state:', value);
                if (value === MetamaskState.READY) {
                    this.state = value;
                    this.showPanel = true;
                } else if (
                    value === MetamaskState.NOT_CONNECTED ||
                    value === MetamaskState.NOT_INSTALLED
                ) {
                    this.state = value;
                    this.showPanel = false;
                } else {
                    this.state = value;
                }
            },
        });
    }
    toggleWalletPage() {
        this.showWalletPage = !this.showWalletPage;
    }
    Claim(result: string): void {
        this.alerts.open(result).subscribe();
    }
    openMetamaskExtension() {
        if (typeof window.ethereum === 'undefined') {
            this.alertService
                .open(
                    'Metamask is not installed. Please install Metamask and try again.',
                    {
                        status: 'error',
                    }
                )
                .subscribe();
            window.open('https://metamask.io/');
            return;
        }

        this.metamaskBrightIdService.connect().subscribe({
            next: (account) => {
                this.alertService
                    .open('Connected to account: ' + account, {
                        status: 'success',
                    })
                    .subscribe();
                this.showPanel = true;
                this.updateState();
            },
            error: (err) => {
                if (err.message === 'Metamask is not on the correct chain') {
                    this.alertService
                        .open(
                            'Please switch to the correct chain in Metamask',
                            {
                                status: 'warning',
                            }
                        )
                        .subscribe();
                    this.state = MetamaskState.WRONG_CHAIN;
                } else {
                    this.alertService
                        .open('Failed to connect Metamask', {
                            status: 'error',
                        })
                        .subscribe();
                    this.state = MetamaskState.NOT_CONNECTED;
                }
            },
        });
    }
    show(): void {
        // const actions = ['No thanks', 'Remind me later', 'Rate now'];
 
        this.dialogs
            .open(
                new PolymorpheusComponent(DailyRewardDialogComponent, this.injector),
                // {
                //     dismissible: true,
                // }
            )
            // .pipe(switchMap(index => this.alerts.open(`Selected: ${actions[index]}`)))
            .subscribe();
    }
    // show() {
    //     this.dialogService
    //         .open<number>(
    //             new PolymorpheusComponent(DailyRewardDialogComponent, this.injector),
    //             {
    //                 dismissible: true,
    //             }
    //         )
    //         .subscribe({
    //             next: (value) => {},
    //         });
    // }
    
    sortData(column: keyof Transaction): void {
        if (this.sortColumn === column) {
            this.sortDirection *= -1;
        } else {
            this.sortColumn = column;
            this.sortDirection = 1;
        }

        this.transactions.sort((a, b) => {
            return (a[column] < b[column] ? -1 : 1) * this.sortDirection;
        });
    }
    filterTransactions(): void {
        const today = new Date();
        const oneWeekAgo = new Date(today);
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const oneMonthAgo = new Date(today);
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

        this.filteredTransactions = this.transactions.filter((transaction) => {
            const isDateValid =
                (this.dateFilter === 'today' &&
                    transaction.date.toDateString() === today.toDateString()) ||
                (this.dateFilter === 'week' &&
                    transaction.date >= oneWeekAgo) ||
                (this.dateFilter === 'month' &&
                    transaction.date >= oneMonthAgo) ||
                this.dateFilter === 'all';

            const isTypeValid =
                this.typeFilter === 'all' ||
                transaction.type === this.typeFilter;

            return isDateValid && isTypeValid;
        });
    }
}
