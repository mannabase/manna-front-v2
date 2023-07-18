import {Component} from '@angular/core';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss']
})
export class AccountComponent {
  selectedTab: string = 'Tab 1';

  changeTab(tabName: string) {
    this.selectedTab = tabName;
  }
}
