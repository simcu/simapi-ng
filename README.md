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
window.simapi = {
  debug: true,
  oidc: {
    server: "",
    client_id: "",
    scope: ""
  },
  endpoints: {
    key: ""
  }
}; //接口服务地址
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
    // 配置特定业务状态码的处理方式
    this.api.businessCallback[401] = data => {
      this.api.logout();
      this.router.navigateByUrl('/auth/login');
    };
    // 配置除了特定业务状态码的处理方式
    this.api.businessCallback.common = data => {
      this.api.logout();
      this.router.navigateByUrl('/auth/login');
    };

    // HTTP请求处理
    this.api.responseCallback.success = response => {
      return response;
    }
    this.api.responseCallback.error = response => {
    }
  }
}
```

请求api接口

```ts
this.api.query("uri不带域名", {},"endpointKey 选择接口域名").subscribe(data => {
  //resp 为 axios 的 resp.data 
}, error => {
  //error 为业务返回的错误信息，不是axios的错误信息
})
```

