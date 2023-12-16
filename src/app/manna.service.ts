import {Injectable} from '@angular/core';
import {throwError, Observable, of} from 'rxjs';
import {HttpClient} from '@angular/common/http';
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
            tap(() => this.alertService.open('Signature sent to server successfully.', { status: 'success', label: 'Success' }).subscribe()),
            catchError(error => {
                console.error('Error sending signature to server:', error);
                this.alertService.open('Failed to send signature to server.', { status: 'error', label: 'Error' }).subscribe();
                return throwError(error);
            })
        );
    }
}
