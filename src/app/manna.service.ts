import {Injectable} from '@angular/core'
import {Observable} from 'rxjs'
import {HttpClient} from '@angular/common/http'
import {serverUrl} from "./config"


@Injectable({
    providedIn: 'root',
})
export class MannaService {

    constructor(private http: HttpClient) {
    }

    getClaimableAmount(walletAddress: string): Observable<any> {
        return this.http.get<any>(`${serverUrl}/manna/toClaim/${walletAddress}`)
    }

    getGitcoinScore(walletAddress: string, signature: string, timestamp: number): Observable<any> {
        const payload = {timestamp, signature, user: walletAddress.toLowerCase()}
        return this.http.post<any>(`${serverUrl}/signing/gitcoinPassportScore`, payload)
    }

    checkin(walletAddress: string, signature: string, timestamp: number): Observable<void> {
        const payload = {timestamp, signature, user: walletAddress}
        return this.http.post<any>(`${serverUrl}/signing/checkin`, payload)
    }

    claimWithSigs(walletAddress: string, signature: string, timestamp: number): Observable<any> {
        const payload = {
            user: walletAddress,
            signature: signature,
            timestamp: timestamp,
        }
        return this.http.post<any>(`${serverUrl}/signing/getCheckinSigs`, payload)
    }

    getMannabaseBalance(walletAddress: string): Observable<any> {
        return this.http.get<any>(`${serverUrl}/manna/balance/${walletAddress}`)
    }
}
