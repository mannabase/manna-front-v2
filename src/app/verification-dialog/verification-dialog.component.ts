import {Component} from '@angular/core';
import {DynamicDialogConfig} from "primeng/dynamicdialog";
import {MetamaskBrightIdService, VerificationStatus} from 'src/app/metamask-bright-id.service';
import {MannaToClaimService} from 'src/app/mannaToClaim.service';


@Component({
  selector: 'app-verification-dialog',
  templateUrl: './verification-dialog.component.html',
  styleUrls: ['./verification-dialog.component.scss']
})
export class VerificationDialogComponent {
  // linkStatus: string;
  email: string = '';
  loading: boolean = true;
  error: boolean = false;
  qrCodeValue: string;
  protected readonly VerificationStatus = VerificationStatus;

  constructor(readonly dynamicDialogConfig: DynamicDialogConfig,
     public metamaskBrightIdService: MetamaskBrightIdService,
     public mannaToClaimService: MannaToClaimService) {
    this.qrCodeValue = 
      `brightid://link-verification/http:%2f%2fnode.brightid.org/idchain/${dynamicDialogConfig.data}`;
  }
  onCheckVerify() {
    const walletAddress = this.metamaskBrightIdService.account$.getValue();
    this.metamaskBrightIdService.checkBrightIdStatus(walletAddress);
  }
}
