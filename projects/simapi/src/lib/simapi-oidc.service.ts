import {Injectable} from '@angular/core';
import {ReplaySubject} from 'rxjs';
import {User, UserManager} from 'oidc-client';
import {ActivatedRoute, Router} from '@angular/router';
import {HashLocationStrategy, LocationStrategy} from '@angular/common';
import {SimApiConfigService} from './simapi-config.service';

@Injectable({
  providedIn: 'root'
})
export class SimApiOidcService {
  private usePopup: boolean;
  private oidcSetting = {
    authority: '',
    client_id: '',
    redirect_uri: '',
    scope: '',
    response_type: '',
    automaticSilentRenew: false,
    popupWindowFeatures: 'location=no,toolbar=no,width=800,height=600,left=100,top=100',
    post_logout_redirect_uri: '',
    popup_post_logout_redirect_uri: ''
  };
  public manager: UserManager;
  private currentUser: User | null | undefined = null;

  userLoaded$ = new ReplaySubject<boolean>(1);
  signState$ = new ReplaySubject<boolean>(1);

  constructor(private route: ActivatedRoute, private ls: LocationStrategy,
              private config: SimApiConfigService, private router: Router) {
    config.realTime$.subscribe(x => {
      if (this.config.oidc.full !== null) {
        this.oidcSetting = x.oidc.full;
      } else {
        this.oidcSetting.response_type = x.oidc.response_type;
        if (ls instanceof HashLocationStrategy) {
          this.oidcSetting.redirect_uri = `${document.location.origin}/#${x.oidc.sign_in_uri}?`;
          this.oidcSetting.post_logout_redirect_uri = `${document.location.origin}/#${x.oidc.sign_out_uri}`;
          this.oidcSetting.popup_post_logout_redirect_uri = `${document.location.origin}/#${x.oidc.sign_out_uri}`;
        } else {
          this.oidcSetting.redirect_uri = `${document.location.origin}${x.oidc.sign_in_uri}`;
          this.oidcSetting.post_logout_redirect_uri = `${document.location.origin}${x.oidc.sign_out_uri}`;
          this.oidcSetting.popup_post_logout_redirect_uri = `${document.location.origin}${x.oidc.sign_out_uri}`;
        }

        this.usePopup = x.oidc.use_popup;
        this.oidcSetting.popupWindowFeatures = x.oidc.popup_setting;
        this.oidcSetting.authority = x.oidc.server;
        this.oidcSetting.client_id = x.oidc.client_id;
        this.oidcSetting.scope = x.oidc.scope;
      }
      this.manager = new UserManager(this.oidcSetting);
      this.manager.clearStaleState();
      this.manager.getUser().then(user => {
        if (user) {
          this.currentUser = user;
          this.userLoaded$.next(true);
        } else {
          this.currentUser = null;
          this.userLoaded$.next(false);
        }
      }).catch(err => {
        this.currentUser = null;
        this.userLoaded$.next(false);
      });
      this.manager.events.addUserLoaded(user => {
        this.currentUser = user;
        this.userLoaded$.next(true);
      });
      this.manager.events.addUserUnloaded(() => {
        this.currentUser = null;
        this.userLoaded$.next(false);
      });
    });
  }

  signIn(): void {
    if (this.usePopup) {
      this.manager.signinPopup();
    } else {
      this.manager.signinRedirect();
    }
  }

  signInCallback(): void {
    const url = window.location.href.replace('/#/', '').replace('?', '#');
    this.manager.signinCallback(url).then(() => {
      this.signState$.next(true);
    });
  }

  signOut(): void {
    if (this.config.oidc.sign_out_sync) {
      if (this.usePopup) {
        this.manager.signoutPopup();
      } else {
        this.manager.signoutRedirect();
      }
    } else {
      this.manager.removeUser().then(() => {
        this.userLoaded$.next(false);
        this.signState$.next(false);
      });
    }
  }

  signOutCallBack(): void {
    this.manager.signinCallback().then(() => {
      this.signState$.next(false);
    });
    this.signState$.next(false);
  }

  get userAvailable(): boolean {
    return !!this.currentUser;
  }

  get user(): User | null | undefined {
    return this.currentUser;
  }

}
