import {Component} from '@angular/core';
import {MenuItem, PrimeIcons} from "primeng/api";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  display: boolean = false;
  items: MenuItem[];

  constructor() {
    this.items = [
      {label: 'Home', routerLink: ['/']},
      {label: 'Dashboard',  routerLink: ['/dashboard']},
      {label: 'Marketplace',  routerLink: ['/marketplace']},
      {label: 'About',  routerLink: ['/about']},
      {label: 'Blog', routerLink: ['/blog']},
      {icon:"fa-solid fa-circle-user fa-xl" },
      {icon:"fa-solid fa-cart-shopping fa-xl"},
    ];
  }
}
