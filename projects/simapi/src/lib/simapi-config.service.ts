import {Injectable} from '@angular/core';
import {ReplaySubject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SimApiConfigService {
  debug = true;
  oidc = {
    server: '',
    client_id: '',
    scope: '',
    sign_in_uri: '/oidc/sign-in',
    sign_out_uri: '/oidc/sign-out',
    sync_sign_out: false,
    use_popup: false,
    popup_setting: 'location=no,toolbar=no,width=1000,height=600,left=100,top=100',
    full: null // 全量配置，使用oidc-client的配置方式，这种方式忽略其他参数
  };
  auth = {
    token_name: 'simapi-auth-token',
    check_url: '/auth/check',
    logout_url: '/auth/logout',
    login_url: '/auth/login'
  };
  api = {
    endpoints: {
      default: ''
    },
    defaultEndpoint: 'default',
    businessCallback: {
      401: (data: any): void => {
        localStorage.removeItem('token');
      },
      common: (data: any): void => {
      }
    },
    responseCallback: {
      success(response: any): any {
        return response;
      },
      error(response: any): void {
      }
    }
  };

  readonly realTime$ = new ReplaySubject<SimApiConfigService>(1);

  constructor() {
    this.realTime$.next(this);
  }
}
