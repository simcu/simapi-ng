import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable, ReplaySubject, Subject} from 'rxjs';
import {SimApiConfigService} from './simapi-config.service';
import {SimApiVersion} from "../version";

type Callback = {
  [key in number | string]: (data: any) => void | any;
};

declare const AppVersion: string;

@Injectable({
  providedIn: 'root'
})
export class SimApiService {
  versions = new ReplaySubject<{
    uiApp: string,
    uiSimApi: string,
    apiApp: string,
    apiSimApi: string,
    apiAppFull: string,
    apiSimApiFull: string
  }>();
  private endpoints: { [name: string]: string } = {};
  private debugMode: boolean = false;

  // 业务错误代码预处理（处理完后依旧会传给后面）
  private businessCallback: Callback = {};

  // 网络请求处理
  private responseCallback: Callback = {};

  public headers: any = {};

  constructor(private http: HttpClient, private config: SimApiConfigService) {
    config.realTime$.subscribe(x => {
      this.endpoints = x.api.endpoints;
      this.debugMode = x.debug;
      this.businessCallback = x.api.businessCallback;
      this.responseCallback = x.api.responseCallback;
      if (x.fullVersion) {
        this.getVersions();
      }
    });
    this.versions.next({
      uiApp: typeof AppVersion !== 'undefined' ? AppVersion : '0.0.0',
      uiSimApi: SimApiVersion,
      apiApp: '0.0.0',
      apiSimApi: '0.0.0',
      apiAppFull: '0.0.0',
      apiSimApiFull: '0.0.0'
    })
  }


  // 判断是否DEBUG模式
  get isDebug(): boolean {
    return this.debugMode;
  }

  getVersions() {
    this.query("/versions").subscribe(resp => {
      this.versions.next({
        uiApp: typeof AppVersion !== 'undefined' ? AppVersion : '0.0.0',
        uiSimApi: SimApiVersion,
        apiApp: resp.data.App.split("+")[0],
        apiSimApi: resp.data.SimApi.split("+")[0],
        apiAppFull: resp.data.App,
        apiSimApiFull: resp.data.SimApi
      })
      console.log(`UI主应用版本: ${typeof AppVersion !== 'undefined' ? AppVersion : '0.0.0'}\nUISimApi版本: ${SimApiVersion}\nAPI主应用版本: ${resp.data.App}\nAPISimApi版本: ${resp.data.SimApi}`);
    })
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

  getEndpoint(name: string = this.config.api.defaultEndpoint): string {
    return this.endpoints[name];
  }

  // 发起数据请求
  public query(uri: string, params = {}, endpointKey = this.config.api.defaultEndpoint, headers: any = null): Observable<any> {
    if (headers === null) {
      headers = this.headers;
    }
    const queryId = this.genS4();
    if (!(params instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }
    if (localStorage.getItem(this.config.auth.token_name)) {
      headers.Token = localStorage.getItem(this.config.auth.token_name);
    }
    if (this.isDebug) {
      headers['Query-Id'] = queryId;
      console.log('[REQUEST*]', queryId, '->', uri, 'AUTH:',
        localStorage.getItem(this.config.auth.token_name));
    }
    const resp = this.http.post(
      this.endpoints[endpointKey] + uri,
      params,
      {
        headers: new HttpHeaders(headers)
      });
    return new Observable<any>(obs => {
      resp.subscribe({
        next: data => {
          if (this.isDebug) {
            console.log('[RESPONSE]', queryId, '->', data);
          }
          const respData = this.responseCallback['success'](data);
          if (this.businessCallback.hasOwnProperty(respData.code)) {
            this.businessCallback[respData.code](respData);
          } else if (this.businessCallback['common'] && respData.code !== 200) {
            this.businessCallback['common'](respData);
          }
          if (respData.code === 200) {
            obs.next(respData);
          } else {
            obs.error(respData);
          }
        },
        error: err => {
          if (this.isDebug) {
            console.log('[RESPONSE]', queryId, '->', err);
          }
          this.responseCallback['error'](err);
        }
      });
    });
  }
}
