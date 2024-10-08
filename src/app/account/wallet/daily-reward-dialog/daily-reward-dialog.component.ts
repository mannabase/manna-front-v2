import {
    Component,
    OnInit,
    ChangeDetectorRef,
    EventEmitter,
    Output,
    Inject,
} from '@angular/core';
import { MetamaskService } from '../../../metamask.service';
import { MannaService } from '../../../manna.service';
import {
    TuiAlertOptions,
    TuiAlertService,
    TuiDialogContext,
} from '@taiga-ui/core';
import { Subscription } from 'rxjs';
import { TuiBaseDialogContext } from '@taiga-ui/cdk';
import { PolymorpheusContent } from '@tinkoff/ng-polymorpheus';
import { ClaimService } from '../../../claim.service';

@Component({
    selector: 'app-daily-reward-dialog',
    templateUrl: './daily-reward-dialog.component.html',
    styleUrls: ['./daily-reward-dialog.component.scss'],
})
export class DailyRewardDialogComponent implements OnInit {
    claimLoader: boolean = false;
    mannabaseBalance: number | null = null;
    mannabaseBalanceMessage: string | null = null;
    claimableAmount: number | null = null;
    private accountSubscription: Subscription = new Subscription();
    walletAddress: any;
    claimDailyLoader: boolean | undefined;
    constructor(
        private metamaskService: MetamaskService,
        private mannaService: MannaService,
        private alertService: TuiAlertService,
        private cdRef: ChangeDetectorRef,
        private claimService: ClaimService
    ) {}
    ngOnInit(): void {
        this.accountSubscription = this.metamaskService.account$.subscribe(
            (walletAddress) => {
                if (walletAddress) {
                    this.fetchClaimableAmount(walletAddress);
                }
            }
        );
    }
    ngOnDestroy(): void {
        this.accountSubscription.unsubscribe();
    }

    private fetchClaimableAmount(walletAddress: string): void {
        this.mannaService.getClaimableAmount(walletAddress).subscribe(
            (response) => {
                if (response && response.status === 'ok') {
                    this.claimableAmount = response.toClaim;
                } else {
                    this.claimableAmount = null;
                }
                this.cdRef.detectChanges();
            },
            (error) => {
                console.error('Error fetching claimable amount:', error);
                this.claimableAmount = null;
            }
        );
    }

    claimManna(): void {
        this.claimLoader = true;
        const walletAddress = this.metamaskService.account$.value;

        if (!walletAddress) {
            this.alertService
                .open('Please connect to a wallet first.', {
                    status: 'warning',
                })
                .subscribe();
            this.claimLoader = false;
            return;
        }
        this.claimService.claimDailyReward(walletAddress).subscribe(
            () => {
                this.alertService.open('Daily reward claimed successfully.');
                this.fetchMannabaseBalance();
            },
            (error) => {
                console.error('Failed to claim daily reward:', error);
            }
        );
    }
    fetchBalances() {
        throw new Error('Method not implemented.');
    }
    private fetchMannabaseBalance() {
        const walletAddress = this.metamaskService.account$.value;

        if (walletAddress) {
            this.mannaService.getMannabaseBalance(walletAddress).subscribe(
                (response) => {
                    if (response.status === 'ok') {
                        this.mannabaseBalance = response.balance;
                    } else {
                        this.mannabaseBalanceMessage = response.msg;
                    }
                    this.cdRef.detectChanges();
                },
                (error) => {
                    this.mannabaseBalanceMessage = 'Error fetching balance';
                    this.cdRef.detectChanges();
                }
            );
        }
    }
}
