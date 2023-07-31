import {Component} from '@angular/core';
import {MetamaskBrightIdService} from 'src/app/metamask-bright-id.service';
import {UserClaimingState, UserService} from 'src/app/user.service';
import {TuiAlertService} from "@taiga-ui/core";

@Component({
  selector: 'app-verification-dialog',
  templateUrl: './verification-dialog.component.html',
  styleUrls: ['./verification-dialog.component.scss']
})
export class VerificationDialogComponent {
  qrCodeValue: string = '';
  isLoading: boolean = false;
  isLoadingQRCode: boolean = false;

  constructor(public metamaskBrightIdService: MetamaskBrightIdService,
              public userService: UserService,
              private alertService: TuiAlertService) {
  }

  ngOnInit() {
    this.isLoadingQRCode = true;
  }

  onCheckVerify() {
  }

}
