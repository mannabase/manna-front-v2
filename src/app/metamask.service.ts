import {Injectable,Input } from '@angular/core';
import {ethers} from 'ethers';
import {BehaviorSubject} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {MessageService} from "primeng/api";
import {DialogService} from "primeng/dynamicdialog";
import {VerificationDialogComponent} from "./verification-dialog/verification-dialog.component";

declare let ethereum: any;

@Injectable({
  providedIn: 'root'
})
export class MetamaskService {
  private serverUrl = 'https://mannatest.hedgeforhumanity.org/backend/'
  isConnected$ = new BehaviorSubject<boolean>(false);
  isCorrectChain$ = new BehaviorSubject<boolean>(false);
  // account$ = new BehaviorSubject<string | null>(null);
  isVerified$ = new BehaviorSubject<boolean>(false);
  account$ = new BehaviorSubject<string>('');
  isVerifiedStatus$ = new BehaviorSubject<string>('');
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
          await this.checkChain();
          this.getAccount();
        }
      } catch (error) {
        console.error('Error checking MetaMask status:', error);
        this.messageService.add({severity: 'error', summary: 'Error checking MetaMask status', detail: error + ""})
      }
    } else {
      console.error('MetaMask is not installed');
      this.messageService.add({
        severity: 'error',
        summary: 'MetaMask is not installed',
        detail: 'Please install metamask extension'
      })
    }
  }

  async checkChain(): Promise<void> {
    const provider = new ethers.providers.Web3Provider(ethereum);
    const network = await provider.getNetwork();
    this.isCorrectChain$.next(network.chainId === 0x4a);
  }

  async tryClaim(): Promise<void> {
    if (typeof ethereum !== 'undefined') {
      try {
        const accounts = await ethereum.request({method: 'eth_accounts'});
        const isConnected = accounts.length > 0;
        this.isConnected$.next(isConnected);
        if (isConnected) {
          await this.checkChain();
          this.getAccount();
          if (!this.isCorrectChain$.value) {
                await this.switchToIDChain();
          }else if (this.isVerified$.value) {
            this.claim();
          } else {
            const walletAddress = this.account$.getValue();
            if (walletAddress) {
              await this.verify(walletAddress);
            } else {
              console.error('Error: Wallet address is null or empty');
            }
          }
        } else {
          await this.connect();
        }
      } catch (error) {
        console.error('Error checking MetaMask status:', error);
      }
    } else {
      console.error('MetaMask is not installed');
    }
  }

  generateAndShowQRCode(walletAddress: string) {
    this.dialogService.open(VerificationDialogComponent, {
      header: 'Verify with BrightID',
      data: {
        wallet: walletAddress
      }
    })
  }

  verify(walletAddress: string) {
    this.http
      .get<string>(this.serverUrl+`brightId/isLinked/${walletAddress}`)
      .subscribe({
        next: (response: any) => {
          this.isVerifiedStatus$.next(response.status); // Set the response status in isVerifiedStatus$
          this.generateAndShowQRCode(walletAddress);
        },
        error: (err) => {
          this.isVerifiedStatus$.next('NOT_VERIFIED'); // Set status to "NOT_VERIFIED" on error
          this.messageService.add({
            severity: 'error',
            summary: 'Verification Failed',
            detail: 'The verification process failed. Please try again later or contact support.'
          });
        }
      });
  }
  hasTaken(walletAddress: string) {
    this.http
      .get<string>(this.serverUrl+`conversion/claimable/${walletAddress}`)
      .subscribe({
        next: (response: any) => {
          this.hasTakenResult$.next(response.status); // Set the response status in isVerifiedStatus$
          this.generateAndShowQRCode(walletAddress);
        },
        error: (err) => {
          this.isVerifiedStatus$.next('NOT_VERIFIED'); // Set status to "NOT_VERIFIED" on error
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
      .get<string>(this.serverUrl+`conversion/getBalance/${walletAddress}`)
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
      .get<string>(this.serverUrl+`conversion/mannaWallet/${walletAddress}`)
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
      { email: email };
    this.http.post<any>(this.serverUrl+'conversion/requestMailCode', payload)
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
      await this.checkChain();
      this.getAccount();
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
        console.warn('User rejected chain switch');
      } else {
        console.error('Error switching chain:', error);
      }
    }
  }

  async getAccount(): Promise<void> {
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    this.account$.next(await signer.getAddress()); // Update the wallet address
  }

  claim(): void {
    console.log('Claim button clicked');
  }
}