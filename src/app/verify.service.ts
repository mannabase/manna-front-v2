import { Injectable } from '@angular/core';
import { BehaviorSubject, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { ContractService } from './contract.service';

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

  constructor(private contractService: ContractService) {}

  verifyUser(userAddress: string) {
    this.contractService.getUserScore(userAddress).pipe(
      switchMap(userScore => this.contractService.getScoreThreshold().pipe(
        map(threshold => userScore.score >= threshold ? VerifyState.VERIFIED : VerifyState.NOT_VERIFIED)
      )),
      catchError(error => {
        console.error('Error during user verification:', error);
        return of(VerifyState.NOT_VERIFIED); // Default to not verified in case of error
      })
    ).subscribe(newState => this.verificationStateSubject.next(newState));
  }
}
