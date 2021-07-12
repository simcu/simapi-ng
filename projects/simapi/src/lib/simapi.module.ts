import {NgModule} from '@angular/core';
import {HttpClientModule} from '@angular/common/http';
import {SimApiService} from './simapi.service';
import {SimApiOidcService} from './simapi-oidc.service';
import {SimApiAuthService} from './simapi-auth.service';
import {SimApiConfigService} from './simapi-config.service';
import {LoginComponent} from './components/login/login.component';
import {SignInComponent} from './components/sign-in.component';
import {RouterModule, Routes} from '@angular/router';

export const router = RouterModule.forChild([
  {path: '/oidc/login', component: LoginComponent},
  {path: '/oidc/sign-in', component: SignInComponent}
]);

@NgModule({
  declarations: [
    LoginComponent,
    SignInComponent
  ],
  imports: [
    HttpClientModule,
    router
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
