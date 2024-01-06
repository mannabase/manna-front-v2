import { Component, OnInit } from '@angular/core';
import { MetamaskBrightIdService, MetamaskState } from '../../metamask-bright-id.service';
import { MannaService } from '../../manna.service';


@Component({
  selector: 'app-claim-manna',
  templateUrl: './claim-manna.component.html',
  styleUrls:['./claim-manna.component.scss']
})
export class ClaimMannaComponent {
  walletAddress: string | null = null;
  claimDailyLoader: boolean = false;
  successMessage: boolean = false;

  constructor(
    private metamaskService: MetamaskBrightIdService,
    private mannaService: MannaService
  ) {}

  ngOnInit() {
    this.metamaskService.account$.subscribe(address => {
      this.walletAddress = address;
    });
  }

  claimDailyReward(): void {
    this.claimDailyLoader = true;

    if (!this.walletAddress) {
      console.error("Please connect to a wallet first.");
      this.claimDailyLoader = false;
      return;
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const message = `Check-in\naddress: ${this.walletAddress}\ntimestamp: ${timestamp}`;

    this.metamaskService.signMessage(message).subscribe(
      signature => {
        this.mannaService.sendCheckIn(this.walletAddress as string, signature, timestamp).subscribe(
          serverResponse => {
            this.successMessage = true
            console.log("Claim successful:", serverResponse);
          },
          error => {
            console.error("Failed to claim. Please try again.", error);
          }
        );
      },
      error => {
        console.error("Failed to sign the Claim message. Please try again.", error);
      }
    ).add(() => this.claimDailyLoader = false);
  }
}
