import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {MetamaskBrightIdService, MetamaskState} from "../../metamask-bright-id.service";
import {mannaChainName} from "../../config";
import {TuiAlertService} from "@taiga-ui/core";

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

    constructor(readonly metamaskBrightIdService: MetamaskBrightIdService,
                readonly alertService: TuiAlertService) {
    }

    ngOnInit() {
        this.metamaskBrightIdService.checkMetamaskState()
            .subscribe({
                next: value => {
                    if (value == MetamaskState.CONNECTED)
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
                })
            },
            error: err => {
                this.alertService.open("Failed to switch chain", {
                    status: "error"
                })
            }
        });
    }

    connectMetamask() {
        this.metamaskBrightIdService.connect()
            .subscribe({
                next: account => {
                    this.alertService.open("Connected to account: " + account, {
                        status: "success"
                    });
                    this.nextStep.emit()
                    this.state = MetamaskState.CONNECTED;
                },
                error: err => {
                    this.alertService.open("Failed to connect Metamask", {
                        status: "error"
                    });
                    this.state = MetamaskState.NOT_CONNECTED;
                }
            });
    }
}
