// import {Component, EventEmitter, Output, OnInit} from '@angular/core';
// import {TuiAlertService, TuiLoaderModule} from "@taiga-ui/core";
// // import {ContractService} from '../../contract.service';

// @Component({
//     selector: 'app-verification',
//     templateUrl: './verification.component.html',
//     styleUrls: ['./verification.component.scss']
// })
// export class VerificationComponent implements OnInit {
//     @Output() nextStep = new EventEmitter<any>();
//     loading = false;
//     qrCodeValue = '';

//     constructor(
//         private alertService: TuiAlertService,
//         private contractService: ContractService,) {
//     }

//     ngOnInit() {
//         this.checkVerification();
//     }

//     checkVerification() {
//         this.loading = true;
//         this.metamaskBrightIdService.checkBrightIdState()
//             .subscribe(state => {
//                 this.state = state;
//                 this.loading = false;
//                 if (state === BrightIdState.VERIFIED) {
//                     this.nextStep.emit();
//                 } else {
//                     this.qrCodeValue = this.metamaskBrightIdService.qrcodeValue;
//                     if (this.qrCodeValue) {
//                         this.alertService.open("Please complete your BrightID verification", {
//                             status: "error"
//                         }).subscribe();
//                     }
//                 }
//             });
//     }

//     onVerify() {
//         this.loading = true;
//         this.contractService.verifyMe().subscribe(() => {
//             this.nextStep.emit();
//             this.loading = false;
//         }, err => {
//             this.alertService.open("Verification failed", {status: "error"}).subscribe();
//             this.loading = false;
//         });
//     }
// }
