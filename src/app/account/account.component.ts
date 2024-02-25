import {Component, OnDestroy, OnInit} from '@angular/core'
import {Subscription} from 'rxjs'
import {MetamaskService} from '../metamask.service'
import {VerifyService, VerifyState} from '../verify.service'
import {ContractService} from '../contract.service'
import {TuiAlertService} from '@taiga-ui/core'

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

    constructor(
        private metamaskService: MetamaskService,
        private verifyService: VerifyService,
        private contractService: ContractService,
        readonly alertService: TuiAlertService,
    ) {
    }

    changeTab(tabName: string) {
        this.selectedTab = tabName
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
            if (address) {
                // this.verifyService.checkUserVerification(address);
            }
        })

        const verificationSubscription = this.verifyService.verificationState$.subscribe(state => {
            this.isVerified = state === VerifyState.VERIFIED
            this.showBanner = !this.isVerified
        })

        // Add subscriptions to the Subscription object for cleanup
        this.subscriptions.add(accountSubscription)
        this.subscriptions.add(verificationSubscription)
    }

    ngOnDestroy() {
        this.subscriptions.unsubscribe()
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
