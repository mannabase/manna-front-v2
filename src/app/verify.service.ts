import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subscription, of, throwError } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { ContractService } from './contract.service';
import { MetamaskBrightIdService } from './metamask-bright-id.service';

export enum VerifyState {
 NOT_VERIFIED = 'NOT_VERIFIED',
 VERIFIED = 'VERIFIED',
}

@Injectable({
  providedIn: 'root',
 })
 export class VerifyService {
  [x: string]: any;
  public verificationStateSubject = new BehaviorSubject<VerifyState>(VerifyState.NOT_VERIFIED);
  verificationState$ = this.verificationStateSubject.asObservable();
  private contractScoreSource = new BehaviorSubject<number | null>(null);
  contractScore$ = this.contractScoreSource.asObservable();
  private serverScoreSource = new BehaviorSubject<number | null>(null);
  serverScore$ = this.serverScoreSource.asObservable();
  private thresholdSource = new BehaviorSubject<number | null>(null);
  threshold$ = this.thresholdSource.asObservable();
  walletAddress: string | null = null;
  accountSubscription: Subscription = new Subscription();
 
  constructor(
    private contractService: ContractService, 
    private metamaskService: MetamaskBrightIdService,
    ) 
  {
    this.accountSubscription = this.metamaskService.account$.subscribe((address) => {
      this.walletAddress = address;
      if (address) {
        console.log('Request to get score and threshold')
        this.fetchContractScore(address); 
        this.fetchThreshold();
        // this.setContractScore(123);
        // this.setThreshold(10);
      }
    });
  }
  public fetchContractScore(address?: string) {
    const walletAddress = address || this.walletAddress;
    if (!walletAddress) {
      console.error('Wallet address not available.');
      return;
    }
    console.log(`Attempting to fetch contract score for address: ${walletAddress}`);
    this.contractService.getUserScore(walletAddress).subscribe({
      next: (scoreObj) => {
        console.log(`Contract score fetched: ${scoreObj.score}`);
        this.setContractScore(scoreObj.score);
      },
      error: (error) => console.error('Error fetching contract score:', error),
    });
 }
 public fetchThreshold() {
    console.log('Attempting to fetch threshold');
    this.contractService.getScoreThreshold().subscribe({
      next: (threshold) => {
        console.log(`Score threshold fetched: ${threshold}`);
        this.setThreshold(threshold);
      },
      error: (error) => console.error('Error fetching score threshold:', error),
    });
 }
  verifyUser(userAddress: string) {
    console.log(`Verifying user with address: ${userAddress}`);
    this.contractService.getUserScore(userAddress).pipe(
      switchMap(userScore => {
        console.log(`User score fetched: ${userScore.score}`);
        return this.contractService.getScoreThreshold().pipe(
          map(threshold => {
            console.log(`Score threshold fetched: ${threshold}`);
            this.setServerScore(userScore.score);
            return (userScore.score / 100000) >= threshold ? VerifyState.VERIFIED : VerifyState.NOT_VERIFIED;
          })
        );
      }),
      catchError(error => {
        console.error('Error during user verification:', error);
        return of(VerifyState.NOT_VERIFIED); 
      })
    ).subscribe(newState => {
      console.log(`Verification state updated: ${newState}`);
      this.verificationStateSubject.next(newState);
    });
  }
  
  setServerScore(score: number | null) {
    console.log(`Setting server score: ${score}`);
    this.serverScoreSource.next(score);
  }
  
  setContractScore(score: number) {
    console.log(`Emitting new contract score: ${score}`);
    this.contractScoreSource.next(score);
  }

  setThreshold(threshold: number) {
    console.log(`Emitting new threshold: ${threshold}`);
    this.thresholdSource.next(threshold);
  }

  submitScoreToContract(walletAddress: string, scoreData: any): Observable<void> {
    if (!scoreData || !this.contractService) {
      console.error('Invalid score data or ContractService not initialized');
      return throwError('Invalid score data or ContractService not initialized');
    }
    return this.contractService.submitUserScore(walletAddress, scoreData).pipe(
      tap(() => {
        console.log('Score submitted to contract successfully.');
        if (this.serverScore$) {
          this.serverScore$.subscribe(score => {
              if (score !== null) {
                  this.setContractScore(score);
              } else {
                  console.error("Server score is null");
              }
          });
      } else {
          console.error("Server score observable is null");
      }
      }),
      catchError(error => {
        console.error('Error submitting score to contract:', error);
        return throwError(error);
      })
    );
  }
 }
 