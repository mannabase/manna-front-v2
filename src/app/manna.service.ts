import {Injectable} from '@angular/core';
import {throwError, Observable, of} from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { tap, catchError } from 'rxjs/operators';
import { TuiAlertService } from '@taiga-ui/core';
import {serverUrl} from "./config";

@Injectable({
    providedIn: 'root'
})
export class MannaService {

    constructor(
        private http: HttpClient,
        private alertService: TuiAlertService
    ) {
    }

    getBalance(walletAddress: string) {
        return of(8.2)
        // return this.http.get<string>(serverUrl + `conversion/getBalance/${walletAddress}`);
    }

    mannaToClaim(walletAddress: string): Observable<string> {
        return this.http.get<string>(serverUrl + `conversion/claimable/${walletAddress}`);
    }

    requestClaim(walletAddress: string): void {
        const payload = {mannaWallet$: walletAddress};
        this.http.post<any>(serverUrl + '/manna/claim', payload);
    }

    claim(): Observable<any> {
        return of("HAHA")
    }
    sendSignature(walletAddress: string, signature: string, timestamp: number): Observable<any> {
        const payload = { timestamp, signature, user: walletAddress };
        return this.http.post<any>(`${serverUrl}signing/gitcoinPassportScore`, payload).pipe(
            tap(response => {
                console.log('Data received from server:', response); 
                this.alertService.open('Signature sent to server successfully.', { status: 'success', label: 'Success' }).subscribe();
            }),
            catchError(error => {
                console.error('Error sending signature to server:', error);
                this.alertService.open('Failed to send signature to server.', { status: 'error', label: 'Error' }).subscribe();
                return throwError(error);
            })
        );
    }
    sendCheckIn(walletAddress: string, signature: string, timestamp: number): Observable<any> {
        const payload = { timestamp, signature, user: walletAddress };
        return this.http.post<any>(`${serverUrl}/signing/checkin`, payload).pipe(
            tap(response => {
                console.log('Check-in data sent to server:', response); 
                this.alertService.open('Check-in successful.', { status: 'success', label: 'Success' }).subscribe();
            }),
            catchError(error => {
                console.error('Error sending check-in data to server:', error);
                this.alertService.open('Failed to send check-in data.', { status: 'error', label: 'Error' }).subscribe();
                return throwError(error);
            })
        );
    }
sendClaimWithSig(walletAddress: string, signature: string, timestamp: number): Observable<any> {
    const params = new HttpParams()
      .set('user', walletAddress)
      .set('signature', signature)
      .set('timestamp', timestamp.toString());

    return this.http.get<any>(`${serverUrl}/signing/checkin`, { params }).pipe(
      tap(response => {
        console.log('Check-in signatures received:', response);
        this.alertService.open('Signatures fetched successfully.', { status: 'success', label: 'Success' }).subscribe();
      }),
      catchError(error => {
        console.error('Error fetching check-in signatures:', error);
        this.alertService.open('Failed to fetch signatures.', { status: 'error', label: 'Error' }).subscribe();
        return throwError(error);
      })
    );
  }
}
