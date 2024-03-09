import {Component, Inject, OnDestroy, OnInit ,ChangeDetectionStrategy} from '@angular/core'
import {VerifyService} from '../verify.service'
import {CommonModule} from '@angular/common'
import {TuiLetModule} from "@taiga-ui/cdk"
import {TuiAlertService, TuiDialogContext, TuiLoaderModule} from "@taiga-ui/core"
import {MetamaskService} from "../metamask.service"
import {POLYMORPHEUS_CONTEXT} from "@tinkoff/ng-polymorpheus"
import { LoadingService } from 'src/app/loading.service'


@Component({
    selector: 'app-score-dialog',
    templateUrl: './score-dialog.component.html',
    styleUrls: ['./score-dialog.component.scss'],
    standalone: true,
    imports: [CommonModule, TuiLetModule, TuiLoaderModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScoreDialogComponent implements OnInit, OnDestroy {

    constructor(
        public verifyService: VerifyService,
        public alertService: TuiAlertService,
        public metamaskService: MetamaskService,
        readonly loadingService:LoadingService,
        @Inject(POLYMORPHEUS_CONTEXT) readonly context: TuiDialogContext<number, number>,
    ) {
    }

    ngOnInit() {
    }

    ngOnDestroy() {
    }

    submitScoreToContract() {
        this.verifyService.sendScoreToContract(this.metamaskService.account$.value).subscribe({
            next: () => {
                this.context.completeWith(0)
                this.alertService.open('Score submitted successfuly.', {status: 'success', label: 'Success'}).subscribe()
            },
            error: (error) => {
                this.alertService.open('Failed to submit score.', {status: 'error', label: 'Error'}).subscribe()
            }
        })
    }

}

