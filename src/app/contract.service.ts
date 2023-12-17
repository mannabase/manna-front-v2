import { Injectable } from '@angular/core';
import { ethers, JsonRpcProvider, Fragment, JsonFragment } from 'ethers';
import { from, Observable,throwError } from 'rxjs';
import { chainConfig, mannaContractAddress, mannaContractABI, claimMannaContractAddress, claimMannaContractABI } from './config';
import { MetamaskBrightIdService } from './metamask-bright-id.service';
import { TuiAlertService } from '@taiga-ui/core';
import { tap, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ContractService {
  private provider: JsonRpcProvider;
  private mannaContract: ethers.Contract;
  private claimMannaContract: ethers.Contract;

  constructor(
    private metamaskService: MetamaskBrightIdService,
    private alertService: TuiAlertService
    ) {
    this.provider = new ethers.JsonRpcProvider(chainConfig.params[0].rpcUrls[0]);
    this.mannaContract = new ethers.Contract(
      mannaContractAddress,
      mannaContractABI as Array<string | Fragment | JsonFragment>,
      this.provider
    );

    this.claimMannaContract = new ethers.Contract(
      claimMannaContractAddress,
      claimMannaContractABI as Array<string | Fragment | JsonFragment>,
      this.provider
    );
    this.initializeContracts();
  }

  private initializeContracts(): void {
    this.metamaskService.account$.subscribe((walletAddress) => {
      if (walletAddress) {
        this.provider.getSigner(walletAddress).then(signer => {
          this.mannaContract = new ethers.Contract(
              mannaContractAddress,
              mannaContractABI,
              signer
          );

          this.claimMannaContract = new ethers.Contract(
              claimMannaContractAddress,
              claimMannaContractABI,
              signer
          );
        });
      }
    });
  }

  balanceOf(walletAddress: string): Observable<string> {
    return from(this.mannaContract['balanceOf'](walletAddress).then(balance => ethers.formatEther(balance)));
  }

  getUserScore(userAddress: string): Observable<{timestamp: number, score: number}> {
    return from(this.claimMannaContract['userScores'](userAddress).then(response => {
        const timestamp = parseInt(response[0].toString());
        const score = parseInt(response[1].toString());
        return { timestamp, score };
    }));
}
  getScoreThreshold(): Observable<number> {
    return from(this.claimMannaContract['scoreThreshold']().then(threshold => parseInt(threshold.toString())));
  }

  claimManna(): Observable<void> {
    return from(this.claimMannaContract['claim']().then(claimTx => claimTx.wait()));
  }

  submitScore(score: number, userAddress: string): Observable<void> {
    return from(this.claimMannaContract['submitScore'](score, userAddress).then(submitScoreTx => submitScoreTx.wait()));
  }
  submitUserScore(address: string, scoreData: any): Observable<void> {
    if (!scoreData.signature) {
      console.error('No signature in score data');
      return throwError('No signature in score data');
    }
    console.log('Data sent for score submission:', {
      score: scoreData.score, 
      address, 
      v: scoreData.signature.v, // Keep 'v' as it is, assuming it's already a string or number
      r: scoreData.signature.r.startsWith('0x') ? scoreData.signature.r : '0x' + scoreData.signature.r, 
      s: scoreData.signature.s.startsWith('0x') ? scoreData.signature.s : '0x' + scoreData.signature.s
    });

    return from(this.claimMannaContract['submitScore'](
      scoreData.score, 
      address,  
      scoreData.signature.v, // Keep 'v' as it is
      scoreData.signature.r.startsWith('0x') ? scoreData.signature.r : '0x' + scoreData.signature.r, 
      scoreData.signature.s.startsWith('0x') ? scoreData.signature.s : '0x' + scoreData.signature.s
    ).then(tx => tx.wait())).pipe(
      tap(() => this.alertService.open('Score submitted successfully.', { status: 'success', label: 'Success' }).subscribe()),
      catchError(error => {
        console.error('Error submitting score to contract:', error);
        this.alertService.open('Failed to submit score.', { status: 'error', label: 'Error' }).subscribe();
        return throwError(error);
      })
    );
  }


}

