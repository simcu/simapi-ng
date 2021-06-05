import {Injectable} from '@angular/core';
import {ReplaySubject} from 'rxjs';
import {User, UserManager} from 'oidc-client';
import {ActivatedRoute} from '@angular/router';
import {SimApiService} from './simapi.service';

@Injectable({
  providedIn: 'root'
})
export class SimApiOidcService {
  private oidcSetting = {
    // @ts-ignore
    authority: window.simapi.oidc.server,
    // @ts-ignore
    client_id: window.simapi.oidc.client_id,
    redirect_uri: `${document.location.origin}/#/sign-in?`,
    // @ts-ignore
    scope: window.simapi.oidc.scope,
    response_type: 'token',
    automaticSilentRenew: false
  };
  private userManager = new UserManager(this.oidcSetting);

  private currentUser: User | null | undefined = null;

  userLoaded$ = new ReplaySubject<boolean>(1);

  constructor(private route: ActivatedRoute) {
    this.userManager.clearStaleState();
    this.userManager.getUser().then(user => {
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
    this.userManager.events.addUserLoaded(user => {
      this.currentUser = user;
      this.userLoaded$.next(true);
    });
    this.userManager.events.addUserUnloaded(() => {
      this.currentUser = null;
      this.userLoaded$.next(false);
    });
  }

  triggerSignIn(): void {
    this.userManager.signinRedirect().then(() => {
    });
  }

  handleCallback(): void {
    this.route.queryParams.subscribe(q => {
      if (q.access_token) {
        const u = new User({
          // @ts-ignore
          profile: undefined,
          scope: q.scope,
          id_token: q.id_token,
          session_state: q.session_state,
          access_token: q.access_token,
          refresh_token: q.refresh_token,
          token_type: q.token_type,
          expires_at: Number(q.expires_at),
          state: q.state
        });
        this.userManager.storeUser(u).then(_ => {
          this.userManager.getUser().then(user => {
            this.currentUser = user;
            this.userLoaded$.next(true);
          });
        });
      }
    });
  }

  signOut(): void {
    this.userManager.removeUser().then(() => {
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
