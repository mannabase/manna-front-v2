import {Component} from '@angular/core';

class Card {
  name?: string;
  image?: string;
  price?: number;
}

@Component({
  selector: 'app-marketplace',
  templateUrl: './marketplace.component.html',
  styleUrls: ['./marketplace.component.scss']
})
export class MarketplaceComponent {
  selectedCategory: any = null;
  items?: any[];
  categories: any[] = [
    {name: 'Accounting'},
    {name: 'Marketing'},
    {name: 'Production'},
    {name: 'Research'}
  ]
  cards: Card[] = [];

  ngOnInit() {
    this.selectedCategory = this.categories[1];
    this.items = [
      {
        label: 'LISTINGS',
      },
      {
        label: 'AUCTIONS',
      },
      {
        label: 'COLLECTIONS',
      },
    ];
    this.cards = [
      {name: 'Accounting', image: '../../assets/', price: 30},
      {name: 'Marketing'},
      {name: 'Production'},
      {name: 'Research'}
    ];
  }
}
