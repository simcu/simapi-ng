import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';
import {SimApiOidcService} from './simapi-oidc.service';
import {SimApiConfigService} from './simapi-config.service';

type Callback = {
  [key in number | string]: (data: any) => void | any;
};


@Injectable({
  providedIn: 'root'
})
export class SimApiService {
  constructor(private http: HttpClient, private oidc: SimApiOidcService, private config: SimApiConfigService) {
    config.realTime$.subscribe(x => {
      this.endpoints = x.api.endpoints;
      this.debugMode = x.debug;
      this.businessCallback = x.api.businessCallback;
      this.responseCallback = x.api.responseCallback;
    });
  }

  private endpoints: { [name: string]: string };
  private debugMode: boolean;

  // 业务错误代码预处理（处理完后依旧会传给后面）
  private businessCallback: Callback;

  // 网络请求处理
  private responseCallback: Callback;

  // 判断是否DEBUG模式
  get isDebug(): boolean {
    return this.debugMode;
  }

  // 输出DEBUG信息（非DEBUG模式无输出）
  debug(title: string, data: any): void {
    if (this.isDebug) {
      window.console.log('[DEBUG]', title, data);
    }
  }

  // 生成一个随机短字符串
  genS4(): string {
    // @ts-ignore
    // tslint:disable-next-line:no-bitwise
    return (((1 + Math.random()) * 0x10000 * Date.parse(new Date())) | 0).toString(16).substring(1);
  }

  // 发起数据请求
  public query(uri: string, params = {}, endpointKey = this.config.api.defaultEndpoint, headers: any = {}): Observable<any> {
    const queryId = this.genS4();
    if (!(params instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }
    if (localStorage.getItem(this.config.auth.token_name)) {
      headers.Token = localStorage.getItem(this.config.auth.token_name);
    }
    if (this.oidc.userAvailable) {
      headers.Authorization = `${this.oidc.user?.token_type} ${this.oidc.user?.access_token}`;
    }
    if (this.isDebug) {
      headers['Query-Id'] = queryId;
      console.log('[REQUEST*]', queryId, '->', uri, 'AUTH:',
        localStorage.getItem(this.config.auth.token_name) || this.oidc.userAvailable, params);
    }
    const resp = this.http.post(
      this.endpoints[endpointKey] + uri,
      params,
      {
        headers: new HttpHeaders(headers)
      });
    return new Observable<any>(obs => {
      resp.subscribe(data => {
        if (this.isDebug) {
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
        if (this.isDebug) {
          console.log('[RESPONSE]', queryId, '->', err);
        }
        this.responseCallback.error(err);
      });
    });
  }
}
