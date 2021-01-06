import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';

type Callback = {
  [key in number | string]: (data: any) => void | any;
};

@Injectable({
  providedIn: 'root'
})
export class SimApiService {
  constructor(private http: HttpClient) {
    // @ts-ignore
    this.serverUrl = window.server;
    // @ts-ignore
    this.debugMode = window.debug;
  }

  private readonly serverUrl: string;
  private readonly debugMode = false;
  private headers: {
    [name: string]: string;
  } | undefined;

  // 业务错误代码预处理（处理完后依旧会传给后面）
  public businessCallback: Callback = {
    401: (data: any): void => {
      localStorage.removeItem('token');
    },
    common: (data: any): void => {
    }
  };

  // 网络请求处理
  public responseCallback: Callback = {
    success(response: any): any {
      return response;
    },
    error(response: any): void {
    }
  };

  // 获取当前服务器地址
  public getServerUrl(): string | null {
    return this.serverUrl;
  }

  // 判断是否DEBUG模式
  public isDebug(): boolean {
    return this.debugMode;
  }

  // 输出DEBUG信息（非DEBUG模式无输出）
  public debug(data: any): void {
    if (this.isDebug()) {
      window.console.log('[DEBUG]', data);
    }
  }

  // 生成一个随机短字符串
  private genS4(): string {
    // @ts-ignore
    // tslint:disable-next-line:no-bitwise
    return (((1 + Math.random()) * 0x10000 * Date.parse(new Date())) | 0).toString(16).substring(1);
  }

  // 设置登陆Token
  public login(token: string): void {
    localStorage.setItem('token', token);
  }

  // 登出
  public logout(url = '/auth/logout'): Observable<any> {
    localStorage.removeItem('token');
    return this.query(url);
  }

  // 检测登陆状态（需要借助401返回判断）
  public checkLogin(url = '/auth/check'): void {
    this.query(url).subscribe();
  }

  // 获取用户登陆标识
  public getToken(): string {
    return localStorage.getItem('token') || '';
  }

  // 发起数据请求
  public query(uri: string, params = {}): Observable<any> {
    const queryId = this.genS4();
    this.headers = {'Content-Type': 'application/json'};
    if ('' !== this.getToken()) {
      this.headers.Token = this.getToken();
    }
    if (this.isDebug()) {
      this.headers['Query-Id'] = queryId;
      console.log('[REQUEST*]', queryId, '->', uri, 'AUTH:', this.getToken(), params);
    }
    const resp = this.http.post(
      this.serverUrl + uri,
      params,
      {
        headers: new HttpHeaders(this.headers)
      });
    return new Observable<any>(obs => {
      resp.subscribe(data => {
        if (this.isDebug()) {
          console.log('[RESPONSE]', queryId, '->', data);
        }
        const respData = this.responseCallback.success(data);
        if (this.businessCallback.hasOwnProperty(respData.code)) {
          this.businessCallback[respData.code](respData);
        } else if (this.businessCallback.common && respData.code !== 200) {
          this.businessCallback.common(respData);
        }
        if (respData.code === 200) {
          obs.next(respData);
        } else {
          obs.error(respData);
        }
      }, err => {
        if (this.isDebug()) {
          console.log('[RESPONSE]', queryId, '->', err);
        }
        this.responseCallback.error(err);
      });
    });
  }
}
