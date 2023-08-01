import {Component, EventEmitter, Output, OnInit} from '@angular/core';
import {MetamaskBrightIdService, brightIdState} from '../../metamask-bright-id.service';
import {TuiAlertService ,TuiLoaderModule} from "@taiga-ui/core";
import { ContractService } from '../../contract.service';

@Component({
  selector: 'app-verification',
  templateUrl: './verification.component.html',
  styleUrls: ['./verification.component.scss']
})
export class VerificationComponent implements OnInit {
  @Output() nextStep = new EventEmitter<any>();
  state = brightIdState.NOT_VERIFIED;
  loading = false;
  qrCodeValue = '';
  brightIdState = brightIdState ;
  constructor(
    private metamaskBrightIdService: MetamaskBrightIdService, 
    private alertService: TuiAlertService,
    private contractService: ContractService, ) {}

  ngOnInit() {
      this.checkVerification();
  }

  checkVerification() {
    this.loading = true;
    this.metamaskBrightIdService.checkBrightIdState().subscribe(state => {
      this.state = state;
      if (state === brightIdState.UNIQUE_VERIFIED) {
        this.loading = false;
      } else if (state === brightIdState.VERIFIED) {
        this.nextStep.emit();
        this.loading = false;
      } else {
        this.qrCodeValue = this.metamaskBrightIdService.qrcodeValue;
        if (this.qrCodeValue) {
          this.alertService.open("Please complete your BrightID verification", {
            status: "error"
          }).subscribe();
        }
        this.loading = false;
      }
    });
  }

onVerify() {
    this.loading = true;
    this.contractService.verifyMe().subscribe(() => {
        this.nextStep.emit();
        this.loading = false;
    }, err => {
        this.alertService.open("Verification failed", { status: "error" }).subscribe();
        this.loading = false;
    });
}
}
