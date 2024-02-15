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
import { ClaimService } from '../../claim.service';


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
    claimDailyLoader:boolean =false
    mannabaseBalance: number | null = null;
    mannabaseBalanceMessage:string | null = null;
    VerifyState = VerifyState;
    verificationState: VerifyState = VerifyState.NOT_VERIFIED;
    claimableAmount: number | null = null;
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
        private claimService: ClaimService,
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
                        this.claimableAmount = response.toClaim;
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
    claimDailyReward(): void {
        if (!this.walletAddress) {
          this.alertService.open("Please connect to a wallet first.", { status: 'warning' }).subscribe();
          return;
        }
    
        this.claimDailyLoader = true;
        const subscription = this.claimService.claimDailyReward(
          this.walletAddress,
          () => {
            this.alertService.open('Daily reward claimed successfully.', { status: 'success' }).subscribe();
            this.fetchClaimableAmount(); 
            this.fetchBalances();
            this.fetchMannabaseBalance()
          },
          (errorMessage) => {
            this.alertService.open(errorMessage, { status: 'error' }).subscribe();
          }
        );
    
        subscription.add(() => this.claimDailyLoader = false);
    }
    
      claimWithSignatures(): void {
        if (!this.walletAddress) {
            console.error('walletAddress is null or undefined when attempting to claim with signatures.');
            this.alertService.open("Please connect to a wallet first.", { status: 'warning' }).subscribe();
            return;
          }
    
        if (this.verificationState !== VerifyState.VERIFIED) {
          this.alertService.open('You must be verified to withdraw.', {status: 'warning'}).subscribe();
          return;
        }
    
        this.claimDailyLoader = true;
        const subscription = this.claimService.claimWithSignatures(
          this.walletAddress,
          this.verificationState === VerifyState.VERIFIED,
          () => {
            this.alertService.open('Claim with signatures successful.', { status: 'success' }).subscribe();
          },
          (errorMessage) => {
            this.alertService.open(errorMessage, { status: 'error' }).subscribe();
          }
        );
    
        subscription.add(() => this.claimDailyLoader = false);
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
}
