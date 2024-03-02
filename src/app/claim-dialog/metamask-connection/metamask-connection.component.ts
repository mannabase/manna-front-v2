import {Component, EventEmitter, OnInit, Output} from '@angular/core'
import {MetamaskService, MetamaskState} from "../../metamask.service"
import {mannaChainName} from "../../config"
import {TuiAlertService} from "@taiga-ui/core"
import {takeUntilDestroyed} from "@angular/core/rxjs-interop"

@Component({
    selector: 'app-metamask-connection',
    templateUrl: './metamask-connection.component.html',
    styleUrls: ['./metamask-connection.component.scss'],
})
export class MetamaskConnectionComponent implements OnInit {
    @Output() nextStep = new EventEmitter<any>()
    MetamaskState = MetamaskState
    mannaChain = mannaChainName
    metamaskBrightIdService: any
    state: any

    constructor(
        readonly metamaskService: MetamaskService,
        readonly alertService: TuiAlertService,
    ) {
        metamaskService.metamaskState$.pipe(takeUntilDestroyed())
            .subscribe(value => {
                if (value == MetamaskState.READY)
                    this.nextStep.emit()
            })
    }

    ngOnInit() {
        this.metamaskService.metamaskState$.pipe(takeUntilDestroyed())
            .subscribe(value => {
                if (value == MetamaskState.READY)
                    this.nextStep.emit()
            })
    }
    installMetamask() {
        window.open('https://metamask.io/download/', '_blank')
    }
}
