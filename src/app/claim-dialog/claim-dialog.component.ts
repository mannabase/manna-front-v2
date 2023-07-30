import {Component, OnInit} from '@angular/core';
import {MetamaskBrightIdService} from "../metamask-bright-id.service";

@Component({
  selector: 'app-claim-dialog',
  templateUrl: './claim-dialog.component.html',
  styleUrls: ['./claim-dialog.component.scss']
})
export class ClaimDialogComponent implements OnInit {

  currentStep: number = 0;

  constructor(readonly metamaskBrightIdService: MetamaskBrightIdService) {
  }

  ngOnInit() {

  }

}
