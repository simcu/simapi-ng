import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {SimApiService} from './simapi.service';

@Injectable({
  providedIn: 'root'
})
export class SimApiAuthService {
  constructor(private simapi: SimApiService) {
  }

  private headers: {
    [name: string]: string;
  } | undefined;

  // 设置登陆Token
  public login(token: string): void {
    localStorage.setItem('token', token);
  }

  // 登出
  public logout(url = '/auth/logout'): Observable<any> {
    localStorage.removeItem('token');
    return this.simapi.query(url);
  }

  // 检测登陆状态（需要借助401返回判断）
  public checkLogin(url = '/auth/check'): void {
    this.simapi.query(url).subscribe();
  }

  // 获取用户登陆标识
  public getToken(): string {
    return localStorage.getItem('token') || '';
  }
}
