import { Component, ChangeDetectorRef, EventEmitter, Output } from '@angular/core';
import { MetamaskBrightIdService } from '../../../metamask-bright-id.service';
import { MannaService } from '../../../manna.service';
import { TuiAlertService } from '@taiga-ui/core';
@Component({
  selector: 'app-daily-reward-dialog',
  templateUrl: './daily-reward-dialog.component.html',
  styleUrls: ['./daily-reward-dialog.component.scss'],
})
export class DailyRewardDialogComponent {
  claimLoader: boolean = false;
  mannabaseBalance: number | null = null;
  mannabaseBalanceMessage: string | null = null;
  constructor(
    private metamaskBrightIdService: MetamaskBrightIdService,
    private mannaService: MannaService,
    private alertService: TuiAlertService,
    private cdRef: ChangeDetectorRef
  ) {}

  claimManna(): void {
    this.claimLoader = true;
    const walletAddress = this.metamaskBrightIdService.account$.value;
  
    if (!walletAddress) {
      this.alertService.open("Please connect to a wallet first.", { status: 'warning' }).subscribe();
      this.claimLoader = false;
      return;
    }
  
    const timestamp = Math.floor(Date.now() / 1000);
    const message = `Check-in\naddress: ${walletAddress}\ntimestamp: ${timestamp}`;
  
    this.metamaskBrightIdService.signMessage(message).subscribe(
      signature => {
        this.mannaService.sendCheckIn(walletAddress, signature, timestamp).subscribe(
          serverResponse => {
            this.fetchMannabaseBalance();
            this.claimLoader = false; 
          },
          error => {
            this.alertService.open("Failed to Claim. Please try again.", { status: 'error' }).subscribe();
            this.claimLoader = false; 
          }
        );
      },
      error => {
        this.alertService.open("Failed to sign the Claim message. Please try again.", { status: 'error' }).subscribe();
        this.claimLoader = false; 
      }
    );
  }
  private fetchMannabaseBalance() {
    const walletAddress = this.metamaskBrightIdService.account$.value; 

    if (walletAddress) {
      this.mannaService.getMannabaseBalance(walletAddress).subscribe(
        response => {
          if (response.status === 'ok') {
            this.mannabaseBalance = response.balance;
          } else {
            this.mannabaseBalanceMessage = response.msg;
          }
          this.cdRef.detectChanges(); 
        },
        error => {
          this.mannabaseBalanceMessage = 'Error fetching balance';
          this.cdRef.detectChanges();
        }
      );
    }
  }
  
  
}