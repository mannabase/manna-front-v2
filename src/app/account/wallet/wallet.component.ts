import { ChangeDetectorRef, Component, Injector, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { MetamaskService, MetamaskState } from 'src/app/metamask.service';
import { VerifyService, VerifyState } from '../../verify.service';
import { TuiAlertService, TuiDialogService } from '@taiga-ui/core';
import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { ContractService } from '../../contract.service';
import { MannaService } from '../../manna.service';
import { ClaimService } from '../../claim.service';
import { DailyRewardDialogComponent } from './daily-reward-dialog/daily-reward-dialog.component';

@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.component.html',
  styleUrls: ['./wallet.component.scss'],
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
  private metamaskStateSubscription: Subscription | undefined;
  private walletStateSubscription: Subscription | undefined;
    injector: Injector | null | undefined;

  constructor(
    readonly metamaskService: MetamaskService,
    readonly dialogService: TuiDialogService,
    readonly verifyService: VerifyService,
    readonly alertService: TuiAlertService,
    private cdRef: ChangeDetectorRef,
    readonly contractService: ContractService,
    private mannaService: MannaService,
    private claimService: ClaimService
  ) {}

  ngOnInit() {
    this.accountSubscription = this.metamaskService.account$.subscribe(address => {
      this.walletAddress = address;
      this.fetchClaimableAmount();
      this.fetchBalances();
    });

    this.networkSubscription = this.metamaskService.network$.subscribe(() => {
      this.resetBalances();
      if (this.walletAddress) {
        this.fetchClaimableAmount();
        this.fetchBalances();
      }
    });

    this.metamaskStateSubscription = this.metamaskService.metamaskState$.subscribe(() => {
      this.cdRef.detectChanges();
    });

    this.walletStateSubscription = this.mannaService.getRefreshWallet().subscribe(refresh => {
      if (refresh) {
        this.resetBalances();
        this.fetchBalances();
        this.fetchClaimableAmount();
      }
    });
  }

  ngOnDestroy() {
    this.accountSubscription?.unsubscribe();
    this.networkSubscription?.unsubscribe();
    this.metamaskStateSubscription?.unsubscribe();
    this.walletStateSubscription?.unsubscribe();
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
          if (contractBalance !== undefined) {
            this.balance = contractBalance;
            this.cdRef.detectChanges();
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

  private resetBalances() {
    this.balance = null;
    this.mannabaseBalance = null;
    this.claimableAmount = null;
  }

  claimDailyReward(): void {
    this.claimDailyLoader = true;
    this.claimService.claimDailyReward(this.walletAddress!).subscribe(
      () => {
        this.alertService.open('Daily reward claimed successfully.', { status: 'success' }).subscribe();
        this.resetBalances();
        this.fetchBalances();
        this.fetchClaimableAmount();
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
        this.resetBalances();
        this.fetchBalances();
        this.fetchClaimableAmount();
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
