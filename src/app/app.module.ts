import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {ButtonModule} from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import {MenuModule} from 'primeng/menu';
import {SidebarModule} from 'primeng/sidebar';
import {ToastModule} from 'primeng/toast';
import {ToolbarModule} from 'primeng/toolbar';
import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {HomeComponent} from './home/home.component';
import {ImageModule} from 'primeng/image';
import {HttpClientModule} from '@angular/common/http';
import {AngularSvgIconModule} from 'angular-svg-icon';
import {InfoBoxComponent} from './info-box/info-box.component';
import {IntroCardComponent} from './intro-card/intro-card.component';
import {HeaderComponent} from './header/header.component';
import {MarketplaceComponent} from './marketplace/marketplace.component';
import {AboutComponent} from './about/about.component';
import {DashboardComponent} from './dashboard/dashboard.component';
import {BlogComponent} from './blog/blog.component';
import {MenubarModule} from "primeng/menubar";
import {CardModule} from "primeng/card";
import {InputTextModule} from "primeng/inputtext";
import {RadioButtonModule} from "primeng/radiobutton";
import {FormsModule} from "@angular/forms";
import {PaginatorModule} from 'primeng/paginator';
import {AccountComponent} from './account/account.component';
import {TabViewModule} from 'primeng/tabview';
import {WalletComponent} from './account/wallet/wallet.component';
import {UserAccountComponent} from './account/user-account/user-account.component';
import {BlogDetailComponent} from './blog-detail/blog-detail.component';
import { MetamaskService } from './metamask.service';
import Swal from 'sweetalert2';
import QRCode from 'qrcode';

@NgModule({
  declarations: [AppComponent, HomeComponent, InfoBoxComponent, IntroCardComponent, HeaderComponent, MarketplaceComponent, AboutComponent, DashboardComponent, BlogComponent, AccountComponent, WalletComponent, UserAccountComponent, BlogDetailComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    ToolbarModule,
    ButtonModule,
    SidebarModule,
    MenuModule,
    ToastModule,
    ImageModule,
    HttpClientModule,
    AngularSvgIconModule,
    MenubarModule,
    CardModule,
    InputTextModule,
    RadioButtonModule,
    FormsModule,
    PaginatorModule,
    TabViewModule,
    DialogModule,
  ],
  providers: [MetamaskService],
  bootstrap: [AppComponent],
})
export class AppModule {
}
