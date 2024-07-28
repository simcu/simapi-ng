import {NgModule} from '@angular/core';
import {provideHttpClient, withInterceptorsFromDi} from '@angular/common/http';
import {SimApiService} from './simapi.service';
import {SimApiAuthService} from './simapi-auth.service';
import {SimApiConfigService} from './simapi-config.service';
import {SignInComponent} from './sign-in.component';
import {RouterModule} from '@angular/router';

@NgModule({
  declarations: [
    SignInComponent,
  ],
  imports: [
    RouterModule.forChild([
      {path: 'login', component: SignInComponent},
    ])
  ],
  providers: [
    provideHttpClient(withInterceptorsFromDi()),
    SimApiService,
    SimApiAuthService,
    SimApiConfigService
  ],
  exports: []
})
export class SimApiModule {
}
