import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {MessageService} from "primeng/api";
import {DialogService} from "primeng/dynamicdialog";

@Injectable({
  providedIn: 'root'
})
export class MannaService {
  private serverUrl!: string;
  hasTakenResult$ = new BehaviorSubject<string>('');
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

  hasTaken(walletAddress: string) {
    this.http
      .get<string>(this.serverUrl + `conversion/claimable/${walletAddress}`)
      .subscribe({
        next: (response: any) => {
          this.hasTakenResult$.next(response.status);
        },
        error: (err) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Verification Failed',
            detail: 'The verification process failed. Please try again later or contact support.'
          });
        }
      });
  }

  getBalance(walletAddress: string) {
    return this.http.get<string>(this.serverUrl + `conversion/getBalance/${walletAddress}`);
  }

  mannaWallet(walletAddress: string) {
    this.http
      .get<string>(this.serverUrl + `conversion/mannaWallet/${walletAddress}`)
      .subscribe({
        next: (response: any) => {
          this.mannaWallet$.next(response.data);
        },
        error: (err) => {
          this.mannaWallet$.next('not set');
          this.messageService.add({
            severity: 'error',
            summary: 'Verification Failed',
            detail: 'The verification process failed. Please try again later or contact support.'
          });
        }
      });
  }

  submitEmail(email: string): void {
    const payload =
      {email: email};
    this.http.post<any>(this.serverUrl + 'conversion/requestMailCode', payload)
      .subscribe(
        (response) => {
          // Handle the successful response from the server
          console.log('Email verification request successful:', response);
          // Optionally, display a success message using the MessageService
          this.messageService.add({
            severity: 'success',
            summary: 'Verification Email Sent',
            detail: 'An email with the verification code has been sent to your email address.'
          });
        },
        (error) => {
          // Handle errors and display an error message using the MessageService
          console.error('Error verifying email:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Verification Failed',
            detail: 'Failed to send the verification email. Please try again later or contact support.'
          });
        }
      );
  }

  claim(): void {
    console.log('Claim button clicked');
  }
}
