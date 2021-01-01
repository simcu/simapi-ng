## 配合SimApi的Angular 请求类

### 注意只支持post方法

安装方法：
> yarn add @simcu/simapi-ng

调用方法:
在app.module.ts中引入

```ts
import {SimApiService} from '@simcu/simapi-ng';
```

并在NgModule的provider中加入 SimApiService

配置相关：

系统会从window中读取两个配置项，请在index.html 中饮用一个js文件，或者直接在内写入

```js
window.server = "http://127.0.0.1:5000"; //接口服务地址
window.debug = true; //是否为调试模式（影响日志输出）
```

系统其他可配置选项，推荐在 app.component.ts 中的构造函数进行配置

```ts
import {Component} from '@angular/core';
import {SimApiService} from '@simcu/simapi-ng';
import {Router} from '@angular/router';

@Component({
  selector: 'app-root',
  template: '<router-outlet></router-outlet>'
})
export class AppComponent {
  title = 'app';

  constructor(private api: SimApiService, private router: Router) {
    this.processApiCallback();
  }

  private processApiCallback(): void {
    // 此处并非http的状态码处理，而是业务返回的Code
    this.api.businessCallback = {
      // 配置特定业务状态码的处理方式
      401(data: any): void {
        localStorage.removeItem('token');
      },
      // 配置除了特定业务状态码的处理方式
      common(data: any): void {
      }
    }

    // HTTP请求处理
    this.api.responseCallback = {
      success(response: any): any {
        return response;
      },
      error(response: any): void {
      }
    };
  }
}
```

请求api接口

```ts
this.$simapi.query("uri不带域名", {}).then(resp => {
  //resp 为 axios 的 resp.data 
}).catch(error => {
  //error 为业务返回的错误信息，不是axios的错误信息
})
```

可以用方法：

```js
ApiService.login(token)  //本方法将token存入localstorage，并在后续query中自动附加
ApiService.logout()      //删除token
ApiService.getToken()    //获取登陆标识
ApiService.checkLogin(url = "/auth/check") //检测登陆状态
ApiService.debug(string)  //本方法将自动在debug模式打印string信息，非debug模式不会打印
ApiService.isDebug()      //是否为debug模式
ApiService.getServerUrl()  //获取服务器Url
```
