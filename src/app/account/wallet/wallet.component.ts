import {Component, OnInit} from '@angular/core';
import {MetamaskBrightIdService} from 'src/app/metamask-bright-id.service';
import {MannaService} from 'src/app/manna.service';
import {MessageService} from "primeng/api";
import {UserClaimingState, UserService} from "../../user.service";

@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.component.html',
  styleUrls: ['./wallet.component.scss'],
})
export class WalletComponent implements OnInit {
  buttonMessageMap = new Map<UserClaimingState, string>([
    [UserClaimingState.ZERO, 'Connect Metamask'],
    [UserClaimingState.METAMASK_CONNECTED, 'Change to ID Chain'],
    [UserClaimingState.CORRECT_CHAIN, 'Verify'],
    [UserClaimingState.VERIFIED, 'Enter email'],
    [UserClaimingState.READY, 'Claim'],
  ])


  balance?: number;

  constructor(readonly metamaskBrightIdService: MetamaskBrightIdService, readonly mannaService: MannaService,
              readonly messageService: MessageService, readonly userService: UserService) {
  }

  ngOnInit() {
    this.metamaskBrightIdService.checkUserState();
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
