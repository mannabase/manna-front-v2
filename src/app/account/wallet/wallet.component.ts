import {Component, OnInit} from '@angular/core';
import {MetamaskBrightIdService} from 'src/app/metamask-bright-id.service';
import {MannaToClaimService} from 'src/app/mannaToClaim.service';

@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.component.html',
  styleUrls: ['./wallet.component.scss'],
})
export class WalletComponent implements OnInit {


  constructor(public metamaskBrightIdService: MetamaskBrightIdService,
    public mannaToClaimService: MannaToClaimService) {
  }

  ngOnInit() {
    this.metamaskBrightIdService.checkMetamaskStatus();
  }

}
