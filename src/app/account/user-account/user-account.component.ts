import {Component} from '@angular/core';
import {MessageService} from "primeng/api";
import {MetamaskBrightIdService} from 'src/app/metamask-bright-id.service';

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
  walletAddress: string = '0x394b4j494nn4j49494jd03b';

  constructor(readonly messageService: MessageService,public metamaskBrightIdService: MetamaskBrightIdService) {
  }


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
    this.messageService.add({severity: 'success', detail: 'Address Copied'});
  }
}
