import {Component, OnInit} from '@angular/core';
import {MetamaskService} from 'src/app/metamask.service';

@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.component.html',
  styleUrls: ['./wallet.component.scss'],
})
export class WalletComponent implements OnInit {
  
  
  constructor(public metamaskService: MetamaskService) {
  }
  
  ngOnInit() {
    this.metamaskService.checkMetamaskStatus();
  }

}
