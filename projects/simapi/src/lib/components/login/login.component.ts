import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {SimApiOidcService} from '../../simapi-oidc.service';

@Component({
  selector: 'simapi-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  constructor(public oidc: SimApiOidcService, private router: Router) {
  }

  ngOnInit(): void {
    this.oidc.userLoaded$.subscribe(userLoaded => {
      if (userLoaded) {
        this.router.navigate(['/']);
      }
    });
  }

}
