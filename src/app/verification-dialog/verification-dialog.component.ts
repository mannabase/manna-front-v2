import {Component} from '@angular/core';
import {DynamicDialogConfig} from "primeng/dynamicdialog";
import {MetamaskService} from 'src/app/metamask.service';

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

  constructor(readonly dynamicDialogConfig: DynamicDialogConfig,public metamaskService: MetamaskService) {
    this.qrCodeValue = `brightid://link-verification/http:%2f%2fnode.brightid.org/idchain/${dynamicDialogConfig.data}`;
  }
  
}
