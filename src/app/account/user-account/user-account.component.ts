import { Component, EventEmitter, Injector, OnDestroy, OnInit, Output, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { TuiAlertService, TuiDialogService } from '@taiga-ui/core';
import { PolymorpheusComponent } from '@taiga-ui/polymorpheus';
import { ScoreDialogComponent } from '../../score-dialog/score-dialog.component';
import { LocalScoreData, VerifyService, VerifyState } from 'src/app/verify.service';
import { MetamaskService, MetamaskState } from "../../metamask.service";
import { LoadingService } from 'src/app/loading.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-user-account',
    templateUrl: './user-account.component.html',
    styleUrls: ['./user-account.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})

export class UserAccountComponent implements OnInit, OnDestroy {
    walletAddress: string | null = null;
    loader: boolean = false;
    localScore?: number;
    protected readonly VerifyState = VerifyState;
    protected readonly MetamaskState = MetamaskState;
    private accountStateSubscription: Subscription | undefined;

    @Output() userScoreAvailable: EventEmitter<boolean> = new EventEmitter<boolean>();
    signature?: string;

    constructor(
        readonly metamaskService: MetamaskService,
        readonly alertService: TuiAlertService,
        public verifyService: VerifyService,
        readonly dialogService: TuiDialogService,
        private injector: Injector,
        readonly loadingService: LoadingService,
        private cdr: ChangeDetectorRef // Inject ChangeDetectorRef
    ) {}

    ngOnInit() {
        this.checkLocalScore();
        this.accountStateSubscription = this.verifyService.getRefreshAccount().subscribe(refresh => {
            if (refresh) {
                this.verifyService.updateServerScore();
                this.cdr.detectChanges(); 
            }
        });

        this.verifyService.verificationState$.subscribe(() => {
            this.cdr.detectChanges();
        });

        this.metamaskService.metamaskState$.subscribe(() => {
            this.cdr.detectChanges();
        });
    }

    ngOnDestroy() {
        this.accountStateSubscription?.unsubscribe();
    }

    checkLocalScore() {
        const scoreDataString = localStorage.getItem('localScore');
        const scoreData: LocalScoreData | null = scoreDataString ? JSON.parse(scoreDataString) : null;
        const currentTime = Date.now();
        const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
        const isLocalScoreValid = scoreData && currentTime - scoreData.timestamp < sevenDaysInMs;
        this.localScore = (isLocalScoreValid ? scoreData.score / 1000000 : undefined);
        this.cdr.detectChanges(); 
    }

    openLinkInNewTab() {
        window.open('https://passport.gitcoin.co', '_blank');
    }

    refreshUserScore() {
        this.verifyService.updateServerScore()
            .subscribe(value => {
                this.openDialogScore();
                this.cdr.detectChanges();
            });
    }

    openDialogScore() {
        this.checkLocalScore();
        this.dialogService.open(new PolymorpheusComponent(ScoreDialogComponent, this.injector), {
            dismissible: true,
        }).subscribe(() => {
            this.cdr.detectChanges(); 
        });
    }
}
