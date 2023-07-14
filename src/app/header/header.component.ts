import { Component } from '@angular/core';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  menuItems: MenuItem[];

  constructor() {
    this.menuItems  = [
      {label: 'Home', routerLink: ['/']},
      {label: 'Dashboard',  routerLink: ['/dashboard']},
      {label: 'Marketplace',  routerLink: ['/marketplace']},
      {label: 'About',  routerLink: ['/about']},
      {label: 'Blog', routerLink: ['/blog']},
      {icon:"fa-solid fa-circle-user fa-lg",routerLink: ['/account'] },
      {icon:"fa-solid fa-cart-shopping fa-xl"},
    ];
  }
  toggleMenu() {
    // Toggle menu logic here
  }
}
