import { Component } from '@angular/core';
import {Subscription} from 'rxjs';
import {MetamaskBrightIdService} from '../metamask-bright-id.service';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss'],
})
export class AccountComponent {
  selectedTab: string = 'Account';
  walletAddress: string | null = null;
  accountSubscription: Subscription = new Subscription();
  displaySideBar: boolean = false;

  constructor(private metamaskService: MetamaskBrightIdService) {
  }

  changeTab(tabName: string) {
    this.selectedTab = tabName;
  }

  toggleSideBar(b: boolean) {
    this.displaySideBar = b;
  }

  ngOnInit() {
    this.accountSubscription = this.metamaskService.account$.subscribe((address) => {
      this.walletAddress = address;
    });
  }

  ngOnDestroy() {
    this.accountSubscription?.unsubscribe();
  }
}

