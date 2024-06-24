import {
    Component,
    OnInit,
    ChangeDetectorRef,
    OnDestroy
  } from '@angular/core';
  import { Subscription } from 'rxjs';
  import { MetamaskService } from '../../../metamask.service';
  import { MannaService } from '../../../manna.service';
  import { TuiAlertService } from '@taiga-ui/core';
  import { ClaimService } from '../../../claim.service';
  
  @Component({
    selector: 'app-daily-reward-dialog',
    templateUrl: './daily-reward-dialog.component.html',
    styleUrls: ['./daily-reward-dialog.component.scss'],
  })
  export class DailyRewardDialogComponent implements OnInit, OnDestroy {
    claimLoader: boolean = false;
    claimableAmount: number | null = null;
    private accountSubscription: Subscription = new Subscription();
  
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
  
    claimDailyReward(): void {
      this.claimLoader = true;
      const walletAddress = this.metamaskService.account$.value;
      this.claimService.claimDailyReward(walletAddress!).subscribe(
        () => {
          this.alertService.open('Daily reward claimed successfully.', { status: 'success' }).subscribe();
          this.mannaService.triggerWalletRefresh();
          this.ngOnInit()
        },
        (error) => {
          this.alertService.open(error, { status: 'error' }).subscribe();
          console.error('Failed to claim daily reward:', error);
        }
      ).add(() => {
        this.claimLoader = false;
      });
    }
  }
  