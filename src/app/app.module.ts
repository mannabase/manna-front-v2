import {NgDompurifySanitizer} from "@tinkoff/ng-dompurify"
import {
    TUI_SANITIZER,
    TuiAlertModule,
    TuiButtonModule,
    TuiDialogModule,
    TuiLinkModule,
    TuiLoaderModule,
    TuiRootModule,
    TuiSvgModule,
} from "@taiga-ui/core"
import {NgModule} from '@angular/core'
import {BrowserModule} from '@angular/platform-browser'

import {BrowserAnimationsModule} from '@angular/platform-browser/animations'
import {AppRoutingModule} from './app-routing.module'
import {AppComponent} from './app.component'
import {HomeComponent} from './home/home.component'
import {HttpClientModule} from '@angular/common/http'
import {AngularSvgIconModule} from 'angular-svg-icon'
import {InfoBoxComponent} from './home/info-box/info-box.component'
import {IntroCardComponent} from './home/intro-card/intro-card.component'
import {HeaderComponent} from './header/header.component'
import {MarketplaceComponent} from './marketplace/marketplace.component'
import {AboutComponent} from './about/about.component'
import {BlogComponent} from './blog/blog.component'
import {FormsModule, ReactiveFormsModule} from "@angular/forms"
import {AccountComponent} from './account/account.component'
import {WalletComponent} from './account/wallet/wallet.component'
import {UserAccountComponent} from './account/user-account/user-account.component'
import {BlogDetailComponent} from './blog/blog-detail/blog-detail.component'
import {MetamaskBrightIdService} from './metamask-bright-id.service'
import {MannaService} from './manna.service'
import {VerifyService} from './verify.service'
import {VerificationDialogComponent} from './verification-dialog/verification-dialog.component'
import {TuiMobileDialogModule, TuiSidebarModule} from '@taiga-ui/addon-mobile'
import {TuiActiveZoneModule} from '@taiga-ui/cdk'
import {ClaimDialogComponent} from './claim-dialog/claim-dialog.component'
import {TuiStepperModule} from "@taiga-ui/kit"
import {MetamaskConnectionComponent} from './claim-dialog/metamask-connection/metamask-connection.component'
import {ClaimMannaComponent} from './claim-dialog/claim-manna/claim-manna.component'
import {FooterComponent} from './footer/footer.component'
import {DailyRewardDialogComponent} from './account/wallet/daily-reward-dialog/daily-reward-dialog.component'
import {TuiAccordionModule} from '@taiga-ui/kit';

@NgModule({
  declarations: [AppComponent, HomeComponent, InfoBoxComponent, IntroCardComponent, HeaderComponent, MarketplaceComponent,
    AboutComponent, BlogComponent, AccountComponent, WalletComponent, UserAccountComponent, BlogDetailComponent, VerificationDialogComponent, ClaimDialogComponent, MetamaskConnectionComponent, ClaimMannaComponent, FooterComponent, DailyRewardDialogComponent],
    imports: [
        BrowserModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        HttpClientModule,
        AngularSvgIconModule,
        FormsModule,
        ReactiveFormsModule,
        TuiRootModule,
        TuiDialogModule,
        TuiMobileDialogModule,
        TuiAlertModule,
        TuiSidebarModule,
        TuiActiveZoneModule,
        TuiButtonModule,
        TuiLinkModule,
        TuiStepperModule,
        TuiSvgModule,
        TuiLoaderModule,
        TuiAccordionModule
    ],
  providers: [MetamaskBrightIdService, MannaService, VerifyService,
    {
      provide: TUI_SANITIZER,
      useClass: NgDompurifySanitizer
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
}
