import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {serverUrl} from "./config";

@Injectable({
    providedIn: 'root'
})
export class MannaService {

    constructor(
        private http: HttpClient,
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
}
