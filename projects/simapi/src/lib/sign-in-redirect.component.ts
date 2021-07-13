import {Component, OnInit} from '@angular/core';
import {SimApiOidcService} from './simapi-oidc.service';

@Component({
  selector: 'simapi-sign-in',
  template: '',
})
export class SignInRedirectComponent implements OnInit {

  constructor(private oidc: SimApiOidcService) {
  }

  ngOnInit(): void {
    this.oidc.signIn();
  }

}
