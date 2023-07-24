import {Component} from '@angular/core';
import {DynamicDialogConfig} from "primeng/dynamicdialog";
import {MetamaskBrightIdService} from 'src/app/metamask-bright-id.service';
import {MannaService} from 'src/app/manna.service';
import {FormControl, Validators,} from "@angular/forms";


@Component({
  selector: 'app-verification-dialog',
  templateUrl: './verification-dialog.component.html',
  styleUrls: ['./verification-dialog.component.scss']
})
export class VerificationDialogComponent {
  qrCodeValue: string;
  emailForm = new FormControl(null, [Validators.required, Validators.email])

  constructor(readonly dynamicDialogConfig: DynamicDialogConfig,
              public metamaskBrightIdService: MetamaskBrightIdService,
              public mannaService: MannaService) {
    this.qrCodeValue = `brightid://link-verification/http:%2f%2fnode.brightid.org/idchain/${dynamicDialogConfig.data}`;
  }

  onCheckVerify() {
    const walletAddress = this.metamaskBrightIdService.account$.getValue();
    this.metamaskBrightIdService.checkBrightIdStatus(walletAddress);
  }
}
