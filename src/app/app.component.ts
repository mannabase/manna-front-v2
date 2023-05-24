import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MenuItem, PrimeIcons, PrimeNGConfig } from 'primeng/api';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'manna-front-v2';
  display: boolean = false;
  items: MenuItem[];

  constructor(
    private primengConfig: PrimeNGConfig,
    private readonly router: Router
  ) {
    this.items = [
      { label: 'Home', icon: PrimeIcons.HOME, routerLink: ['/home'] },
    ];
  }

  ngOnInit() {
    this.primengConfig.ripple = true;
    this.router.navigate(['/home']);
  }
}
