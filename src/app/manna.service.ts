import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { serverUrl } from './config';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class MannaService {
  private refreshWallet$ = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient) {}

  getClaimableAmount(walletAddress: string): Observable<any> {
    const url = `${serverUrl}/manna/toClaim/${walletAddress}`;
    console.log('[MannaService] GET ->', url);

    return this.http.get<any>(url).pipe(
      tap(response => {
        console.log('[MannaService] Response from getClaimableAmount:', response);
      })
    );
  }

  getGitcoinScore(walletAddress: string, signature: string, timestamp: number): Observable<any> {
    const payload = { timestamp, signature, user: walletAddress.toLowerCase() };
    const url = `${serverUrl}/signing/gitcoinPassportScore`;
    console.log('[MannaService] POST ->', url, 'with payload:', payload);

    return this.http.post<any>(url, payload).pipe(
      tap(response => {
        console.log('[MannaService] Response from getGitcoinScore:', response);
      })
    );
  }

  checkin(walletAddress: string, signature: string, timestamp: number): Observable<void> {
    const payload = { timestamp, signature, user: walletAddress };
    const url = `${serverUrl}/signing/checkin`;
    console.log('[MannaService] POST ->', url, 'with payload:', payload);

    return this.http.post<void>(url, payload).pipe(
      tap(() => {
        console.log('[MannaService] Response from checkin: (no content)');
      })
    );
  }

  claimWithSigs(walletAddress: string, signature: string, timestamp: number): Observable<any> {
    const payload = { user: walletAddress, signature, timestamp };
    const url = `${serverUrl}/signing/getCheckinSigs`;
    console.log('[MannaService] POST ->', url, 'with payload:', payload);

    return this.http.post<any>(url, payload).pipe(
      tap(response => {
        console.log('[MannaService] Response from claimWithSigs:', response);
      })
    );
  }

  getMannabaseBalance(walletAddress: string): Observable<any> {
    const url = `${serverUrl}/manna/balance/${walletAddress}`;
    console.log('[MannaService] GET ->', url);

    return this.http.get<any>(url).pipe(
      tap(response => {
        console.log('[MannaService] Response from getMannabaseBalance:', response);
      })
    );
  }

  // Wallet refresh
  getRefreshWallet() {
    return this.refreshWallet$.asObservable();
  }

  triggerWalletRefresh() {
    this.refreshWallet$.next(true);
  }
}
