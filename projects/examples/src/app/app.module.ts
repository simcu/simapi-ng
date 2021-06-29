import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppComponent} from './app.component';
import {SimApiModule} from '../../../simapi/src/lib/simapi.module';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    SimApiModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
