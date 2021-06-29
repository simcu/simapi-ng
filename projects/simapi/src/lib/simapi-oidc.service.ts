import {Injectable} from '@angular/core';
import {ReplaySubject} from 'rxjs';
import {User, UserManager} from 'oidc-client';
import {ActivatedRoute} from '@angular/router';
import {HashLocationStrategy, LocationStrategy} from '@angular/common';
import {SimApiConfigService} from './simapi-config.service';

@Injectable({
  providedIn: 'root'
})
export class SimApiOidcService {
  private readonly usePopup: boolean = false;
  private readonly oidcSetting = {
    authority: this.config.oidc.server,
    client_id: this.config.oidc.client_id,
    redirect_uri: '',
    scope: this.config.oidc.scope,
    response_type: 'token',
    automaticSilentRenew: false,
    popupWindowFeatures: 'location=no,toolbar=no,width=1000,height=600,left=100,top=100'
  };
  public manager: UserManager;
  private currentUser: User | null | undefined = null;

  userLoaded$ = new ReplaySubject<boolean>(1);

  constructor(private route: ActivatedRoute, private ls: LocationStrategy, private config: SimApiConfigService) {
    if (ls instanceof HashLocationStrategy) {
      this.oidcSetting.redirect_uri = `${document.location.origin}/#${config.oidc.redirect_uri}?`;
    } else {
      this.oidcSetting.redirect_uri = `${document.location.origin}${config.oidc.redirect_uri}`;
    }
    this.usePopup = this.config.oidc.use_popup;
    this.oidcSetting.popupWindowFeatures = this.config.oidc.popup_setting;
    if (this.config.oidc.full !== null) {
      this.oidcSetting = this.config.oidc.full;
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
  }

  signIn(): void {
    if (this.usePopup) {
      this.manager.signinPopup();
    } else {
      this.manager.signinRedirect();
    }
  }

  signInCallback(): void {
    this.route.queryParams.subscribe(q => {
      if (q.access_token && q.use_exists_token === 'true') {
        const u = new User({
          profile: undefined,
          scope: '',
          id_token: '',
          session_state: '',
          access_token: q.access_token,
          refresh_token: '',
          token_type: q.token_type,
          expires_at: Number(q.expires_at),
          state: ''
        });
        this.manager.storeUser(u).then(_ => {
          this.manager.getUser().then(user => {
            this.currentUser = user;
            this.userLoaded$.next(true);
          });
        });
      } else {
        const url = window.location.href.replace('/#/', '').replace('?', '#');
        if (this.usePopup) {
          this.manager.signinPopupCallback(url);
        } else {
          this.manager.signinRedirectCallback(url);
        }
      }
    });
  }

  signOut(): void {
    this.manager.removeUser().then(() => {
      this.userLoaded$.next(false);
    });
  }

  get userAvailable(): boolean {
    return !!this.currentUser;
  }

  get user(): User | null | undefined {
    return this.currentUser;
  }

}
