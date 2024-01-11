import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { externalLinks } from '../config';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
  isAccount: boolean = false;
  twitterUrl = externalLinks.twitterUrl;
  discordUrl = externalLinks.discordUrl;
  mediumUrl = externalLinks.mediumUrl;
  emailUrl =externalLinks.emailUrl;

  constructor(private router: Router) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.isAccount = event.url === '/account'; 
      }
    });
  }
}
