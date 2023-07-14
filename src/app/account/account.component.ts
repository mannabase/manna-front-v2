import { Component } from '@angular/core';
interface Column {
    field: string;
    header: string;
}
class Card {
    name?: string;
    image?: string;
    price?: number;
  }
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