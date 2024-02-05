import {Injectable} from '@angular/core';
import {throwError, Observable, of} from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { tap, catchError } from 'rxjs/operators';
import { TuiAlertService } from '@taiga-ui/core';
import {serverUrl} from "./config";

export interface Signature {
    timestamp: number;
    v: number;
    r: string;
    s: string;
}

@Injectable({
    providedIn: 'root'
})
export class MannaService {

    constructor(
        private http: HttpClient,
        private alertService: TuiAlertService
    ) {
    }

    getClaimableAmount(walletAddress: string): Observable<any> {
        return this.http.get<any>(`${serverUrl}/balance/${walletAddress}`).pipe(
            tap(response => {
                console.log('Claimable amount received:', response); 
            }),
            catchError(error => {
                console.error('Error fetching claimable amount:', error);
                return throwError(error);
            })
        );
    }

    requestClaim(walletAddress: string): void {
        const payload = {mannaWallet$: walletAddress};
        this.http.post<any>(serverUrl + '/manna/claim', payload);
    }
    getGitcoinScore(walletAddress: string, signature: string, timestamp: number): Observable<any> {
        const payload = { timestamp, signature, user: walletAddress };
        return this.http.post<any>(`${serverUrl}/signing/gitcoinPassportScore`, payload).pipe(
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
                this.alertService.open("Claim in mannabase is successful!", { status: 'success' }).subscribe();
            }),
            catchError(error => {
                this.alertService.open("Failed to Claim. Please try again.", { status: 'error' }).subscribe();
                return throwError(error);
            })
        );
    }
    sendClaimWithSig(walletAddress: string, signature: string, timestamp: number): Observable<any> {
        const payload = {
            user: walletAddress,
            signature: signature,
            timestamp: timestamp
        };
    
        return this.http.post<any>(`${serverUrl}/signing/getCheckinSigs`, payload).pipe(
            tap(response => {
                console.log('Check-in signatures received:', response);
                if (response.status === 'ok') {
                    this.alertService.open('Signatures fetched successfully.', { status: 'success', label: 'Success' }).subscribe();
                } else {
                    this.alertService.open(`Error: ${response.msg}`, { status: 'error', label: 'Error' }).subscribe();
                }
            }),
            catchError(error => {
                console.error('Error fetching check-in signatures:', error);
                this.alertService.open('Failed to fetch signatures.', { status: 'error', label: 'Error' }).subscribe();
                return throwError(error);
            })
        );
    }
    
    
    
  getMannabaseBalance(walletAddress: string): Observable<any> {
    return this.http.get<any>(`${serverUrl}/manna/balance/${walletAddress}`).pipe(
        tap(response => {
            if (response.status === 'ok') {
                this.alertService.open(`Balance: ${response.balance}`, { status: 'success', label: 'mannabase' }).subscribe();
            } else {
                this.alertService.open(`Error: ${response.msg}`, { status: 'warning', label: 'Warning' }).subscribe();
            }
        }),
        catchError(error => {
            console.error('Error show Mannabase balance:', error);
            this.alertService.open('Failed to show Mannabase balance.', { status: 'error', label: 'Error' }).subscribe();
            return throwError(error);
        })
    );
}
}
