import {Component, Inject, OnDestroy, OnInit} from '@angular/core'
import {VerifyService} from '../verify.service'
import {CommonModule} from '@angular/common'
import {TuiLetModule} from "@taiga-ui/cdk"
import {TuiAlertService, TuiDialogContext, TuiLoaderModule} from "@taiga-ui/core"
import {MetamaskService} from "../metamask.service"
import {POLYMORPHEUS_CONTEXT} from "@tinkoff/ng-polymorpheus"


@Component({
    selector: 'app-score-dialog',
    templateUrl: './score-dialog.component.html',
    styleUrls: ['./score-dialog.component.scss'],
    standalone: true,
    imports: [CommonModule, TuiLetModule, TuiLoaderModule],
})
export class ScoreDialogComponent implements OnInit, OnDestroy {
    loading: boolean = false

    constructor(
        public verifyService: VerifyService,
        public alertService: TuiAlertService,
        public metamaskService: MetamaskService,
        @Inject(POLYMORPHEUS_CONTEXT) readonly context: TuiDialogContext<number, number>,
    ) {
    }

    ngOnInit() {
    }

    ngOnDestroy() {
    }

    submitScoreToContract() {
        this.loading = true
        this.verifyService.sendScoreToContract(this.metamaskService.account$.value).subscribe({
            next: () => {
                this.loading = false
                this.context.completeWith(0)
            },
            error: (error) => {
                this.loading = false
                this.alertService.open('Failed to submit score.', {status: 'error', label: 'Error'})
            },
        })
    }

}

