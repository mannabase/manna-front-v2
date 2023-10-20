import {
    Component,
    Injector,
    Inject,
    OnInit,
    ChangeDetectionStrategy,
    Input,
    ChangeDetectorRef 
} from '@angular/core';
import {
    MetamaskBrightIdService,
    MetamaskState,
} from 'src/app/metamask-bright-id.service';
import { UserClaimingState, UserService } from '../../user.service';
import { ethers } from 'ethers';
import { TuiAlertService, TuiDialogService } from '@taiga-ui/core';

@Component({
    selector: 'app-wallet',
    templateUrl: './wallet.component.html',
    styleUrls: ['./wallet.component.scss'],
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

    constructor(
        readonly metamaskBrightIdService: MetamaskBrightIdService,
        readonly dialogService: TuiDialogService,
        readonly injector: Injector,
        readonly userService: UserService,
        readonly alertService: TuiAlertService,
        private readonly alerts: TuiAlertService,
        private cdRef: ChangeDetectorRef
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
            window.open('https://metamask.io/'); // Open Metamask official page
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
                // Check the Metamask state again
                this.updateState();
            },
            error: (err) => {
                if (err.message === 'Metamask is not on the correct chain') {
                    // Prompt the user to switch to the correct chain
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
                    // Handle other errors
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
}
