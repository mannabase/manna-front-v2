import {Component, OnInit} from '@angular/core';
import {MetamaskBrightIdService} from 'src/app/metamask-bright-id.service';
import {MannaService} from 'src/app/manna.service';
import {MessageService} from "primeng/api";

@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.component.html',
  styleUrls: ['./wallet.component.scss'],
})
export class WalletComponent implements OnInit {

  balance?: number;

  constructor(readonly metamaskBrightIdService: MetamaskBrightIdService, readonly mannaService: MannaService,
              readonly messageService: MessageService) {
  }

  ngOnInit() {
    this.metamaskBrightIdService.checkMetamaskStatus();
    if (this.metamaskBrightIdService.account$.getValue() != null) {
      this.mannaService.getBalance(this.metamaskBrightIdService.account$.getValue())
        .subscribe({
          next: (response: any) => {
            this.balance = response.data
          },
          error: (err) => {
            this.balance = 0
            this.messageService.add({
              severity: 'error',
              summary: 'Failed to load balance',
            });
          }
        });
    }
  }
}
