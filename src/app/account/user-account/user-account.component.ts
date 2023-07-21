import {Component} from '@angular/core';
import Swal from 'sweetalert2';
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
  walletAddress: string='0x394b4j494nn4j49494jd03b';
  ngOnInit() {
    this.items = Array.from({length: 7}).map((_, i) => `Item #${i}`);
    this.cards = [
      {name: 'GNOMER #234', image: "../../assets/images/marketplace_sample1.png", price: 30},
      {name: 'SPRING WATER', image: "../../assets/images/marketplace_sample2.png", price: 30},
      {name: 'GNOMER #1234', image: "../../assets/images/marketplace_sample3.png", price: 30},
      {name: 'GNOMER #234', image: "../../assets/images/marketplace_sample1.png", price: 30},
      {name: 'SPRING WATER', image: "../../assets/images/marketplace_sample2.png", price: 30},
      {name: 'GNOMER #1234', image: "../../assets/images/marketplace_sample3.png", price: 30},
    ]
  }
  copyToClipboard() {
    const textField = document.createElement('textarea');
    textField.innerText = this.walletAddress;
    document.body.appendChild(textField);
    textField.select();
    document.execCommand('copy');
    textField.remove();
    Swal.fire({
      icon: 'success',
      title: 'Address Copied!',
      // text: 'Wallet address has been copied to the clipboard.',
      timer: 2000,
      showConfirmButton: false,
      position: 'bottom',
    });
  }
}
