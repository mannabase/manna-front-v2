import { Component, OnInit, OnDestroy } from '@angular/core';
import { VerifyService } from '../verify.service';
import { ContractService } from '../contract.service';
import { Subscription } from 'rxjs';
import { MetamaskBrightIdService, MetamaskState } from 'src/app/metamask-bright-id.service';

@Component({
  selector: 'app-score-dialog',
  templateUrl: './score-dialog.component.html',
  styleUrls: ['./score-dialog.component.scss'],
  standalone: true,
})
export class ScoreDialogComponent implements OnInit, OnDestroy {
  isScoreGreaterThanThreshold: boolean = false;
  walletAddress: string | null = null;
  accountSubscription: Subscription = new Subscription();
  threshold: number | null = null;
  score: number | null = null;
  private scoreSubscription: Subscription = new Subscription();

  constructor(
    public verifyService: VerifyService,
    private contractService: ContractService,
    private metamaskService: MetamaskBrightIdService,
  ) {
    this.accountSubscription = this.metamaskService.account$.subscribe((address) => {
      this.walletAddress = address;
      if (address) {
        this.verifyService.verifyUser(address);
      }
    });
  }

  ngOnInit() {
      this.isScoreGreaterThanThreshold =
      this.verifyService.serverScore$ !== null &&
      this.verifyService.threshold$ !== null &&
      this.verifyService.serverScore$ >= this.verifyService.threshold$;

    // Subscribe to the threshold observable
    this.verifyService.threshold$.subscribe((threshold) => {
      this.threshold = threshold;
    });
    this.scoreSubscription = this.verifyService.serverScore$.subscribe((serverScore) => {
      this.score = serverScore;
    });
  }

  ngOnDestroy() {
    this.accountSubscription.unsubscribe();
    this.scoreSubscription.unsubscribe();
  }

  submitScoreToContract() {
    // if (this.verifyService.serverScore !== null) {
    //   this.contractService.submitUserScore(this.walletAddress!, serverResponse.data).subscribe({
    //     next: () => {
    //       console.log('Score submitted to contract successfully.');
    //       if (this.verifyService.serverScore !== null) {
    //          this.verifyService.setContractScore(this.verifyService.serverScore);
    //       }
    //      },
    //     error: (error) => console.error('Error submitting score to contract:', error),
    //   });
    // }
  }
}

