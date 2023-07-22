import {Component, OnInit} from '@angular/core';
import {MetamaskBrightIdService} from 'src/app/metamask-bright-id.service';

@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.component.html',
  styleUrls: ['./wallet.component.scss'],
})
export class WalletComponent implements OnInit {


  constructor(public metamaskService: MetamaskBrightIdService) {
  }

  ngOnInit() {
    this.metamaskService.checkMetamaskStatus();
  }

}
