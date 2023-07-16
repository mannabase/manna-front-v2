import { Component } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Router, NavigationEnd , ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  menuItems: MenuItem[];
  isAccountPage: boolean = false;
  
  constructor(private router: Router, private activatedRoute: ActivatedRoute) {
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
  ngOnInit() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.isAccountPage = event.url.includes('/account');
        console.log("isAccountPage: ",this.isAccountPage )
      }
    });
  }
  toggleMenu() {
    // Toggle menu logic here
  }
}
