import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, from, Observable, of, throwError } from 'rxjs';
import { catchError, map, tap, switchMap } from 'rxjs/operators';
import { TuiAlertService } from '@taiga-ui/core';
import { chainConfig, mannaChainId } from './config';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LoadingService } from './loading.service';
import { createWeb3Modal, defaultConfig } from '@web3modal/ethers';
import { ethers } from 'ethers';

const projectId = '83f8bb3871bd791900a7248b8abdcb21';

const mainnet = {
    chainId: 137,
    name: 'MATIC',
    currency: 'MATIC',
    explorerUrl: 'https://polygon-rpc.com/',
    rpcUrl: 'https://polygon-rpc.com/',
};

const metadata = {
    name: 'My Website',
    description: 'My Website description',
    url: 'https://mywebsite.com',
    icons: ['https://avatars.mywebsite.com/'],
};

const ethersConfig = defaultConfig({
    metadata,
    enableEIP6963: true,
    enableInjected: true,
    enableCoinbase: true,
    rpcUrl: '...', // Used for the Coinbase SDK
    defaultChainId: 1, // Used for the Coinbase SDK
});

const modal = createWeb3Modal({
    ethersConfig,
    chains: [mainnet],
    projectId,
    enableAnalytics: true,
    enableOnramp: true,
});

export enum MetamaskState {
    NOT_CONNECTED = 'NOT_CONNECTED',
    CONNECTED = 'CONNECTED',
    WRONG_CHAIN = 'WRONG_CHAIN',
    READY = 'READY',
}

@Injectable({
    providedIn: 'root',
})
export class MetamaskService {
    private web3Modal = modal;
    private ethereum: any = null;
    network$ = new BehaviorSubject<any>(null);
    account$: BehaviorSubject<string> = new BehaviorSubject<string>(
        localStorage.getItem('walletAddress') || ''
    );
    metamaskState$: BehaviorSubject<MetamaskState> =
        new BehaviorSubject<MetamaskState>(MetamaskState.NOT_CONNECTED);

    constructor(
        private readonly alertService: TuiAlertService,
        private readonly loadingService: LoadingService,
    ) {
        this.initializeWeb3Modal();
    }

    private async initializeWeb3Modal() {
        this.web3Modal.subscribeState((newState) => {
            if (newState.open) {
                this.loadingService.setLoading(false);
            }
        });

        this.web3Modal.subscribeProvider((providerData) => {
            const { provider, address, chainId } = providerData;
            this.ethereum = provider;
            if (address) {
                this.account$.next(address);
            }
            this.network$.next({ chainId });
            this.checkState();
        });

        if (!this.ethereum) {
            this.metamaskState$.next(MetamaskState.NOT_CONNECTED);
        } else {
            this.ethereum.on('accountsChanged', (accounts: string[]) => {
                localStorage.removeItem('localScore');
                window.location.reload();
                if (accounts.length > 0) {
                    const checksummedAddress = ethers.getAddress(accounts[0]);
                    this.account$.next(checksummedAddress);
                } else {
                    this.account$.next('');
                }
            });

            this.ethereum.on('chainChanged', (chainId: string) => {
                this.network$.next(null);
                this.checkState();
            });

            this.checkState();
        }

        combineLatest([this.account$, this.network$])
            .pipe(takeUntilDestroyed())
            .subscribe(([account, network]) => {
                if (!this.ethereum) {
                    return;
                }
                if (account.length > 0) {
                    this.ethereum.request({ method: 'eth_chainId' }).then((chainId: string | undefined) => {
                        if (chainId && BigInt(chainId) === mannaChainId) {
                            this.metamaskState$.next(MetamaskState.READY);
                            console.log('Metamask state:', MetamaskState.READY);
                        } else {
                            this.metamaskState$.next(MetamaskState.WRONG_CHAIN);
                            console.log('Metamask state:', MetamaskState.WRONG_CHAIN);
                        }
                    }).catch(() => {
                        this.alertService.open('Failed to connect to wallet', {
                            status: 'error',
                        });
                    });
                } else {
                    this.metamaskState$.next(MetamaskState.NOT_CONNECTED);
                    console.log('Metamask state:', MetamaskState.NOT_CONNECTED);
                }
            });
    }

    checkState() {
        if (!this.ethereum) {
            return;
        }
        this.ethereum.request({ method: 'eth_accounts' }).then((accounts: any) => {
            if (accounts.length > 0) {
                this.account$.next(accounts[0]);
                this.metamaskState$.next(MetamaskState.CONNECTED);
                console.log('Metamask state:', MetamaskState.CONNECTED);
            } else {
                this.metamaskState$.next(MetamaskState.NOT_CONNECTED);
                console.log('Metamask state:', MetamaskState.NOT_CONNECTED);
            }
        });
    }

    connect(): Observable<string> {
        return from(this.ethereum.request({ method: 'eth_requestAccounts' }) as Promise<any>)
            .pipe(
                map((accounts: any) => {
                    if (accounts.length === 0) {
                        throw new Error('No account found');
                    }
                    const account = accounts[0];
                    this.account$.next(account);
                    this.metamaskState$.next(MetamaskState.CONNECTED);
                    console.log('Metamask state:', MetamaskState.CONNECTED);
                    return account;
                })
            );
    }

    connectWallet() {
        this.loadingService.setLoading(true);
        this.web3Modal.open({ view: 'Connect' });
        this.connect().subscribe({
            next: (account) => {
                this.loadingService.setLoading(false);
                this.alertService.open('Connected to account: ' + this.account$.value, {
                    status: 'success',
                }).subscribe();
                this.checkNetwork();
            },
            error: () => {
                this.loadingService.setLoading(false);
                this.alertService.open('Failed to connect Metamask', {
                    status: 'error',
                }).subscribe();
            },
        });
    }

    disconnectWallet() {
        if (this.ethereum) {
            this.web3Modal.disconnect();
            this.account$.next('');
            this.metamaskState$.next(MetamaskState.NOT_CONNECTED);
            console.log('Metamask state:', MetamaskState.NOT_CONNECTED);
        }
    }

    checkNetwork() {
        if (!this.ethereum) {
            this.metamaskState$.next(MetamaskState.NOT_CONNECTED);
            console.log('Metamask state:', MetamaskState.NOT_CONNECTED);
            return;
        }
        this.ethereum.request({ method: 'eth_chainId' }).then((chainId: string | undefined) => {
            if (chainId && BigInt(chainId) === mannaChainId) {
                this.metamaskState$.next(MetamaskState.READY);
                console.log('Metamask state:', MetamaskState.READY);
            } else {
                this.metamaskState$.next(MetamaskState.WRONG_CHAIN);
                console.log('Metamask state:', MetamaskState.WRONG_CHAIN);
            }
        }).catch(() => {
            this.metamaskState$.next(MetamaskState.NOT_CONNECTED);
            console.log('Metamask state:', MetamaskState.NOT_CONNECTED);
        });
    }

    switchToMannaChain(): Observable<any> {
        this.loadingService.setLoading(true);
        return from(this.ethereum.request({ method: 'eth_chainId' })).pipe(
            switchMap((currentChainId: unknown) => {
                const currentChainIdString = currentChainId as string | undefined;
                if (currentChainIdString && BigInt(currentChainIdString) === mannaChainId) {
                    this.loadingService.setLoading(false);
                    this.network$.next({ chainId: mannaChainId });
                    this.metamaskState$.next(MetamaskState.READY);
                    console.log('Metamask state:', MetamaskState.READY);
                    return of({ chainId: mannaChainId });
                } else {
                    return from(this.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [chainConfig],
                    }) as Promise<any>).pipe(
                        tap(() => {
                            this.loadingService.setLoading(false);
                            this.network$.next({ chainId: mannaChainId });
                            this.metamaskState$.next(MetamaskState.READY);
                            console.log('Metamask state:', MetamaskState.READY);
                        }),
                        catchError((error) => {
                            this.loadingService.setLoading(false);
                            this.metamaskState$.next(MetamaskState.WRONG_CHAIN);
                            console.log('Metamask state:', MetamaskState.WRONG_CHAIN);
                            return throwError(error);
                        })
                    );
                }
            }),
            catchError((error) => {
                this.loadingService.setLoading(false);
                this.metamaskState$.next(MetamaskState.NOT_CONNECTED);
                console.log('Metamask state:', MetamaskState.NOT_CONNECTED);
                return throwError(error);
            })
        );
    }

    signMessage(message: string): Observable<string> {
        this.loadingService.setLoading(true);

        return from(this.ethereum.request({
            method: 'personal_sign',
            params: [message, this.account$.value],
        }) as Promise<string>).pipe(
            tap(() => this.loadingService.setLoading(false)),
            catchError((error) => {
                this.loadingService.setLoading(false);
                return throwError(error);
            })
        );
    }
}
