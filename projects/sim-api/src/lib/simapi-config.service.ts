import {Injectable} from '@angular/core';
import {ReplaySubject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SimApiConfigService {
  debug = true;
  fullVersion = true;
  auth = {
    token_name: 'simapi-auth-token',
    check_url: '/auth/check',
    logout_url: '/auth/logout',
    login_url: '/auth/login'
  };
  api: {
    endpoints: { default: string },
    defaultEndpoint: string,
    businessCallback: { [key in number | string]: (data: any) => void }
    responseCallback: { [key in number | string]: (data: any) => void }
  } = {
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
