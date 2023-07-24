import {Component, OnInit} from '@angular/core';
import {MetamaskBrightIdService} from 'src/app/metamask-bright-id.service';
import {UserClaimingState, UserService} from 'src/app/user.service';
import {MessageService} from "primeng/api";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {

  buttonMessageMap = new Map<UserClaimingState, string>([
    [UserClaimingState.ZERO, 'Connect Metamask'],
    [UserClaimingState.METAMASK_CONNECTED, 'Change to ID Chain'],
    [UserClaimingState.CORRECT_CHAIN, 'Verify'],
    [UserClaimingState.VERIFIED, 'Enter email'],
    [UserClaimingState.READY, 'Claim'],
  ])

  constructor(readonly metamaskBrightIdService: MetamaskBrightIdService,
              readonly userService: UserService,
              readonly messageService: MessageService) {
  }

  ngOnInit() {
    this.metamaskBrightIdService.checkMetamaskState();
  }

  handleButtonClick() {
    this.metamaskBrightIdService.tryClaim()
      .subscribe({
        error: err => {
          this.messageService.add({
            severity: 'error',
            detail: err
          })
        }
      })
  }

}
