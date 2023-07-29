import {Injectable} from '@angular/core';
import {ethers} from 'ethers';
import { from, BehaviorSubject, Observable, of, firstValueFrom,switchMap } from 'rxjs';
import { tap } from 'rxjs/operators';
import {HttpClient} from '@angular/common/http';
import {MessageService} from "primeng/api";
import {DialogService} from "primeng/dynamicdialog";
import {VerificationDialogComponent} from "./verification-dialog/verification-dialog.component";
import {EmailDialogComponent} from "./email-dialog/email-dialog.component";
import {MannaService} from "./manna.service";
import {UserClaimingState, UserService} from "./user.service";

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
  serverUrl: string;
  network$ = new BehaviorSubject<ethers.providers.Network | null>(null);
  account$ = new BehaviorSubject<string>('');
  verificationStatus$ = new BehaviorSubject<VerificationStatus | null>(null);
  checkBrightIdStatus$ = new BehaviorSubject<VerificationStatus | null>(null);
  balance$ = new BehaviorSubject<ethers.BigNumber | null>(null);

  constructor(
    private http: HttpClient,
    readonly messageService: MessageService,
    readonly dialogService: DialogService,
    readonly mannaService: MannaService,
    readonly userService: UserService
  ) {
    this.serverUrl = 'https://mannatest.hedgeforhumanity.org/backend/';
    this.mannaService.setServerUrl(this.serverUrl);
  }

  async loadNetwork() {
    const provider = new ethers.providers.Web3Provider(ethereum);
    const network = await provider.getNetwork();
    this.network$.next(network)
  }

  public isCorrectNetwork() {
    if (this.network$.value == null)
      return false
    return this.network$.value.chainId === 42161
  }

  async checkUserState(): Promise<boolean> {
    if (typeof ethereum !== 'undefined') {
      const accounts = await ethereum.request({method: 'eth_accounts'});
      const isConnected = accounts.length > 0;
      if (isConnected) {
        this.userService.userClaimingState$.next(UserClaimingState.METAMASK_CONNECTED);
        await this.loadNetwork();
        if (!this.isCorrectNetwork())
          await this.switchToArbitrum();

        if (this.isCorrectNetwork())
          this.userService.userClaimingState$.next(UserClaimingState.CORRECT_CHAIN);

        await this.loadAccount();
        const walletAddress = this.account$.getValue();
        const verificationStatus = await firstValueFrom(this.getVerificationStatus(walletAddress))
        this.verificationStatus$.next(verificationStatus.status);
        
        if (this.verificationStatus$.value == VerificationStatus.SUCCESSFUL)
          this.userService.userClaimingState$.next(UserClaimingState.VERIFIED)
      } else {
        this.userService.userClaimingState$.next(UserClaimingState.ZERO);
      }
      return isConnected;
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'MetaMask is not installed',
        detail: 'Please install metamask extension'
      });
      return false;
    }
  }
  

  tryClaim() {
    return from(this.checkUserState()).pipe(
      switchMap((isConnected: boolean) => {
        console.log('userClaimingState :',this.userService.userClaimingState$.value)
        if (!isConnected) {
          return from(ethereum.request({ method: 'eth_requestAccounts' })).pipe(
            tap(() => this.userService.userClaimingState$.next(UserClaimingState.METAMASK_CONNECTED)),
            switchMap(() => this.checkUserState())
          );
        } else {
          return of(true);
        }
      }),
      switchMap((value: any) => {
        console.log('userClaimingState :',this.userService.userClaimingState$.value)
        const walletAddress = this.account$.getValue();
        if (this.userService.userClaimingState$.value != UserClaimingState.METAMASK_CONNECTED
          && this.userService.userClaimingState$.value != UserClaimingState.CORRECT_CHAIN) {
          return of(true)
        } else {
          return this.openVerifyDialog(walletAddress)
            .pipe(
              switchMap(_ => {
                if (this.userService.userClaimingState$.value == UserClaimingState.VERIFIED) {
                  return of(true)
                } else {
                  throw new Error("Verification failed");
                }
              })
            );
        }
      }),
      switchMap(_ => {
        console.log('userClaimingState :',this.userService.userClaimingState$.value)
        if (this.userService.userClaimingState$.value == UserClaimingState.READY) {
          return this.mannaService.claim()
        } else {
          throw new Error("Failed to claim");
        }
      })
    )
  }


  
  
  
  

  

  openVerifyDialog(walletAddress: string) {
    let ref = this.dialogService.open(VerificationDialogComponent, {
      header: 'Verify with BrightID',
      data: {
        wallet: walletAddress
      },
    })
    return ref.onClose;
  }

  openEmailDialog(walletAddress: string) {
    let ref = this.dialogService.open(EmailDialogComponent, {
      header: 'submit your email:',
      data: {
        wallet: walletAddress
      }
    })
    return ref.onClose;
  }


  getVerificationStatus(walletAddress: string): Observable<any> {
    return this.http.get<string>(this.serverUrl + `brightId/isLinked/${walletAddress}`);
  }

  checkBrightIdStatus(walletAddress: string) {
    this.http
      .get<string>(this.serverUrl + `brightId/verifications/${walletAddress}`)
      .subscribe({
        next: (response: any) => {
          this.checkBrightIdStatus$.next(response.data);
        },
        error: (err) => {
          this.messageService.add({
            severity: 'error',
            summary: 'You are not Verified',
            detail: 'The verification process failed'
          });
        }
      });
  }

  async switchToArbitrum(): Promise<void> {
    try {
      await ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: '0xa4b1', 
            chainName: 'Arbitrum One',
            rpcUrls: ['https://arbitrum-mainnet.infura.io'], 
            nativeCurrency: {
              name: 'Ethereum',
              symbol: 'ETH',
              decimals: 18,
            },
            blockExplorerUrls: ['https://explorer.arbitrum.io'],
          },
        ],
      });
      await this.loadNetwork();
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
    this.account$.next(await signer.getAddress());
  }
  async loadBalance() {
    if (this.account$.value) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const balance = await signer.getBalance();
      this.balance$.next(balance);
    } else {
      this.balance$.next(null);
    }
  }
}