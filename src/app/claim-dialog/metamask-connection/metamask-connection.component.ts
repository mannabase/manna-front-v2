import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MetamaskBrightIdService, MetamaskState } from "../../metamask-bright-id.service";
import { mannaChainName } from "../../config";
import { TuiAlertService } from "@taiga-ui/core";

@Component({
  selector: 'app-metamask-connection',
  templateUrl: './metamask-connection.component.html',
  styleUrls: ['./metamask-connection.component.scss']
})
export class MetamaskConnectionComponent implements OnInit {
  @Output() nextStep = new EventEmitter<any>();
  state = MetamaskState.NOT_CONNECTED;
  MetamaskState = MetamaskState;
  mannaChain = mannaChainName;

  constructor(
    readonly metamaskBrightIdService: MetamaskBrightIdService,
    readonly alertService: TuiAlertService
  ) {}

  ngOnInit() {
    if (typeof window.ethereum === 'undefined') {
      this.alertService.open("Metamask extension is not installed. Please install it to continue.", {
        status: "error"
      }).subscribe();
      console.log('Metamask State :','NOT_INSTALLED')
      this.state = MetamaskState.NOT_INSTALLED;
    } else {
      this.updateState();
      console.log('Metamask State :','INSTALLED')
    }
  }
  installMetamask() {
    const metamaskDownloadLink = 'https://metamask.io/download/';
    window.open(metamaskDownloadLink, '_blank');
  }
    updateState() {
        this.metamaskBrightIdService.checkMetamaskState()
            .subscribe({
                next: value => {
                    console.log("Metamask state:", value);
                    if (value == MetamaskState.READY)
                        this.nextStep.emit();
                    this.state = value;
                }
            })
    }

    switchChain() {
        this.metamaskBrightIdService.switchToMannaChain().subscribe({
            next: value => {
                this.alertService.open("Chain Switched to " + mannaChainName, {
                    status: "success"
                }).subscribe();
                this.state = MetamaskState.READY;
                this.nextStep.emit();
            },
            error: err => {
                this.alertService.open("Failed to switch chain", {
                    status: "error"
                }).subscribe();
            }
        });
    }

    connectMetamask() {
        this.metamaskBrightIdService.connect()
            .subscribe({
                next: account => {
                    this.alertService.open("Connected to account: " + account, {
                        status: "success"
                    }).subscribe();
                    this.state = MetamaskState.CONNECTED;
                    this.updateState();
                },
                error: err => {
                    this.alertService.open("Failed to connect Metamask", {
                        status: "error"
                    }).subscribe();
                    this.state = MetamaskState.NOT_CONNECTED;
                }
            });
    }
}
