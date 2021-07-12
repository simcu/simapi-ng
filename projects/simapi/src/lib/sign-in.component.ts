import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {SimApiOidcService} from './simapi-oidc.service';

@Component({
  selector: 'simapi-sign-in',
  template: '',
})
export class SignInComponent implements OnInit {

  constructor(private oidc: SimApiOidcService, private router: Router) {
  }

  ngOnInit(): void {
    this.oidc.userLoaded$.subscribe(userLoaded => {
      if (userLoaded) {
        this.router.navigate(['/']);
      }
    });

    this.oidc.signInCallback();
  }

}
