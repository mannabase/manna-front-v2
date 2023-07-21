import { Component, OnInit, OnDestroy } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { ActivatedRoute, Router, NavigationStart } from '@angular/router';
import { filter } from 'rxjs/operators';
import { MetamaskService } from '../metamask.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  menuItems: MenuItem[];
  isAccountPage: boolean = false;
  showMenu: boolean = false;
  showHomeButton: boolean = true;
  walletAddress: string | null = null;
  private accountSubscription: Subscription = new Subscription();

  constructor(
    private router: Router,
     private activatedRoute: ActivatedRoute,
     private metamaskService: MetamaskService)
     {
    this.menuItems = [
      { label: 'Home', routerLink: ['/'] },
      { label: 'Dashboard', routerLink: ['/dashboard'] },
      { label: 'Marketplace', routerLink: ['/marketplace'] },
      { label: 'About', routerLink: ['/about'] },
      { label: 'Blog', routerLink: ['/blog'] },
      { icon: 'fa-solid fa-circle-user fa-lg', routerLink: ['/account'] },
      { icon: 'fa-solid fa-cart-shopping fa-xl' },
    ];
  }

  ngOnInit() {
    this.router.events.pipe(
      filter((event): event is NavigationStart => event instanceof NavigationStart)
    ).subscribe((event: NavigationStart) => {
      if (event.url === '/') {
        this.menuItems = this.menuItems.filter(item => item.label !== 'Home');
      } else {
        if (!this.menuItems.find(item => item.label === 'Home')) {
          this.menuItems.unshift({ label: 'Home', routerLink: ['/'] });
        }
      }

      this.isAccountPage = event.url.includes('/account');
      console.log('isAccountPage: ', this.isAccountPage);
    });
    this.accountSubscription = this.metamaskService.account$.subscribe(address => {
      this.walletAddress = address;
    });
  }
  ngOnDestroy() {
    this.accountSubscription?.unsubscribe();
  }
  toggleMenu() {
    this.showMenu = !this.showMenu;
  }
  hideMenuOnItemClick() {
    if (window.innerWidth <= 768) {
      this.showMenu = false;
    }
  }
}
