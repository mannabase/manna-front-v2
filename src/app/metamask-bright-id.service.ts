import {Injectable} from '@angular/core';
import {ethers} from 'ethers';
import {BehaviorSubject, Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {MessageService} from "primeng/api";
import {DialogService} from "primeng/dynamicdialog";
import {VerificationDialogComponent} from "./verification-dialog/verification-dialog.component";

declare let ethereum: any;

export enum VerificationStatus {
  NOT_LINKED = "NOT_LINKED",
  NOT_VERIFIED = "NOT_VERIFIED",
  SUCCESSFUL = "SUCCESSFUL",
  TRANSFERRED = "TRANSFERRED",
}

@Injectable({
  providedIn: 'root'
})
export class MetamaskBrightIdService {
  private serverUrl = 'https://mannatest.hedgeforhumanity.org/backend/'
  network$ = new BehaviorSubject<ethers.providers.Network | null>(null);
  isConnected$ = new BehaviorSubject<boolean>(false);
  account$ = new BehaviorSubject<string>('');
  verificationStatus$ = new BehaviorSubject<VerificationStatus | null>(null);
  hasTakenResult$ = new BehaviorSubject<string>('');
  getBalance$ = new BehaviorSubject<string>('');
  mannaWallet$ = new BehaviorSubject<string>('');
  email: string = '';

  constructor(private http: HttpClient, readonly messageService: MessageService, readonly dialogService: DialogService) {
  }

  async checkMetamaskStatus(): Promise<void> {
    if (typeof ethereum !== 'undefined') {
      try {
        const accounts = await ethereum.request({method: 'eth_accounts'});
        const isConnected = accounts.length > 0;
        this.isConnected$.next(isConnected);
        if (isConnected) {
          await this.loadNetwork();
          this.loadAccount();
        }
      } catch (error) {
        this.messageService.add({severity: 'error', summary: 'Error checking MetaMask status', detail: error + ""})
      }
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'MetaMask is not installed',
        detail: 'Please install metamask extension'
      })
    }
  }

  async loadNetwork() {
    const provider = new ethers.providers.Web3Provider(ethereum);
    const network = await provider.getNetwork();
    this.network$.next(network)
  }

  public isCorrectNetwork() {
    if (this.network$.value == null)
      return false
    return this.network$.value.chainId === 0x4a
  }

  public isUserVerified() {
    return this.verificationStatus$.value == VerificationStatus.SUCCESSFUL;
  }

  async tryClaim(): Promise<void> {
    if (typeof ethereum == 'undefined') {
      this.messageService.add({
        severity: 'error',
        summary: 'MetaMask is not installed',
        detail: 'Please install metamask extension'
      })
      return;
    }

    try {
      const accounts = await ethereum.request({method: 'eth_accounts'});
      const isConnected = accounts.length > 0;
      this.isConnected$.next(isConnected);
      if (!isConnected)
        await this.connect();

      await this.loadNetwork();
      if (!this.isCorrectNetwork())
        await this.switchToIDChain();

      this.loadAccount();
      const walletAddress = this.account$.getValue();

      this.getVerificationStatus(walletAddress)
        .subscribe({
          next: (response: any) => {
            this.verificationStatus$.next(response.status);
            if (!this.isUserVerified())
              this.verifyBrightId(walletAddress);
            else
              this.claim();
          },
          error: (err) => {
            this.verificationStatus$.next(VerificationStatus.NOT_LINKED);
            this.messageService.add({
              severity: 'error',
              summary: 'Verification Failed',
              detail: 'The verification process failed. Please try again later or contact support.'
            });
          }
        })
    } catch (error) {
      console.error('Error checking MetaMask status:', error);
    }
  }

  verifyBrightId(walletAddress: string) {
    this.dialogService.open(VerificationDialogComponent, {
      header: 'Verify with BrightID',
      data: {
        wallet: walletAddress
      }
    })
  }

  getVerificationStatus(walletAddress: string): Observable<string> {
    return this.http.get<string>(this.serverUrl + `brightId/isLinked/${walletAddress}`);
  }

  hasTaken(walletAddress: string) {
    this.http
      .get<string>(this.serverUrl + `conversion/claimable/${walletAddress}`)
      .subscribe({
        next: (response: any) => {
          this.hasTakenResult$.next(response.status); // Set the response status in isVerifiedStatus$
          this.verifyBrightId(walletAddress);
        },
        error: (err) => {
          this.verificationStatus$.next('NOT_VERIFIED'); // Set status to "NOT_VERIFIED" on error
          this.messageService.add({
            severity: 'error',
            summary: 'Verification Failed',
            detail: 'The verification process failed. Please try again later or contact support.'
          });
        }
      });
  }

  getBalance(walletAddress: string) {
    this.http
      .get<string>(this.serverUrl + `conversion/getBalance/${walletAddress}`)
      .subscribe({
        next: (response: any) => {
          this.getBalance$.next(response.data);
        },
        error: (err) => {
          this.getBalance$.next('not set');
          this.messageService.add({
            severity: 'error',
            summary: 'Verification Failed',
            detail: 'The verification process failed. Please try again later or contact support.'
          });
        }
      });
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


  async connect(): Promise<void> {
    try {
      await ethereum.enable();
      this.isConnected$.next(true);
      await this.loadNetwork();
      this.loadAccount();
    } catch (error) {
      console.error('Error connecting to MetaMask:', error);
    }
  }

  async switchToIDChain(): Promise<void> {
    try {
      await ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: '0x4a',
            chainName: 'IDChain',
            rpcUrls: ['https://idchain.one/rpc/'],
            nativeCurrency: {
              name: 'Eidi',
              symbol: 'EIDI',
              decimals: 18,
            },
            blockExplorerUrls: ['https://explorer.idchain.one/'],
          },
        ],
      });
    } catch (error: any) {
      if (error.code === 4001) {
        this.messageService.add({
          severity: 'warn',
          summary: 'You rejected chain switch',
        });
      } else {
        this.messageService.add({
          severity: 'error',
          summary: 'Error switching chain',
        });
      }
    }
  }

  async loadAccount(): Promise<void> {
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    this.account$.next(await signer.getAddress()); // Update the wallet address
  }

  claim(): void {
    console.log('Claim button clicked');
  }
}
