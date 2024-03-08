import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {HomeComponent} from './home/home.component';
import {MarketplaceComponent} from "./marketplace/marketplace.component";
import {AboutComponent} from "./about/about.component";
import {BlogComponent} from "./blog/blog.component";
import {AccountComponent} from './account/account.component';
import {BlogDetailComponent} from './blog/blog-detail/blog-detail.component';
import {WriteBlogComponent} from './blog/write-blog/write-blog.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
  {
    path: 'marketplace',
    component: MarketplaceComponent,
  },
  {
    path: 'about',
    component: AboutComponent,
  },
  {
    path: 'blog',
    component: BlogComponent,
  },
  {
    path: 'account',
    component: AccountComponent,
  },
  // { 
  //   path: 'wallet', 
  //   component: WriteBlogComponent 
  // },
  {
    path: 'blog/:id',
    component: BlogDetailComponent
  },
  { 
    path: 'write-blog', 
    component: WriteBlogComponent 
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {
}
