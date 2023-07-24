import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';

export enum UserClaimingState {
  ZERO = "ZERO",
  METAMASK_CONNECTED = "METAMASK_CONNECTED",
  CORRECT_CHAIN = "CORRECT_CHAIN",
  VERIFIED = "VERIFIED",
  READY = "READY"
}

@Injectable({
  providedIn: 'root'
})
export class UserService {

  userClaimingState$ = new BehaviorSubject<UserClaimingState>(UserClaimingState.ZERO);

  constructor() {
  }

}
