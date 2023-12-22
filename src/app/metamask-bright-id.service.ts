import { Injectable, Injector } from '@angular/core';
import { ethers } from 'ethers';
import { BehaviorSubject, from, Observable, throwError } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { TuiAlertService, TuiDialogService } from '@taiga-ui/core';
import { chainConfig, mannaChainId } from './config';

declare let ethereum: any;

declare global {
  interface Window {
    ethereum: any;
  }
}

export enum MetamaskState {
  NOT_INSTALLED = 'NOT_INSTALLED',
  NOT_CONNECTED = 'NOT_CONNECTED',
  CONNECTED = 'CONNECTED',
  WRONG_CHAIN = 'WRONG_CHAIN',
  READY = 'READY',
}

@Injectable({
  providedIn: 'root',
})
export class MetamaskBrightIdService {
  network$ = new BehaviorSubject<ethers.Network | null>(null);
  balance$ = new BehaviorSubject<bigint | null>(null);
  qrcodeValue: string = '';
  public brightIdVerifiedData: any = null;
  private chainSwitched = false;
  account$: BehaviorSubject<string> = new BehaviorSubject<string>(localStorage.getItem('walletAddress') || '');

  constructor(
    private readonly alertService: TuiAlertService,
    private readonly dialogService: TuiDialogService,
    private readonly injector: Injector,
  ) {
    this.initializeAccountListener();
  }
  private initializeAccountListener() {
    if (window.ethereum) {
        window.ethereum.on('accountsChanged', (accounts: string[]) => {
            if (accounts.length > 0) {
                this.account$.next(accounts[0]);
            } else {
                this.account$.next('');
            }
        });
        this.checkInitialAccount();
    } else {
        console.error('MetaMask is not installed');
        // Handle MetaMask not installed scenario
    }
}

private checkInitialAccount() {
    if (window.ethereum) {
        window.ethereum.request({ method: 'eth_accounts' })
            .then((accounts: string[]) => {
                if (accounts.length > 0) {
                    this.account$.next(accounts[0]);
                } else {
                    this.account$.next('');
                }
            })
            .catch((err: any) => {
                console.error('Error fetching accounts:', err);
            });
    }
}
  connect(): Observable<string> {
    return from((window as any).ethereum.request({ method: 'eth_requestAccounts' })).pipe(
      map((accounts: any) => {
        if (accounts.length === 0) {
          throw new Error('No account found');
        }
        const account = accounts[0];
        this.account$.next(account);
        return account;
      })
    );
  }

  switchToMannaChain(): Observable<any> {
    return from(ethereum.request(chainConfig)).pipe(
      tap(() => {
        this.chainSwitched = true;
      })
    );
  }

  checkMetamaskState(): Observable<MetamaskState> {
    return new Observable(subscriber => {
      if (typeof ethereum === 'undefined') {
        subscriber.next(MetamaskState.NOT_INSTALLED);
        subscriber.complete();
        return;
      }
      const provider = new ethers.BrowserProvider(ethereum);
      provider.listAccounts().then(accounts => {
        if (accounts.length === 0) {
          subscriber.next(MetamaskState.NOT_CONNECTED);
          subscriber.complete();
        } else {
          provider.getNetwork().then(network => {
            if (network.chainId === mannaChainId) {
              subscriber.next(MetamaskState.READY);
            } else {
              subscriber.next(MetamaskState.WRONG_CHAIN);
            }
            subscriber.complete();
          }).catch(err => {
            console.error('Error getting network:', err);
            this.alertService.open('Failed to load web3 network', {
              status: 'error',
            });
            subscriber.complete();
          });
        }
      }).catch(err => {
        console.error('Error listing accounts:', err);
        this.alertService.open('Failed to check MetaMask accounts', {
          status: 'error',
        });
        subscriber.complete();
      });
    });
  }
  

  async loadBalance() {
    if (this.account$.value) {
      const provider = new ethers.BrowserProvider(ethereum);
      const balance = await provider.getBalance(this.account$.value);
      this.balance$.next(balance);
    } else {
      this.balance$.next(null);
    }
  }

  signMessage(message: string): Observable<string> {
    return from((window as any).ethereum.request({
      method: 'personal_sign',
      params: [message, this.account$.value],
    }) as Promise<string>);
  }
  signUserMessage(): Observable<string> {
    const timestamp = Math.floor(Date.now() / 1000);
    const address = this.account$.value;
    const message = `Verification request\naddress: ${address}\ntimestamp: ${timestamp}`;

    console.log('Requesting signature for message:', message);

    return this.signMessage(message).pipe(
      tap(signature => {
        console.log('Message signed:', signature);
        this.alertService.open('Message successfully signed.', { status: 'success', label: 'Success' }).subscribe();
      }),
      catchError(error => {
        console.error('Error signing message:', error);
        this.alertService.open('Failed to sign the message. Please try again.', { status: 'error', label: 'Error' }).subscribe();
        return throwError(error);
      })
    );
  } 
}
