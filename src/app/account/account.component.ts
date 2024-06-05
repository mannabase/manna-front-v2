import {Component, OnDestroy, OnInit} from '@angular/core'
import {Subscription} from 'rxjs'
import {VerifyService, VerifyState} from '../verify.service'
import {ContractService} from '../contract.service'
import {TuiAlertService} from '@taiga-ui/core'
import { MetamaskService, MetamaskState } from 'src/app/metamask.service';

@Component({
    selector: 'app-account',
    templateUrl: './account.component.html',
    styleUrls: ['./account.component.scss'],
})
export class AccountComponent implements OnInit, OnDestroy {
    selectedTab: string = 'Account'
    walletAddress: string | null = null
    accountSubscription: Subscription = new Subscription()
    displaySideBar: boolean = false
    showBanner: boolean = true
    isVerified: boolean = false
    private subscriptions = new Subscription()
    private accountStateSubscription: Subscription | undefined;
    protected readonly VerifyState = VerifyState

    constructor(
        public metamaskService: MetamaskService,
        public verifyService: VerifyService,
        private contractService: ContractService,
        readonly alertService: TuiAlertService,
    ) {
        this.selectedTab = localStorage.getItem('selectedTab') || 'Account';
    }

    changeTab(tabName: string) {
        this.selectedTab = tabName,
        localStorage.setItem('selectedTab', tabName);
    }

    toggleSideBar(b: boolean) {
        this.displaySideBar = b
    }

    closeBanner() {
        this.showBanner = false
    }

    ngOnInit() {
        const accountSubscription = this.metamaskService.account$.subscribe(address => {
            this.walletAddress = address
        })

        const verificationSubscription = this.verifyService.verificationState$.subscribe(state => {
            this.isVerified = state === VerifyState.VERIFIED
            this.showBanner = !this.isVerified
        })

        this.subscriptions.add(accountSubscription)
        this.subscriptions.add(verificationSubscription)

        this.accountStateSubscription = this.verifyService.getRefreshAccount().subscribe(refresh => {
            if (refresh) {
              this.verifyService.updateVerificationState()
            }
        });
    }

    ngOnDestroy() {
        this.subscriptions.unsubscribe()
        this.accountStateSubscription?.unsubscribe();
    }

    copyWalletAddress(walletAddress: string | null): void {
        if (!walletAddress) {
            console.error('No wallet address available to copy.')
            return
        }
        navigator.clipboard.writeText(walletAddress).then(() => {
            this.alertService.open("Copied!", {status: "success"}).subscribe()
        }).catch(err => {
            this.alertService.open("Not Copied!", {status: "error"}).subscribe()
        })
    }
}
