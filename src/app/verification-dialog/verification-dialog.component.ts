import {Component} from '@angular/core';
import {DynamicDialogConfig} from "primeng/dynamicdialog";

@Component({
  selector: 'app-verification-dialog',
  templateUrl: './verification-dialog.component.html',
  styleUrls: ['./verification-dialog.component.scss']
})
export class VerificationDialogComponent {

  qrCodeValue: string;

  constructor(readonly dynamicDialogConfig: DynamicDialogConfig) {
    this.qrCodeValue = `brightid://link-verification/http:%2f%2fnode.brightid.org/idchain/${dynamicDialogConfig.data}`;
  }

}
