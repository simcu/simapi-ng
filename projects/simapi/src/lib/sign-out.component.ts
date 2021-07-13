import {Component, OnInit} from '@angular/core';
import {SimApiOidcService} from './simapi-oidc.service';

@Component({
  selector: 'simapi-sign-out',
  template: '',
})
export class SignOutComponent implements OnInit {

  constructor(private oidc: SimApiOidcService) {
  }

  ngOnInit(): void {
    this.oidc.signOutCallBack();
  }

}
