import { TuiCardLarge } from "@taiga-ui/layout";
import { TUI_SANITIZER } from "@taiga-ui/legacy";
import { NG_EVENT_PLUGINS } from "@taiga-ui/event-plugins";
import {NgDompurifySanitizer} from "@taiga-ui/dompurify"
import { TuiRoot, TuiAlert, TuiLoader, TuiIcon, TuiSurface, TuiLink, TuiDialog, TuiButton } from "@taiga-ui/core"
import {NgModule,CUSTOM_ELEMENTS_SCHEMA} from '@angular/core'
import {BrowserModule} from '@angular/platform-browser'
import { CommonModule } from '@angular/common';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations'
import {AppRoutingModule} from './app-routing.module'
import {AppComponent} from './app.component'
import {HomeComponent} from './home/home.component'
import { provideHttpClient, withInterceptors, withInterceptorsFromDi } from "@angular/common/http"
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
import {MetamaskService} from './metamask.service'
import {MannaService} from './manna.service'
import {VerifyService} from './verify.service'
import { ClaimService } from "./claim.service"
import { LoadingService } from "./loading.service"
import { ContractService } from "./contract.service"
import {VerificationDialogComponent} from './verification-dialog/verification-dialog.component'
import { TuiSidebar, TuiMobileDialog } from '@taiga-ui/addon-mobile'
import { TuiActiveZone, TuiLet } from '@taiga-ui/cdk'
import {ClaimDialogComponent} from './claim-dialog/claim-dialog.component'
import { TuiAccordion, TuiStepper, TuiButtonLoading } from "@taiga-ui/kit"
import {MetamaskConnectionComponent} from './claim-dialog/metamask-connection/metamask-connection.component'
import {ClaimMannaComponent} from './claim-dialog/claim-manna/claim-manna.component'
import {FooterComponent} from './footer/footer.component'
import {DailyRewardDialogComponent} from './account/wallet/daily-reward-dialog/daily-reward-dialog.component'
import {WriteBlogComponent} from './blog/write-blog/write-blog.component';
import {httpInterceptor} from "./http.interceptor";


@NgModule({ declarations: [AppComponent, HomeComponent, InfoBoxComponent, IntroCardComponent, HeaderComponent, MarketplaceComponent,
        AboutComponent, BlogComponent, AccountComponent, WalletComponent, UserAccountComponent, BlogDetailComponent, VerificationDialogComponent, ClaimDialogComponent, MetamaskConnectionComponent, ClaimMannaComponent, FooterComponent, WriteBlogComponent, DailyRewardDialogComponent],
    bootstrap: [AppComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA], imports: [BrowserModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        AngularSvgIconModule,
        FormsModule,
        ReactiveFormsModule,
        TuiRoot,
        TuiDialog,
        TuiMobileDialog,
        TuiAlert,
        ...TuiSidebar,
        TuiActiveZone,
        TuiButton,
        TuiLink,
        ...TuiStepper,
        TuiIcon,
        TuiLoader,
        ...TuiAccordion,
        CommonModule,
        TuiLet,
        TuiCardLarge, TuiSurface, TuiButtonLoading], providers: [MetamaskService, MannaService, VerifyService, ClaimService, ContractService, LoadingService,
        provideHttpClient(withInterceptors([httpInterceptor])),
        {
            provide: TUI_SANITIZER,
            useClass: NgDompurifySanitizer
        }, provideHttpClient(withInterceptorsFromDi()), NG_EVENT_PLUGINS] })
export class AppModule {
}

