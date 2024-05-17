import { Injectable } from '@angular/core';
import {
    BehaviorSubject,
    combineLatest,
    from,
    Observable,
    of,
    throwError,
} from 'rxjs';
import { catchError, map, tap, switchMap } from 'rxjs/operators';
import { TuiAlertService } from '@taiga-ui/core';
import { chainConfig, mannaChainId } from './config';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LoadingService } from './loading.service';
import { createWeb3Modal, defaultConfig } from '@web3modal/ethers';
import { ethers, BrowserProvider, JsonRpcProvider, Contract, Typed } from 'ethers';

// Web3Modal Configuration
const projectId = 'YOUR_PROJECT_ID'; // Replace with your actual project ID

const mainnet = {
    chainId: 1,
    name: 'Ethereum',
    currency: 'ETH',
    explorerUrl: 'https://etherscan.io',
    rpcUrl: 'https://cloudflare-eth.com',
};

const metadata = {
    name: 'My Website',
    description: 'My Website description',
    url: 'https://mywebsite.com', // URL must match your domain & subdomain
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
        this.web3Modal.open({ view: 'Connect' });

        // Handling the connection logic
        this.ethereum = await new Promise((resolve, reject) => {
            const unsubscribe = this.web3Modal.subscribeProvider((provider: any) => {
                unsubscribe();
                if (provider) {
                    resolve(provider);
                } else {
                    reject(new Error('Failed to connect to provider'));
                }
            });
        });

        if (this.ethereum) {
            this.ethereum.on('accountsChanged', (accounts: string[]) => {
                localStorage.removeItem('localScore');
                window.location.reload();
                if (accounts.length > 0) {
                    this.account$.next(accounts[0]);
                } else {
                    this.account$.next('');
                }
            });

            this.ethereum.on('chainChanged', (chainId: string) => {
                this.network$.next(null);
                this.checkState();
            });

            this.checkState();
        } else {
            this.metamaskState$.next(MetamaskState.NOT_INSTALLED);
        }

        combineLatest([this.account$, this.network$])
            .pipe(takeUntilDestroyed())
            .subscribe((data) => {
                const account = data[0];
                if (!this.ethereum) {
                    this.metamaskState$.next(MetamaskState.NOT_INSTALLED);
                    return;
                }
                if (account.length > 0) {
                    this.ethereum.request({ method: 'eth_chainId' }).then((chainId: string) => {
                        if (BigInt(chainId) === mannaChainId) {  // Fix: Convert chainId to BigInt
                            this.metamaskState$.next(MetamaskState.READY);
                        } else {
                            this.metamaskState$.next(MetamaskState.WRONG_CHAIN);
                        }
                    }).catch((err: any) => {
                        this.alertService.open('Failed to connect to wallet', {
                            status: 'error',
                        });
                    });
                } else {
                    this.metamaskState$.next(MetamaskState.NOT_CONNECTED);
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
                    return account;
                })
            );
    }

    connectWallet() {
        if (!this.ethereum) {
            this.alertService.open('Metamask is not installed. Please install Metamask and try again.', {
                status: 'error',
            }).subscribe();
            window.open('https://metamask.io/');
            return;
        }
        this.loadingService.setLoading(true);
        this.web3Modal.open({ view: 'Connect' }); 
        this.connect().subscribe({
            next: (account) => {
                this.loadingService.setLoading(false);
                this.alertService.open('Connected to account: ' + this.account$.value, {
                    status: 'success',
                }).subscribe();
            },
            error: (err) => {
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
        }
    }

    switchToMannaChain(): Observable<any> {
        this.loadingService.setLoading(true);
        return from(this.ethereum.request({ method: 'eth_chainId' })).pipe(
            switchMap((currentChainId: unknown) => {
                const currentChainIdString = currentChainId as string; // Cast to string
                if (BigInt(currentChainIdString) === mannaChainId) {  // Use the casted string
                    this.loadingService.setLoading(false);
                    this.network$.next({ chainId: mannaChainId });
                    return of({ chainId: mannaChainId });
                } else {
                    return from(this.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [chainConfig],
                    }) as Promise<any>).pipe(
                        tap(() => {
                            this.loadingService.setLoading(false);
                            this.network$.next({ chainId: mannaChainId });
                        }),
                        catchError((error) => {
                            this.loadingService.setLoading(false);
                            return throwError(error);
                        })
                    );
                }
            }),
            catchError((error) => {
                this.loadingService.setLoading(false);
                return throwError(error);
            })
        );
    }

    signMessage(message: string): Observable<string> {
        this.loadingService.setLoading(true);
        return from(
            this.ethereum.request({
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
