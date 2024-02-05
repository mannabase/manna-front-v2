import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VerifyService } from '../verify.service';
import { ContractService } from '../contract.service';
import { Subscription  } from 'rxjs';
import { MetamaskBrightIdService, MetamaskState } from 'src/app/metamask-bright-id.service';

@Component({
  selector: 'app-score-dialog',
  templateUrl: './score-dialog.component.html',
  styleUrls: ['./score-dialog.component.scss'],
  standalone: true,
  imports: [CommonModule],
})
export class ScoreDialogComponent implements OnInit {
  isScoreGreaterThanThreshold: boolean = false;
  walletAddress: string | null = null;
  accountSubscription: Subscription = new Subscription();
  threshold: number | null = null;
  score: number | null = null;
  

  constructor(
    public verifyService: VerifyService, 
    private contractService: ContractService,
    private metamaskService: MetamaskBrightIdService,
    ) 
  {
    this.accountSubscription = this.metamaskService.account$.subscribe((address) => {
      this.walletAddress = address;
      if (address) {
        this.verifyService.verifyUser(address);
      }
    });
  }

  ngOnInit() {
    this.isScoreGreaterThanThreshold = this.verifyService.serverScore$ !== null && this.verifyService.threshold$ !== null && this.verifyService.serverScore$ >= this.verifyService.threshold$;
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

