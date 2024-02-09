import { Component, OnInit, OnDestroy } from '@angular/core';
import { VerifyService } from '../verify.service';
import { ContractService } from '../contract.service';
import { Subscription } from 'rxjs';
import { MetamaskBrightIdService, MetamaskState } from 'src/app/metamask-bright-id.service';
import { CommonModule } from '@angular/common';
import { MannaService } from '../manna.service'; 


@Component({
  selector: 'app-score-dialog',
  templateUrl: './score-dialog.component.html',
  styleUrls: ['./score-dialog.component.scss'],
  standalone: true,
  imports: [CommonModule], 
})
export class ScoreDialogComponent implements OnInit, OnDestroy {
  [x: string]: any;
  isScoreGreaterThanThreshold: boolean = false;
  walletAddress: string | null = null;
  accountSubscription: Subscription = new Subscription();
  threshold: number | null = null;
  score: number | null = null;
  private scoreSubscription: Subscription = new Subscription();
  alertService: any;
  loading: boolean = false; 

  constructor(
    public verifyService: VerifyService,
    private contractService: ContractService,
    private metamaskService: MetamaskBrightIdService,
    private mannaService: MannaService,
  ) {
    this.accountSubscription = this.metamaskService.account$.subscribe((address) => {
      this.walletAddress = address;
      if (address) {
        this.verifyService.verifyUser(address);
      }
    });
  }

  ngOnInit() {
    this.verifyService.threshold$.subscribe((threshold) => {
      this.threshold = threshold;
      this.updateIsScoreGreaterThanThreshold();
    });
    this.scoreSubscription = this.verifyService.serverScore$.subscribe((serverScore) => {
      this.score = serverScore;
      this.updateIsScoreGreaterThanThreshold();
    });
  }

  ngOnDestroy() {
    this.accountSubscription.unsubscribe();
    this.scoreSubscription.unsubscribe();
  }
  updateIsScoreGreaterThanThreshold() {
    this.isScoreGreaterThanThreshold = this.score !== null && this.threshold !== null && this.score/ 1000000 >= this.threshold;
    console.log(`Score: ${this.score}, Threshold: ${this.threshold}, isScoreGreaterThanThreshold: ${this.isScoreGreaterThanThreshold}`);
  }
  

  submitScoreToContract() {
    this.loading = true; 
    this.verifyService.sendScoreToContract(this.walletAddress!).subscribe({
      next: () => {
        console.log('Score submitted successfully.');
        this.loading = false;
        this['dialogRef'].close();
      },
      error: (error) => {
        console.error('Failed to submit score:', error);
        this.loading = false;
        this.alertService.open('Failed to submit score.', {status: 'error', label: 'Error'});
      },
    });
  }
  
}

