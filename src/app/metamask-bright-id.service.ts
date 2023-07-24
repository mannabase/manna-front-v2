import {Injectable} from '@angular/core';
import {ethers} from 'ethers';
import {BehaviorSubject, Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {MessageService} from "primeng/api";
import {DialogService} from "primeng/dynamicdialog";
import {VerificationDialogComponent} from "./verification-dialog/verification-dialog.component";
<<<<<<< HEAD
import {MannaToClaimService} from "./mannaToClaim.service";
import {UserService} from "./user.service";
=======
import {MannaService} from "./manna.service";
>>>>>>> b9f4945551fc7d147681b019228f3d7b41dc88f2

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
  private serverUrl: string;
  network$ = new BehaviorSubject<ethers.providers.Network | null>(null);
  isConnected$ = new BehaviorSubject<boolean>(false);
  account$ = new BehaviorSubject<string>('');
  verificationStatus$ = new BehaviorSubject<VerificationStatus | null>(null);
  checkBrightIdStatus$ = new BehaviorSubject<VerificationStatus | null>(null);
<<<<<<< HEAD
  mannaToClaimService: MannaToClaimService;
  // userService: UserService;
=======
  mannaToClaimService: MannaService;
>>>>>>> b9f4945551fc7d147681b019228f3d7b41dc88f2

  constructor(
    private http: HttpClient,
    readonly messageService: MessageService,
    readonly dialogService: DialogService,
<<<<<<< HEAD
    mannaToClaim: MannaToClaimService,
    // userService: UserService 

  ) {
    this.serverUrl = 'https://mannatest.hedgeforhumanity.org/backend/';
    this.mannaToClaimService = mannaToClaim;
    this.mannaToClaimService.setServerUrl(this.serverUrl); 
    // this.userService = userService;
=======
    mannaToClaim: MannaService
  ) {
    this.serverUrl = 'https://mannatest.hedgeforhumanity.org/backend/';
    this.mannaToClaimService = mannaToClaim;
    this.mannaToClaimService.setServerUrl(this.serverUrl);
>>>>>>> b9f4945551fc7d147681b019228f3d7b41dc88f2
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
              this.mannaToClaimService.claim();
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
    // this.userService.updateUserState();
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
    this.account$.next(await signer.getAddress());
  }
}
