import {NgModule} from '@angular/core';
import {HttpClientModule} from '@angular/common/http';
import {SimApiService} from './simapi.service';
import {SimApiOidcService} from './simapi-oidc.service';
import {SimApiAuthService} from './simapi-auth.service';
import {SimApiConfigService} from './simapi-config.service';
import {SignInComponent} from './sign-in.component';
import {RouterModule} from '@angular/router';
import {SignOutComponent} from './sign-out.component';
import {SignInRedirectComponent} from './sign-in-redirect.component';

@NgModule({
  declarations: [
    SignInComponent,
    SignOutComponent,
    SignInRedirectComponent
  ],
  imports: [
    HttpClientModule,
    RouterModule.forChild([
      {path: 'oidc/sign-in', component: SignInComponent},
      {path: 'oidc/sign-out', component: SignOutComponent},
      {path: 'oidc/redirect', component: SignInRedirectComponent}
    ])
  ],
  providers: [
    SimApiService,
    SimApiOidcService,
    SimApiAuthService,
    SimApiConfigService,
  ],
  exports: []
})
export class SimApiModule {
}
