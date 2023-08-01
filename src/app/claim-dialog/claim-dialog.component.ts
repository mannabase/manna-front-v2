import {Component, OnInit} from '@angular/core';
import {MetamaskBrightIdService} from "../metamask-bright-id.service";
import {ContractService} from '../contract.service';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-claim-dialog',
  templateUrl: './claim-dialog.component.html',
  styleUrls: ['./claim-dialog.component.scss']
})
export class ClaimDialogComponent implements OnInit {

  currentStep: number = 0;
  subscription !: Subscription;

  constructor(
    readonly metamaskBrightIdService: MetamaskBrightIdService,
    private contractService: ContractService
  ) {
  }

  ngOnInit() {
    this.subscription = this.contractService.contractData$.subscribe((contractData) => {
      if (contractData.isVerified) {
        this.currentStep = 1; 
      }
      if (contractData.isRegistered) {
        this.currentStep = 2; 
      }
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe(); 
  }
}
