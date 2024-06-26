import {Injectable} from '@angular/core';
import {Observable, of} from 'rxjs';
import {SimApiService} from './simapi.service';
import {SimApiConfigService} from './simapi-config.service';

@Injectable({
  providedIn: 'root'
})
export class SimApiAuthService {
  constructor(private simapi: SimApiService, private config: SimApiConfigService) {
  }

  // 登录
  public login(request: {}): Observable<any> {
    return new Observable<any>(obs => {
      this.simapi.query(this.config.auth.login_url, request).subscribe(x => {
        if (x.data) {
          this.setToken(x.data);
        }
        obs.next(x);
      }, e => obs.error(e));
    });
  }

  // 设置登陆Token
  public setToken(token: string): void {
    localStorage.setItem(this.config.auth.token_name, token);
  }

  // 登出
  public logout(url = this.config.auth.logout_url): Observable<any> {
    return new Observable<any>(obs => {
      localStorage.removeItem(this.config.auth.token_name);
      if (url !== null) {
        this.simapi.query(url).subscribe(r => obs.next(r), e => obs.error(e));
      } else {
        obs.next(true);
      }
    });
  }

  // 检测登陆状态（需要借助401返回判断）
  public checkLogin(url = this.config.auth.check_url): void {
    if (url !== null) {
      this.simapi.query(url).subscribe();
    } else {
      if (this.getToken() !== '') {
        this.config.api.businessCallback[401](null);
      }
    }
  }

  // 获取用户登陆标识
  public getToken(): string {
    return localStorage.getItem(this.config.auth.token_name) || '';
  }
}
