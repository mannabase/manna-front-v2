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
    const walletAddress = this.metamaskBrightIdService.account$.getValue();
    this.metamaskBrightIdService.getVerificationStatus(walletAddress).subscribe(
      res => {
        this.qrCodeValue = res.link;
        this.isLoadingQRCode = false;
      },
      err => {
        console.error(err);
        this.isLoadingQRCode = false;
      }
    );
  }

  onCheckVerify() {
    this.isLoading = true;
    const walletAddress = this.metamaskBrightIdService.account$.getValue();
    this.metamaskBrightIdService.getVerificationStatus(walletAddress)
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.status === "SUCCESSFUL") {
            this.userService.userClaimingState$.next(UserClaimingState.VERIFIED);
            this.alertService.open("Verification successful!", {
              status: "success"
            });
          } else {
            this.alertService.open("Verification failed. Please try again.", {
              status: "error",
              label: 'Failed'
            });
          }
        },
        error: (err) => {
          this.isLoading = false;
          this.alertService.open("Error during verification", {
            status: "error",
            label: 'Failed'
          });
        },
      });
  }

}
