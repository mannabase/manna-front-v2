import { ChangeDetectorRef, Component, Inject, Injector, OnDestroy, OnInit } from '@angular/core';
import { MetamaskService, MetamaskState } from 'src/app/metamask.service';
import { VerifyService, VerifyState } from '../../verify.service';
import { TuiAlertService, TuiDialogService, tuiLoaderOptionsProvider } from '@taiga-ui/core';
import { TUI_IS_IOS } from '@taiga-ui/cdk';
import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { DailyRewardDialogComponent } from './daily-reward-dialog/daily-reward-dialog.component';
import { ContractService } from '../../contract.service';
import { Subscription } from 'rxjs';
import { MannaService } from '../../manna.service';
import { ClaimService } from '../../claim.service';
import { createWeb3Modal, defaultConfig } from '@web3modal/ethers';

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
    balance: number | null = null;
    MetamaskState = MetamaskState;
    walletAddress: string | null = null;
    claimDailyLoader: boolean = false;
    claimWithSigsLoader: boolean = false;
    mannabaseBalance: number | null = null;
    VerifyState = VerifyState;
    claimableAmount: number | null = null;
    private accountSubscription: Subscription | undefined;
    private networkSubscription: Subscription | undefined;

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
        const projectId = '83f8bb3871bd791900a7248b8abdcb21';

        // 2. Set chains
        const mainnet = {
            chainId: 137,
            name: 'MATIC',
            currency: 'MATIC',
            explorerUrl: 'https://polygon-rpc.com/',
            rpcUrl: 'https://polygon-rpc.com/',
        };

        // 3. Create your application's metadata object
        const metadata = {
            name: 'Manna',
            description: 'Future of money',
            url: 'https://mywebsite.com', // url must match your domain & subdomain
            icons: ['https://avatars.mywebsite.com/'],
        };

        // 4. Create Ethers config
        const ethersConfig = defaultConfig({
            /*Required*/
            metadata,

            /*Optional*/
            enableEIP6963: true, // true by default
            enableInjected: true, // true by default
            enableCoinbase: true, // true by default
            rpcUrl: '...', // used for the Coinbase SDK
            defaultChainId: 1, // used for the Coinbase SDK
        });

        // 5. Create a Web3Modal instance
        const modal = createWeb3Modal({
            ethersConfig,
            chains: [mainnet],
            projectId,
            enableAnalytics: true, // Optional - defaults to your Cloud configuration
            enableOnramp: true, // Optional - false as default
        });
        modal.getWalletProvider
    }

    ngOnInit() {
        this.accountSubscription = this.metamaskService.account$.subscribe(address => {
            this.walletAddress = address;
            this.fetchClaimableAmount();
            this.fetchBalances();
        });

        this.networkSubscription = this.metamaskService.network$.subscribe(() => {
            this.balance = null;
            this.mannabaseBalance = null;
            this.claimableAmount = null;
            if (this.walletAddress) {
                this.fetchClaimableAmount();
                this.fetchBalances();
            }
        });
    }

    ngOnDestroy() {
        this.accountSubscription?.unsubscribe();
        this.networkSubscription?.unsubscribe();
    }

    connectWallet() {
        this.metamaskService.connectWallet();
    }

    switchChain() {
        this.metamaskService.switchToMannaChain().subscribe();
    }

    private fetchBalances() {
        if (this.walletAddress) {
            this.contractService.balanceOf().subscribe(
                (contractBalance: any) => { 
                    if (contractBalance!== undefined) {
                        this.balance = contractBalance;
                        this.cdRef.detectChanges();
                        console.log('wallet balance fetched:', contractBalance);
                    }
                },
                (error: any) => {
                    console.error('Error fetching contract balance:', error);
                    this.balance = null;
                    this.cdRef.detectChanges();
                }
            );
            this.fetchMannabaseBalance();
        }
    }

    private fetchClaimableAmount() {
        if (this.walletAddress) {
            this.mannaService.getClaimableAmount(this.walletAddress).subscribe(
                {
                    next: response => {
                        if (response && response.status === 'ok') {
                            this.claimableAmount = response.toClaim;
                        } else {
                            this.claimableAmount = null;
                        }
                    },
                    error: error => {
                        console.error('Error fetching claimable amount:', error);
                        this.claimableAmount = null;
                    },
                },
            );
        }
    }

    private fetchMannabaseBalance() {
        if (this.walletAddress) {
            this.mannaService.getMannabaseBalance(this.walletAddress).subscribe(
                response => {
                    if (response && response.status === 'ok') {
                        console.log('Mannabase balance fetched:', response.balance);
                        this.mannabaseBalance = response.balance;
                        this.cdRef.detectChanges();
                    }
                },
                error => {
                    console.error('Error fetching mannabase balance:', error);
                },
            );
        }
    }

    claimDailyReward(): void {
        this.claimDailyLoader = true;
        this.claimService.claimDailyReward(this.walletAddress!).subscribe(
            () => {
                this.alertService.open('Daily reward claimed successfully.', { status: 'success' }).subscribe();
                this.ngOnInit();
            },
        ).add(() => {
            this.claimDailyLoader = false;
        });
    }

    claimWithSignatures(): void {
        this.claimWithSigsLoader = true;
        this.claimService.claimWithSignatures(this.walletAddress!).subscribe(
            () => {
                this.alertService.open('Claim with signatures successful.', { status: 'success' }).subscribe();
                this.ngOnInit();
            },
            error => {
                this.alertService.open('Claim with signatures Unsuccessful.', { status: 'error' }).subscribe();
                console.error('Failed to claim daily reward:', error);
            },
        ).add(() => {
            this.claimWithSigsLoader = false;
        });
    }

    openRewardDialog() {
        this.dialogService.open(new PolymorpheusComponent(DailyRewardDialogComponent, this.injector), {
            data: { claimableAmount: this.claimableAmount },
        }).subscribe();
    }
}
