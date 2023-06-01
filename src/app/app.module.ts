import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { SidebarModule } from 'primeng/sidebar';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { ImageModule } from 'primeng/image';
import { HttpClientModule } from '@angular/common/http';
import { AngularSvgIconModule,SvgLoader } from 'angular-svg-icon';

// export function svgLoaderFactory(http: HttpClient, transferState: TransferState, platformId: any): SvgServerLoader | SvgBrowserLoader {
//   if (isPlatformServer(platformId)) {
//     return new SvgServerLoader('../browser/assets', transferState);
//   } else {
//     return new SvgBrowserLoader(http, transferState);
//   }
// }

@NgModule({
  declarations: [AppComponent, HomeComponent],
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
    // AngularSvgIconModule.forRoot({
    //   loader: {
    //     provide: SvgLoader,
    //     useFactory: svgLoaderFactory,
    //     deps: [ HttpClient, TransferState, PLATFORM_ID ],
    //   },
    // }),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
