import {ChangeDetectorRef, Component, Inject, Injector, Input, OnInit} from '@angular/core'
import {MetamaskBrightIdService, MetamaskState} from 'src/app/metamask-bright-id.service'
import {VerifyState, VerifyService} from '../../verify.service'
import {ethers} from 'ethers'
import {TuiAlertService, TuiDialogService,tuiLoaderOptionsProvider} from '@taiga-ui/core'
import {TuiMobileDialogService} from '@taiga-ui/addon-mobile'
import {TUI_IS_IOS} from '@taiga-ui/cdk'
import {PolymorpheusComponent} from '@tinkoff/ng-polymorpheus'
import {DailyRewardDialogComponent} from './daily-reward-dialog/daily-reward-dialog.component'
import {mannaChainName ,mannaContractAddress} from "../../config"
import { ContractService } from '../../contract.service';
import { Subscription } from 'rxjs';
import { MannaService } from '../../manna.service';
import { Signature } from '../../manna.service';


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
export class WalletComponent implements OnInit {
    balance: number | null = null;
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
    mannabaseBalance: number | null = null;
    mannabaseBalanceMessage:string | null = null;
    VerifyState = VerifyState;
    verificationState: VerifyState = VerifyState.NOT_VERIFIED;
    claimableAmount: number | null = null;

    
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
        this.subscribeToAccountChanges();
        this.subscribeToContractInitialization();
        this.subscribeToVerificationState();
      }
    ngOnDestroy() {
        if (this.accountSubscription) {
            this.accountSubscription.unsubscribe();
        }
    }
    private subscribeToAccountChanges() {
        this.accountSubscription = this.metamaskBrightIdService.account$.subscribe(address => {
            this.walletAddress = address;
            if (address) {
                // this.fetchBalances();
                this.fetchClaimableAmount();
                this.verifyService.verifyUser(address);
            }
        });
    }
    private subscribeToContractInitialization() {
        this.contractService.contractsInitialized.subscribe(initialized => {
          if (initialized && this.walletAddress) {
            this.fetchBalances();
          }
        });
      }
    private subscribeToVerificationState() {
        this.verifyService.verificationState$.subscribe(state => {
            this.verificationState = state;
            this.cdRef.detectChanges(); 
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
    private fetchBalances() {
        if (this.walletAddress) {
            this.contractService.balanceOf(this.walletAddress).subscribe(
                contractBalance => {
                    if (contractBalance) {
                        this.balance = parseFloat(contractBalance);
                    }
                    this.cdRef.detectChanges();
                }
            );
            this.fetchMannabaseBalance();
        }
    }
    private fetchClaimableAmount() {
        if (this.walletAddress) {
            this.mannaService.getClaimableAmount(this.walletAddress).subscribe(
                response => {
                    if (response && response.status === 'ok') {
                        this.claimableAmount = response.balance;
                    } else {
                        this.claimableAmount = null;
                    }
                    this.cdRef.detectChanges(); 
                },
                error => {
                    console.error('Error fetching claimable amount:', error);
                    this.claimableAmount = null;
                }
            );
        }
    }
    

    private fetchMannabaseBalance() {
        if (this.walletAddress) {
            this.mannaService.getMannabaseBalance(this.walletAddress).subscribe(
                response => {
                    if (response && response.status === 'ok') {
                        this.mannabaseBalance = response.balance;
                    }
                    this.cdRef.detectChanges();
                }
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
        this.claimDailyLoader = true;
        this.mannabaseBalance = null;

        if (!this.walletAddress) {
            this.alertService.open("Please connect to a wallet first.", { status: 'warning' }).subscribe();
            this.claimDailyLoader = false;
            return;
        }

        const timestamp = Math.floor(Date.now() / 1000);
        const message = `Check-in\naddress: ${this.walletAddress}\ntimestamp: ${timestamp}`;

        this.metamaskBrightIdService.signMessage(message).subscribe(
            signature => {
                this.mannaService.sendCheckIn(this.walletAddress as string, signature, timestamp).subscribe(
                    serverResponse => {
                        this.fetchMannabaseBalance();
                    },
                    error => {
                        this.alertService.open("Failed to Claim. Please try again.", { status: 'error' }).subscribe();
                    }
                );
            },
            error => {
                this.alertService.open("Failed to sign the Claim message. Please try again.", { status: 'error' }).subscribe();
            }
        ).add(() => this.claimDailyLoader = false);
    }
    // claimWithSigs(): void {
    //     this.claimDailyLoader = true;
    
    //     if (!this.walletAddress) {
    //         this.alertService.open("Please connect to a wallet first.", { status: 'warning' }).subscribe();
    //         this.claimDailyLoader = false;
    //         return;
    //     }
    
    //     const timestamp = Math.floor(Date.now() / 1000);
    //     const message = `Request for check-in signatures\naddress: ${this.walletAddress}\ntimestamp: ${timestamp}`;
    
    //     this.metamaskBrightIdService.signMessage(message).subscribe(
    //         signature => {
    //             this.mannaService.sendClaimWithSig(this.walletAddress as string, signature, timestamp).subscribe(
    //                 serverResponse => {
    //                     this.contractService.claimWithSigsContract(serverResponse.data).subscribe(
    //                         () => {
    //                             console.log('Claim successful on smart contract');
    //                             this.alertService.open('Claim successful.', { status: 'success' }).subscribe();
    //                         },
    //                         contractError => {
    //                             console.error('Error claiming on smart contract:', contractError);
    //                             this.alertService.open('Failed to claim on smart contract.', { status: 'error' }).subscribe();
    //                         }
    //                     );
    //                 },
    //                 serverError => {
    //                     console.error('Error sending claim request to server:', serverError);
    //                     this.alertService.open('Failed to send claim request.', { status: 'error' }).subscribe();
    //                 }
    //             );
    //         },
    //         signError => {
    //             console.error('Error signing message:', signError);
    //             this.alertService.open('Failed to sign the claim message.', { status: 'error' }).subscribe();
    //         }
    //     ).add(() => this.claimDailyLoader = false); // Always turn off loader after process
    // }


    claimWithSignatures(): void {
        this.claimDailyLoader = true;
        const walletAddress = this.metamaskBrightIdService.account$.value;
        
        if (this.verificationState !== VerifyState.VERIFIED) {
            this.alertService.open('You must be verified to withdraw.', {status: 'warning'}).subscribe();
            this.claimDailyLoader = false;
            return;
        }
        if (!walletAddress) {
            this.alertService.open("Please connect to a wallet first.", { status: 'warning' }).subscribe();
            this.claimDailyLoader = false;
            return;
        }
    
        const timestamp = Math.floor(Date.now() / 1000);
        const message = `Request for check-in signatures\naddress: ${walletAddress}\ntimestamp: ${timestamp}`;
    
        this.metamaskBrightIdService.signMessage(message).subscribe(
            signature => {
                this.mannaService.sendClaimWithSig(walletAddress, signature, timestamp).subscribe(
                    serverResponse => {
                        if (serverResponse.status === 'ok' && serverResponse.signatures) {
                            const formattedSignatures = serverResponse.signatures.map((sig: any) => {
                                // Check if the signature object and its properties exist
                                if (!sig.signature || sig.signature.v === undefined || sig.signature.r === undefined || sig.signature.s === undefined) {
                                    console.error('Incomplete or missing signature data:', sig);
                                    throw new Error('Incomplete or missing signature data');
                                }
                                return [sig.timestamp, sig.signature.v, sig.signature.r, sig.signature.s];
                            });
                            console.log('Formatted Signatures:', formattedSignatures);
    
                            this.contractService.claimWithSigsContract(formattedSignatures).subscribe(
                                () => {
                                    console.log('Claim successful on smart contract');
                                    this.alertService.open('Claim successful.', { status: 'success' }).subscribe();
                                },
                                contractError => {
                                    console.error('Error claiming on smart contract:', contractError);
                                    this.alertService.open('Failed to claim on smart contract.', { status: 'error' }).subscribe();
                                }
                            );
                        } else {
                            this.alertService.open(`Error: ${serverResponse.msg}`, { status: 'error' }).subscribe();
                        }
                    },
                    serverError => {
                        console.error('Error sending claim request to server:', serverError);
                        this.alertService.open('Failed to send claim request.', { status: 'error' }).subscribe();
                    }
                );
            },
            signError => {
                console.error('Error signing message:', signError);
                this.alertService.open('Failed to sign the claim message.', { status: 'error' }).subscribe();
            }
        ).add(() => this.claimDailyLoader = false);
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
