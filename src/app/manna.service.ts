import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {MessageService} from "primeng/api";
import {DialogService} from "primeng/dynamicdialog";

@Injectable({
  providedIn: 'root'
})
export class MannaService {
  private serverUrl!: string;
  mannaWallet$ = new BehaviorSubject<string>('');
  email: string = '';

  constructor(
    private http: HttpClient,
    private readonly messageService: MessageService,
    private readonly dialogService: DialogService,
  ) {
  }

  setServerUrl(serverUrl: string) {
    this.serverUrl = serverUrl;
  }

  getBalance(walletAddress: string) {
    return this.http.get<string>(this.serverUrl + `conversion/getBalance/${walletAddress}`);
  }

  mannaWallet(walletAddress: string) {
    return this.http.get<string>(this.serverUrl + `conversion/mannaWallet/${walletAddress}`);
  }
  sendEmail(email: string): Observable<any> {
    const payload ={email: email};
    return this.http.post<any>(this.serverUrl + 'conversion/requestMailCode', payload);
  }
  
  sendCode(email: string): Observable<any> {
    const payload ={email: email};
    return this.http.post<any>(this.serverUrl + '/conversion/submitMailCode', payload);
  }
  mannaToClaim(walletAddress: string): Observable<string> {
    return this.http.get<string>(this.serverUrl + `conversion/claimable/${walletAddress}`);
  }
  requestClaim(walletAddress: string): void {
    const payload ={mannaWallet$ : walletAddress };
    this.http.post<any>(this.serverUrl + '/manna/claim', payload);
  }

  claim(): Observable<any> {
    return of("HAHA")
  }
}
