import { Injectable } from '@angular/core';
import { ethers, Contract } from 'ethers';
import { from, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { MetamaskBrightIdService } from './metamask-bright-id.service';
import { TuiAlertService } from '@taiga-ui/core';
import { mannaContractAddress, mannaContractABI, claimMannaContractAddress, claimMannaContractABI } from './config';

@Injectable({
  providedIn: 'root',
})
export class ContractService {
  private mannaContract?: Contract;
  private claimMannaContract?: Contract;

  constructor(
    private metamaskService: MetamaskBrightIdService,
    private alertService: TuiAlertService
  ) {
    this.initializeContracts();
  }

  private async initializeContracts(): Promise<void> {
    this.metamaskService.account$.subscribe(async (walletAddress) => {
      if (walletAddress) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();

        this.mannaContract = new Contract(
          mannaContractAddress,
          mannaContractABI,
          signer
        );

        this.claimMannaContract = new Contract(
          claimMannaContractAddress,
          claimMannaContractABI,
          signer
        );
      }
    });
  }

  balanceOf(walletAddress: string): Observable<string> {
    return from(this.mannaContract!['balanceOf'](walletAddress).then(balance => ethers.formatEther(balance)));
  }

  getUserScore(userAddress: string): Observable<{timestamp: number, score: number}> {
    return from(this.claimMannaContract!['userScores'](userAddress).then(response => {
        const timestamp = parseInt(response[0].toString());
        const score = parseInt(response[1].toString());
        return { timestamp, score };
    }));
  }

  getScoreThreshold(): Observable<number> {
    return from(this.claimMannaContract!['scoreThreshold']().then(threshold => parseInt(threshold.toString())));
  }

  claimManna(): Observable<void> {
    return from(this.claimMannaContract!['claim']().then(claimTx => claimTx.wait()));
  }

  submitUserScore(address: string, scoreData: any): Observable<void> {
    if (!scoreData.signature) {
      console.error('No signature in score data');
      return throwError('No signature in score data');
    }

    return from(this.claimMannaContract!['submitScore'](
      scoreData.score, 
      [scoreData.timestamp, 
        scoreData.signature.v, 
        scoreData.signature.r, 
        scoreData.signature.s]
      
    ).then(tx => tx.wait())).pipe(
      tap(() => this.alertService.open('Score submitted successfully.', { status: 'success', label: 'Success' }).subscribe()),
      catchError(error => {
        console.error('Error submitting score to contract:', error);
        this.alertService.open('Failed to submit score.', { status: 'error', label: 'Error' }).subscribe();
        return throwError(error);
      })
    );
  }
  claimWithSigsContract(data: any): Observable<void> {
    return from(this.claimMannaContract!['claimWithSigs'](data).then(tx => tx.wait())).pipe(
        tap(() => this.alertService.open('Claim processed successfully.', { status: 'success', label: 'Success' }).subscribe()),
        catchError(error => {
            console.error('Error processing claim on contract:', error);
            this.alertService.open('Failed to process claim on contract.', { status: 'error', label: 'Error' }).subscribe();
            return throwError(error);
        })
    );
}
}
