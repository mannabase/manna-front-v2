import {Component} from '@angular/core';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss']
})
export class AccountComponent {
  selectedTab: string = 'Account';

  changeTab(tabName: string) {
    this.selectedTab = tabName;
  }

}
