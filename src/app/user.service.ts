import {Injectable} from '@angular/core';
import {MetamaskBrightIdService, VerificationStatus} from './metamask-bright-id.service';
import {MannaService} from './manna.service';
import {BehaviorSubject} from 'rxjs';

export enum UserState {
    NotConnectedToMetamask = "NotConnectedToMetamask",
    WrongChain = "WrongChain",
    NotVerified = "NotVerified",
    Email = "Email",
    ReadyToClaim = "ReadyToClaim"
  }

@Injectable({
  providedIn: 'root'
})
export class UserService {
  userState$ = new BehaviorSubject<UserState | null>(null);
  
  constructor(
    private metamaskBrightIdService: MetamaskBrightIdService,
    private mannaService: MannaService
  ) {}

  updateUserState(): void {
    if (!this.metamaskBrightIdService.isConnected$.value) {
      this.userState$.next(UserState.NotConnectedToMetamask);
    } else if (!this.metamaskBrightIdService.isCorrectNetwork()) {
      this.userState$.next(UserState.WrongChain);
    } else if (this.metamaskBrightIdService.verificationStatus$.value !== VerificationStatus.SUCCESSFUL) {
      this.userState$.next(UserState.NotVerified);
    // } else if (/* condition checking if email is not set */) {
    //   this.userState$.next(UserState.Email);
    // } else if (/* condition checking if manna is claimable */) {
    //   this.userState$.next(UserState.ReadyToClaim);
    }
  }
}
