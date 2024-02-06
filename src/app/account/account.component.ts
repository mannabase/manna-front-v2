import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { MetamaskBrightIdService } from '../metamask-bright-id.service';
import { VerifyService, VerifyState } from '../verify.service';
import { ContractService } from '../contract.service';

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
  isVerified: boolean = false;
  private subscriptions = new Subscription();

  constructor(
    private metamaskService: MetamaskBrightIdService,
    private verifyService: VerifyService,
    private contractService: ContractService
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
    // Combine account and verification state subscriptions
    const accountSubscription = this.metamaskService.account$.subscribe(address => {
      this.walletAddress = address;
      if (address) {
        this.verifyService.verifyUser(address);
      }
    });

    const verificationSubscription = this.verifyService.verificationState$.subscribe(state => {
      this.isVerified = state === VerifyState.VERIFIED;
      this.showBanner = !this.isVerified;
    });

    // Add subscriptions to the Subscription object for cleanup
    this.subscriptions.add(accountSubscription);
    this.subscriptions.add(verificationSubscription);
  }

  ngOnDestroy() {
    // Unsubscribe from all subscriptions to prevent memory leaks
    this.subscriptions.unsubscribe();
  }
}
