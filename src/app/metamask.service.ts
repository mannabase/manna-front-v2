import { Injectable,Injector } from '@angular/core';
import { ethers } from 'ethers';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';
import QRCode from 'qrcode';

declare let ethereum: any;

@Injectable({
  providedIn: 'root'
})
export class MetamaskService {
  isConnected$ = new BehaviorSubject<boolean>(false);
  isCorrectChain$ = new BehaviorSubject<boolean>(false);
  // account$ = new BehaviorSubject<string | null>(null); 
  isVerified$ = new BehaviorSubject<boolean>(false);
  account$ = new BehaviorSubject<string>('');
  private http: HttpClient;

  constructor(private injector: Injector) {
    this.http = this.injector.get(HttpClient);
  }
  async checkMetamaskStatus(): Promise<void> {
  if (typeof ethereum !== 'undefined') {
    try {
      const accounts = await ethereum.request({ method: 'eth_accounts' });
      const isConnected = accounts.length > 0;
      this.isConnected$.next(isConnected);
      if (isConnected) {
        await this.checkChain();
        this.getAccount();
      }
    } catch (error) {
      console.error('Error checking MetaMask status:', error);
      Swal.fire({
        icon: 'error',
        title: `'Error checking MetaMask status:', error`,
        timer: 2000,
        showConfirmButton: false,
        position: 'bottom',
      });
    }
  } else {
    console.error('MetaMask is not installed');
    Swal.fire({
      icon: 'error',
      title: 'MetaMask is not installed',
      text: 'to connect your wallet install metamask extension',
      confirmButtonColor: '#d33',
      showClass: {
        popup: 'animate__animated animate__fadeInDown'
      },
      hideClass: {
        popup: 'animate__animated animate__fadeOutUp'
      }
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
        const accounts = await ethereum.request({ method: 'eth_accounts' });
        const isConnected = accounts.length > 0;
        this.isConnected$.next(isConnected);

        if (isConnected) {
          await this.checkChain();
          this.getAccount();

          if (this.isVerified$.value) {
            this.claim();
          } else {
            const walletAddress = this.account$.getValue();
            if (walletAddress) {
              await this.verify(walletAddress);
            } else {
              console.error('Error: Wallet address is null or empty');
            }
          }
        }
      } catch (error) {
        console.error('Error checking MetaMask status:', error);
      }
    } else {
      console.error('MetaMask is not installed');
    }
  }
  async generateAndShowQRCode(walletAddress: string): Promise<void> {
    const qrCodeValue = `brightid://link-verification/http:%2f%2fnode.brightid.org/idchain/${walletAddress}`;
    Swal.fire({
      imageUrl: `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(qrCodeValue)}`,
      imageAlt: 'QR Code',
      showCloseButton: true,
      confirmButtonText: 'Verify'
    });
  }
  async verify(walletAddress: string): Promise<void> {
    try {
      const response = await this.http
        .get<string>(`https://mannabase.com/backend/brightId/verifications/${walletAddress}`)
        .toPromise();

      if (response) {
        this.isVerified$.next(true);
        await this.generateAndShowQRCode(walletAddress);
      } else {
        this.isVerified$.next(false);
        Swal.fire({
          icon: 'error',
          title: 'Verification Failed',
          text: 'The verification process failed. Please try again later or contact support.',
          showCloseButton: true,
          showConfirmButton: false
        });
      }
    } catch (error) {
      console.error('Error verifying the wallet address:', error);
      this.isVerified$.next(false);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'An error occurred while verifying the wallet address. Please try again later or contact support.',
        showCloseButton: true,
      });
    }
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
    } catch (error:any) {
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
