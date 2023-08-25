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

  first1: number = 0;

  rows1: number = 10;

  first2: number = 0;

  rows2: number = 10;

  first3: number = 0;

  rows3: number = 10;

  totalRecords: number = 120;

  options = [
    {label: 5, value: 5},
    {label: 10, value: 10},
    {label: 20, value: 20},
    {label: 120, value: 120}
  ]

  onPageChange1(event: any) {
    this.first1 = event.first;
    this.rows1 = event.rows;
  }

  onPageChange2(event: any) {
    this.first2 = event.first;
    this.rows2 = event.rows;
  }

  onPageChange3(event: any) {
    this.first3 = event.first;
    this.rows3 = event.rows;
  }

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
      {name: 'GNOMER #234', image: "../../assets/images/marketplace_sample1.webp", price: 30},
      {name: 'SPRING WATER', image: "../../assets/images/marketplace_sample2.webp", price: 30},
      {name: 'GNOMER #1234', image: "../../assets/images/marketplace_sample3.webp", price: 30},
    ];
  }
}
