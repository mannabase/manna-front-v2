import {Component, OnInit} from '@angular/core';
import {TuiAlertService} from '@taiga-ui/core';
import {MetamaskBrightIdService} from 'src/app/metamask-bright-id.service';
import {UserClaimingState, UserService} from 'src/app/user.service';

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
    [UserClaimingState.VERIFIED, 'Claim'],
  ])

  constructor(readonly metamaskBrightIdService: MetamaskBrightIdService,
              readonly userService: UserService,
              readonly alertService: TuiAlertService) {
  }

  ngOnInit() {
    this.metamaskBrightIdService.checkUserState();
  }

  handleButtonClick() {
    this.metamaskBrightIdService.tryClaim()
      .subscribe({
        error: err => {
          this.alertService.open(err, {status: "error"})
        }
      })
  }

}
