<<<<<<< HEAD
import { Component } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Router, NavigationEnd , ActivatedRoute } from '@angular/router';
import { MethodsService } from 'src/app/methods.service';
import { Subscription } from 'rxjs';
=======
import {Component} from '@angular/core';
import {MenuItem} from 'primeng/api';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
>>>>>>> 7b1d482cfb76d7767c8951dd012f7774a154ae07

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  menuItems: MenuItem[];
  isAccountPage: boolean = false;
<<<<<<< HEAD
  walletAddress: string | null = null;
  private accountSubscription: Subscription | undefined;

  constructor(private router: Router, private activatedRoute: ActivatedRoute,private methodsService: MethodsService) {
    this.menuItems  = [
=======

  constructor(private router: Router, private activatedRoute: ActivatedRoute) {
    this.menuItems = [
>>>>>>> 7b1d482cfb76d7767c8951dd012f7774a154ae07
      {label: 'Home', routerLink: ['/']},
      {label: 'Dashboard', routerLink: ['/dashboard']},
      {label: 'Marketplace', routerLink: ['/marketplace']},
      {label: 'About', routerLink: ['/about']},
      {label: 'Blog', routerLink: ['/blog']},
      {icon: "fa-solid fa-circle-user fa-lg", routerLink: ['/account']},
      {icon: "fa-solid fa-cart-shopping fa-xl"},
    ];
  }

  ngOnInit() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.isAccountPage = event.url.includes('/account');
        console.log("isAccountPage: ", this.isAccountPage)
      }
    });
    this.accountSubscription = this.methodsService.account$.subscribe(address => {
      this.walletAddress = address;
    });
  }
  ngOnDestroy() {
    this.accountSubscription?.unsubscribe();
  }

  toggleMenu() {
    // Toggle menu logic here
  }
}
