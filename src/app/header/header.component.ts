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
      {label: 'Home', icon: PrimeIcons.HOME, routerLink: ['/']},
      {label: 'Dashboard', icon: PrimeIcons.HOME, routerLink: ['/dashboard']},
      {label: 'Marketplace', icon: PrimeIcons.MAP_MARKER, routerLink: ['/marketplace']},
      {label: 'About', icon: PrimeIcons.HOME, routerLink: ['/about']},
      {label: 'Blog', icon: PrimeIcons.HOME, routerLink: ['/blog']},
    ];
  }
}
