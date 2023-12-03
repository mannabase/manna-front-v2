import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { MetamaskBrightIdService } from '../metamask-bright-id.service';
import { UserScoreService } from '../user-score.service';

@Component({
    selector: 'app-account',
    templateUrl: './account.component.html',
    styleUrls: ['./account.component.scss'],
})
export class AccountComponent implements OnInit, OnDestroy {
    selectedTab: string = 'Account';
    walletAddress: string | null = null;
    accountSubscription: Subscription = new Subscription();
    displaySideBar: boolean = false;
    showBanner: boolean = true;
    userScore: number | null = null;

    constructor(
        private metamaskService: MetamaskBrightIdService,
        private userScoreService: UserScoreService,
    ) {}

    changeTab(tabName: string) {
        this.selectedTab = tabName;
    }

    toggleSideBar(b: boolean) {
        this.displaySideBar = b;
    }

    closeBanner() {
        this.showBanner = false;
    }

    ngOnInit() {
        this.accountSubscription = this.metamaskService.account$.subscribe((address) => {
            this.walletAddress = address;
        });

        this.userScoreService.userScoreAvailable.subscribe((hasScore) => {
            if (hasScore) {
                this.userScore = this.userScoreService.userScore;
                // Set the initial state of showBanner based on userScore
                this.showBanner = this.userScore !== null && this.userScore < 25;
            }
        });

        // Initialize the user's score if available and set the initial state of showBanner
        if (this.userScoreService.userScore !== null) {
            this.userScore = this.userScoreService.userScore;
            this.showBanner = this.userScore < 25;
        }
    }

    ngOnDestroy() {
        this.accountSubscription?.unsubscribe();
    }
}
