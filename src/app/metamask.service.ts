import { Injectable } from '@angular/core';
import { ethers } from 'ethers';
import {
    BehaviorSubject,
    combineLatest,
    from,
    Observable,
    switchMap,
    throwError,
} from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { TuiAlertService } from '@taiga-ui/core';
import { chainConfig, mannaChainId } from './config';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LoadingService } from './loading.service';

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
export class MetamaskService {
    network$ = new BehaviorSubject<ethers.Network | null>(null);
    account$: BehaviorSubject<string> = new BehaviorSubject<string>(
        localStorage.getItem('walletAddress') || ''
    );
    metamaskState$: BehaviorSubject<MetamaskState> =
        new BehaviorSubject<MetamaskState>(MetamaskState.NOT_CONNECTED);

    constructor(
        private readonly alertService: TuiAlertService,
        private readonly loadingService: LoadingService,
    ) {
        if (window.ethereum) {
            window.ethereum.on('accountsChanged', (accounts: string[]) => {
                localStorage.removeItem('localScore');
                if (accounts.length > 0) {
                    this.account$.next(accounts[0]);
                } else {
                    this.account$.next('');
                }
            });
        }
        window.ethereum.on('chainChanged', (chainId: string) => {
            this.network$.next(null);
            this.checkState(); 
        });

        combineLatest([this.account$, this.network$])
            .pipe(takeUntilDestroyed())
            .subscribe((data) => {
                let account = data[0];
                if (typeof ethereum === 'undefined') {
                    this.metamaskState$.next(MetamaskState.NOT_INSTALLED);
                    return;
                }
                if (account.length > 0) {
                    const provider = new ethers.BrowserProvider(ethereum);
                    provider
                        .getNetwork()
                        .then((network) => {
                            if (network.chainId === mannaChainId) {
                                this.metamaskState$.next(MetamaskState.READY);
                            } else {
                                this.metamaskState$.next(
                                    MetamaskState.WRONG_CHAIN
                                );
                            }
                        })
                        .catch((err) => {
                            this.alertService.open(
                                'Failed to connect to wallet',
                                {
                                    status: 'error',
                                }
                            );
                        });
                } else {
                    this.metamaskState$.next(MetamaskState.NOT_CONNECTED);
                }
            });
    }
    checkState() {
        if (typeof ethereum === 'undefined') {
            return;
        }
        const provider = new ethers.BrowserProvider(ethereum);
        provider.listAccounts().then((accounts) => {
            if (accounts.length > 0) {
                this.account$.next(accounts[0].address);
            }
        });
    }

    connect(): Observable<string> {
        return from(
            (window as any).ethereum.request({ method: 'eth_requestAccounts' })
        ).pipe(
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

    connectWallet() {
        if (typeof window.ethereum === 'undefined') {
            this.alertService
                .open(
                    'Metamask is not installed. Please install Metamask and try again.',
                    {
                        status: 'error',
                    }
                )
                .subscribe();
            window.open('https://metamask.io/');
            return;
        }
        this.loadingService.setLoading(true);
        this.connect()
            .pipe(switchMap((value) => this.switchToMannaChain()))
            .subscribe({
                next: (account) => {
                    this.loadingService.setLoading(false);
                    this.alertService
                        .open('Connected to account: ' + this.account$.value, {
                            status: 'success',
                        })
                        .subscribe();
                },
                error: (err) => {
                    this.loadingService.setLoading(false);
                    this.alertService
                        .open('Failed to connect Metamask', {
                            status: 'error',
                        })
                        .subscribe();
                },
            });
    }

    switchToMannaChain(): Observable<any> {
        this.loadingService.setLoading(true);
        return from(ethereum.request(chainConfig)).pipe(
            tap(async () => {
                this.loadingService.setLoading(false);
                const provider = new ethers.BrowserProvider(ethereum);
                this.network$.next(await provider.getNetwork());
            })
        );
    }

    signMessage(message: string): Observable<string> {
        this.loadingService.setLoading(true);
        return from(
            (window as any).ethereum.request({
                method: 'personal_sign',
                params: [message, this.account$.value],
            }) as Promise<string>
        ).pipe(
            tap(() => {
                this.loadingService.setLoading(false);
            }),
            catchError((error) => {
                this.loadingService.setLoading(false);
                return throwError(error);
            })
        );
    }
}
