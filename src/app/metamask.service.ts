import { Injectable } from '@angular/core';
import { BehaviorSubject, from, Observable, of, throwError } from 'rxjs';
import { catchError, map, tap, switchMap } from 'rxjs/operators';
import { TuiAlertService } from '@taiga-ui/core';
import { chainConfig, mannaChainId } from './config';
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
    enableExplorer: false
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
    account$ = new BehaviorSubject<string>(localStorage.getItem('walletAddress') || '');
    metamaskState$ = new BehaviorSubject<MetamaskState>(MetamaskState.NOT_CONNECTED);

    constructor(
        private readonly alertService: TuiAlertService,
        private readonly loadingService: LoadingService,
    ) {
        this.initializeWeb3Modal();
    }

    private async initializeWeb3Modal() {
        console.log('Initializing Web3 Modal...');
        
        this.web3Modal.subscribeState((newState) => {
            console.log('Web3 Modal state changed:', newState);
            if (newState.open) {
                this.loadingService.setLoading(false);
            }
        });

        this.web3Modal.subscribeProvider((providerData) => {
            console.log('Provider subscribed:', providerData);
            const { provider, address, chainId } = providerData;
            this.ethereum = provider;
            if (address) {
                this.account$.next(address);
            }
            this.network$.next({ chainId });
            this.checkState();
        });

        if (!this.ethereum) {
            console.log('No Ethereum provider found.');
            this.metamaskState$.next(MetamaskState.NOT_CONNECTED);
        } else {
            this.ethereum.on('accountsChanged', (accounts: string[]) => {
                console.log('Accounts changed:', accounts);
                if (accounts.length > 0) {
                    const checksummedAddress = ethers.getAddress(accounts[0]);
                    this.account$.next(checksummedAddress);
                } else {
                    this.account$.next('');
                }
            });

            this.ethereum.on('chainChanged', (chainId: string) => {
                console.log('Chain changed:', chainId);
                this.network$.next(null);
                this.checkState();
            });

            this.checkState();
        }
    }

    checkState() {
        console.log('Checking state...', this.metamaskState$.value);
        if (!this.ethereum) {
            return;
        }
        this.ethereum.request({ method: 'eth_accounts' }).then((accounts: any) => {
            console.log('eth_accounts response:', accounts);
            if (accounts.length > 0) {
                this.account$.next(accounts[0]);
                this.metamaskState$.next(MetamaskState.CONNECTED);
                this.checkNetwork();
            } else {
                this.metamaskState$.next(MetamaskState.NOT_CONNECTED);
            }
        });
    }

    connect(): Observable<string> {
        console.log('Connecting to MetaMask...');
        return from(this.ethereum.request({ method: 'eth_requestAccounts' }) as Promise<any>)
            .pipe(
                map((accounts: any) => {
                    console.log('eth_requestAccounts response:', accounts);
                    if (accounts.length === 0) {
                        throw new Error('No account found');
                    }
                    const account = accounts[0];
                    this.account$.next(account);
                    this.metamaskState$.next(MetamaskState.CONNECTED);
                    this.checkNetwork();
                    return account;
                })
            );
    }

    connectWallet() {
        console.log('Opening Web3 Modal...');
        this.loadingService.setLoading(true);
        this.web3Modal.open({ view: 'Connect' }).then(() => {
            console.log('Web3 Modal opened');
        }).catch((error) => {
            console.error('Error opening Web3 Modal:', error);
            this.loadingService.setLoading(false);
        });
    }

    disconnectWallet() {
        console.log('Disconnecting wallet...');
        if (this.ethereum) {
            this.web3Modal.disconnect();
            this.account$.next('');
            this.metamaskState$.next(MetamaskState.NOT_CONNECTED);
        }
    }

    checkNetwork() {
        console.log('Checking network...');
        if (!this.ethereum) {
            this.metamaskState$.next(MetamaskState.NOT_CONNECTED);
            return;
        }
        this.ethereum.request({ method: 'eth_chainId' }).then((chainId: string | undefined) => {
            console.log('eth_chainId response:', chainId);
            if (chainId && BigInt(chainId) === mannaChainId) {
                this.metamaskState$.next(MetamaskState.READY);
            } else {
                this.metamaskState$.next(MetamaskState.WRONG_CHAIN);
            }
        }).catch((error: any) => {
            console.error('Error checking network:', error);
            this.metamaskState$.next(MetamaskState.NOT_CONNECTED);
        });
    }

    switchToMannaChain(): Observable<any> {
        console.log('Switching to Manna chain...');
        this.loadingService.setLoading(true);
        return from(this.ethereum.request({ method: 'eth_chainId' })).pipe(
            switchMap((currentChainId: unknown) => {
                const currentChainIdString = currentChainId as string | undefined;
                console.log('Current chain ID:', currentChainIdString);
                if (currentChainIdString && BigInt(currentChainIdString) === mannaChainId) {
                    this.loadingService.setLoading(false);
                    this.network$.next({ chainId: mannaChainId });
                    this.metamaskState$.next(MetamaskState.READY);
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
                        }),
                        catchError((error) => {
                            console.error('Error switching to Manna chain:', error);
                            this.loadingService.setLoading(false);
                            this.metamaskState$.next(MetamaskState.WRONG_CHAIN);
                            return throwError(error);
                        })
                    );
                }
            }),
            catchError((error) => {
                console.error('Error switching chain:', error);
                this.loadingService.setLoading(false);
                this.metamaskState$.next(MetamaskState.NOT_CONNECTED);
                return throwError(error);
            })
        );
    }

    signMessage(message: string): Observable<string> {
        console.log('Signing message:', message);
        this.loadingService.setLoading(true);

        return from(this.ethereum.request({
            method: 'personal_sign',
            params: [message, this.account$.value],
        }) as Promise<string>).pipe(
            tap(() => {
                console.log('Message signed successfully');
                this.loadingService.setLoading(false);
            }),
            catchError((error) => {
                console.error('Error signing message:', error);
                this.loadingService.setLoading(false);
                return throwError(error);
            })
        );
    }
}
