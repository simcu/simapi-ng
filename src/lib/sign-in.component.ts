import {Component, OnInit} from '@angular/core';
import {SimApiService} from "./simapi.service";
import {ActivatedRoute, Router} from "@angular/router";
import {SimApiAuthService} from "./simapi-auth.service";

@Component({
  selector: 'simapi-sign-in',
  template: '<p>正在跳转,请稍等片刻~</p>',
})
export class SignInComponent implements OnInit {

  authUrl?: string;
  appId?: string;
  token?: string;

  constructor(private api: SimApiService, private route: ActivatedRoute,
              private router: Router, private auth: SimApiAuthService) {
    this.registerEvent();
    route.queryParams.subscribe(x => {
      if (x['lv1-token']) {
        this.token = x['lv1-token'];
      }
    })

  }

  ngOnInit() {
    this.api.query('/auth/config').subscribe(x => {
      this.authUrl = x.data.authUrl;
      this.appId = x.data.appId;
      if (this.token) {
        this.doLogin(this.token);
      } else {
        this.redirectToLogin();
      }
    })
  }

  private registerEvent() {
    window.addEventListener('message', event => {
      switch (event.data.type) {
        case 'lv1-token':
          if (event.data.success) {
            this.token = event.data.data;
            this.doLogin(this.token!);
          }
          break;
        default:
          console.log(event);
          break;
      }
    }, false);
  }

  redirectToLogin() {
    if (window.top === window.self) {
      const loginUrl = this.authUrl + '/#/authorize?appId=' + this.appId + '&redirect=' + encodeURIComponent(location.href);
      console.log(loginUrl)
      location.href = loginUrl;
    } else {
      window.top?.postMessage({
        type: 'lv1-token',
        appId: this.appId
      }, '*');

    }
  }

  doLogin(token: string) {
    this.api.query('/auth/login', {data: token}).subscribe(x => {
      this.auth.setToken(x.data);
      this.router.navigateByUrl('/')
    })
  }

}
