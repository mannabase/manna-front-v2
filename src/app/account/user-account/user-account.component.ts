import { Component } from '@angular/core';

class Card {
  name?: string;
  image?: string;
  price?: number;
}
@Component({
  selector: 'app-user-account',
  templateUrl: './user-account.component.html',
  styleUrls: ['./user-account.component.scss']
})
export class UserAccountComponent {
    cards: Card[] = [];
    items!: string[];

    ngOnInit() {
        this.items = Array.from({ length: 7 }).map((_, i) => `Item #${i}`);
        this.cards = [
            {name: 'GNOMER #234', image:"../../assets/images/marketplace_sample1.png", price: 30},
            {name: 'SPRING WATER', image:"../../assets/images/marketplace_sample2.png", price: 30},
            {name: 'GNOMER #1234', image:"../../assets/images/marketplace_sample3.png", price: 30},
            {name: 'GNOMER #234', image:"../../assets/images/marketplace_sample1.png", price: 30},
            {name: 'SPRING WATER', image:"../../assets/images/marketplace_sample2.png", price: 30},
            {name: 'GNOMER #1234', image:"../../assets/images/marketplace_sample3.png", price: 30},
        ]
    }
}
