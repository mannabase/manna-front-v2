import { Injectable, Injector } from '@angular/core';
import { ethers } from 'ethers';
import { BehaviorSubject, from, Observable, throwError } from 'rxjs';
import { map, tap } from 'rxjs/operators';
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
  account$ = new BehaviorSubject<string>('');
  balance$ = new BehaviorSubject<bigint | null>(null);
  qrcodeValue: string = '';
  public brightIdVerifiedData: any = null;
  private chainSwitched = false;

  constructor(
    private readonly alertService: TuiAlertService,
    private readonly dialogService: TuiDialogService,
    private readonly injector: Injector
  ) {}

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
    return new Observable((subscriber) => {
      if (typeof ethereum === 'undefined') {
        subscriber.next(MetamaskState.NOT_INSTALLED);
        subscriber.complete();
        return;
      }

      const provider = new ethers.BrowserProvider(ethereum);

      from(provider.getNetwork()).subscribe({
        next: (network) => {
          if (network.chainId === mannaChainId) {
            if (this.chainSwitched) {
              subscriber.next(MetamaskState.READY);
              this.chainSwitched = false;
            } else {
              subscriber.next(MetamaskState.CONNECTED);
            }
          } else {
            subscriber.next(MetamaskState.WRONG_CHAIN);
          }
          subscriber.complete();
        },
        error: (err) => {
          this.alertService.open('Failed to load web3 network', {
            status: 'error',
          });
          subscriber.complete();
        },
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
}
