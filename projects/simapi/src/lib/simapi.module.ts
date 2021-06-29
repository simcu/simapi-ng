import {NgModule} from '@angular/core';
import {HttpClientModule} from '@angular/common/http';
import {SimApiService} from './simapi.service';
import {SimApiOidcService} from './simapi-oidc.service';
import {SimApiAuthService} from './simapi-auth.service';
import {SimApiConfigService} from './simapi-config.service';

@NgModule({
  declarations: [],
  imports: [
    HttpClientModule
  ],
  providers: [
    SimApiService,
    SimApiOidcService,
    SimApiAuthService,
    SimApiConfigService
  ],
  exports: []
})
export class SimApiModule {
}
