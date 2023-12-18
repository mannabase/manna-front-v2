import {Component, OnDestroy, OnInit,HostListener } from '@angular/core';
import {ActivatedRoute, NavigationStart, Router} from '@angular/router';
import {filter} from 'rxjs/operators';
import {MetamaskBrightIdService} from '../metamask-bright-id.service';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  menuItems: any[];
  isAccountPage: boolean = false;
  walletAddress: string | null = null;
  displaySideBar: boolean = false;
  accountSubscription: Subscription = new Subscription();
  showBurgerMenu: boolean = false;

  public isScrolled = false;

  @HostListener('window:scroll', [])
  onScroll(): void {
    const scrolled = window.scrollY || document.documentElement.scrollTop;
    if (scrolled > 10) {
      this.isScrolled = true;
    } else {
      this.isScrolled = false;
    }
  }

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private metamaskService: MetamaskBrightIdService) {
    this.menuItems = [
      {label: 'Home', routerLink: ['/']},
      // {label: 'Marketplace', routerLink: ['/marketplace']},
      {label: 'About', routerLink: ['/about']},
      {label: 'Blog', routerLink: ['/blog']},
      {label: 'Account', icon: 'fa-solid fa-circle-user fa-lg', routerLink: ['/account']},
    ];
  }

  ngOnInit() {
    this.router.events.pipe(filter((event): event is NavigationStart => event instanceof NavigationStart)
    ).subscribe((event: NavigationStart) => {
      this.isAccountPage = event.url.includes('/account');
    });
    this.accountSubscription = this.metamaskService.account$.subscribe(address => {
      this.walletAddress = address;
    });
    this.handleResize();
    window.addEventListener('resize', this.handleResize.bind(this));
  }

  ngOnDestroy() {
    this.accountSubscription?.unsubscribe();
    window.removeEventListener('resize', this.handleResize.bind(this));
  }

  handleResize() {
    this.showBurgerMenu = window.innerWidth <= 1024;
  }

  toggleSideBar(b: boolean) {
    this.displaySideBar = b;
  }
}
