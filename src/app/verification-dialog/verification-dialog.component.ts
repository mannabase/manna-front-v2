import {Component} from '@angular/core';
import {DynamicDialogConfig} from "primeng/dynamicdialog";
import {MetamaskBrightIdService} from 'src/app/metamask-bright-id.service';
import {MannaService} from 'src/app/manna.service';
import {UserClaimingState,UserService} from 'src/app/user.service';
import {MessageService} from 'primeng/api';


@Component({
  selector: 'app-verification-dialog',
  templateUrl: './verification-dialog.component.html',
  styleUrls: ['./verification-dialog.component.scss']
})
export class VerificationDialogComponent {
  qrCodeValue: string = '';
  isLoading: boolean = false;
  isLoadingQRCode: boolean = false;

  constructor(readonly dynamicDialogConfig: DynamicDialogConfig,
              public metamaskBrightIdService: MetamaskBrightIdService,
              public mannaService: MannaService,
              public userService: UserService,
              private messageService: MessageService) {}
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
            this.messageService.add({severity:'success', summary: 'Success', detail: 'Verification successful!'});
          } else {
            this.messageService.add({severity:'error', summary: 'Failed', detail: 'Verification failed. Please try again.'});
          }
        },
        error: (err) => {
          this.isLoading = false;
          this.messageService.add({severity:'error', summary: 'Error', detail: 'Error during verification.'});
        },
      });
  }
  
}
