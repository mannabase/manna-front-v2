// verify.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export enum VerifyState {
  NOT_VERIFIED = 'NOT_VERIFIED',
  VERIFIED = 'VERIFIED',
}

@Injectable({
  providedIn: 'root',
})
export class VerifyService {
  private verificationStateSubject = new BehaviorSubject<VerifyState>(VerifyState.NOT_VERIFIED);
  verificationState$ = this.verificationStateSubject.asObservable();

  setVerificationState(score: number): void {
    const threshold = 50; 
    const newState = score >= threshold ? VerifyState.VERIFIED : VerifyState.NOT_VERIFIED;
    this.verificationStateSubject.next(newState);
  }
}
