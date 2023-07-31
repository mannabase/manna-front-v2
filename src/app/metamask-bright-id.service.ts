import {Inject, Injectable, Injector} from '@angular/core';
import {ethers} from 'ethers';
import {BehaviorSubject, firstValueFrom, from, Observable, of, switchMap} from 'rxjs';
import {tap} from 'rxjs/operators';
import {HttpClient} from '@angular/common/http';
import {VerificationDialogComponent} from "./verification-dialog/verification-dialog.component";
import {MannaService} from "./manna.service";
import {UserClaimingState, UserService} from "./user.service";
import {TuiAlertService, TuiDialogService} from "@taiga-ui/core";
import {PolymorpheusComponent} from "@tinkoff/ng-polymorpheus";
import {mannaChainId} from "./config";

declare let ethereum: any;

export enum VerificationStatus {
    NOT_LINKED = "NOT_LINKED",
    NOT_VERIFIED = "NOT_VERIFIED",
    SUCCESSFUL = "SUCCESSFUL",
    TRANSFERRED = "TRANSFERRED",
}

export enum MetamaskState {
    NOT_INSTALLED = "NOT_INSTALLED",
    NOT_CONNECTED = "NOT_CONNECTED",
    WRONG_CHAIN = "WRONG_CHAIN",
    CONNECTED = "CONNECTED",
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
        readonly alertService: TuiAlertService,
        readonly dialogService: TuiDialogService,
        readonly mannaService: MannaService,
        readonly userService: UserService,
        readonly injector: Injector
    ) {
        this.serverUrl = 'https://mannatest.hedgeforhumanity.org/backend/';
        this.mannaService.setServerUrl(this.serverUrl);
    }
    connect(): Observable<string> {
        return from((window as any).ethereum.request({ method: 'eth_requestAccounts' })
            .then((accounts: string[]) => accounts[0])) as Observable<string>;
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

    public checkMetamaskState(): Observable<MetamaskState> {
        return new Observable(subscriber => {
            if (typeof ethereum == 'undefined') {
                subscriber.next(MetamaskState.NOT_INSTALLED);
                return;
            }
            from(ethereum.request({method: 'eth_accounts'}) as Promise<any[]>)
                .subscribe({
                    next: (accounts: any[]) => {
                        if (accounts.length == 0) {
                            subscriber.next(MetamaskState.NOT_CONNECTED);
                            return;
                        }
                        const provider = new ethers.providers.Web3Provider(ethereum);
                        from(provider.getNetwork())
                            .subscribe({
                                next: network => {
                                    if (network.chainId == mannaChainId) {
                                        subscriber.next(MetamaskState.CONNECTED);
                                    } else {
                                        subscriber.next(MetamaskState.WRONG_CHAIN)
                                    }
                                },
                                error: err => {
                                    this.alertService.open("Failed to load web3 network", {
                                        status: "error"
                                    }).subscribe();
                                }
                            })
                    },
                    error: err => {
                        this.alertService.open("Failed to load web3 accounts", {
                            status: "error"
                        }).subscribe();
                    }
                })
        })
    }

    async checkUserState(): Promise<boolean> {
        if (typeof ethereum !== 'undefined') {
            const accounts = await ethereum.request({method: 'eth_accounts'});
            const isConnected = accounts.length > 0;
            if (isConnected) {
                this.userService.userClaimingState$.next(UserClaimingState.METAMASK_CONNECTED);
                await this.loadNetwork();
                if (!this.isCorrectNetwork())
                    await this.switchToMannaChain();

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
            this.alertService.open("Please install metamask extension", {
                label: 'MetaMask is not installed',
                status: "error",
            }).subscribe();
            return false;
        }
    }


    tryClaim() {
        return from(this.checkUserState()).pipe(
            switchMap((isConnected: boolean) => {
                console.log('userClaimingState :', this.userService.userClaimingState$.value)
                if (!isConnected) {
                    return from(ethereum.request({method: 'eth_requestAccounts'})).pipe(
                        tap(() => this.userService.userClaimingState$.next(UserClaimingState.METAMASK_CONNECTED)),
                        switchMap(() => this.checkUserState())
                    );
                } else {
                    return of(true);
                }
            }),
            switchMap((value: any) => {
                console.log('userClaimingState :', this.userService.userClaimingState$.value)
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
                console.log('userClaimingState :', this.userService.userClaimingState$.value)
                if (this.userService.userClaimingState$.value == UserClaimingState.READY) {
                    return this.mannaService.claim()
                } else {
                    throw new Error("Failed to claim");
                }
            })
        )
    }


    openVerifyDialog(walletAddress: string) {
        return this.dialogService.open<number>(
            new PolymorpheusComponent(VerificationDialogComponent, this.injector),
            {
                data: 237,
                dismissible: false,
                label: 'Verify',
            },
        );
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
                    this.alertService.open("The verification process failed", {
                        label: 'You are not Verified',
                        status: "error",
                    }).subscribe();
                }
            });
    }

    switchToMannaChain(): Observable<any> {
        return from(ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
                {
                    chainId: '0xa4b1',
                    chainName: 'Arbitrum',
                    nativeCurrency: {
                        name: 'Ethereum',
                        symbol: 'ETH',
                        decimals: 18,
                    },
                    rpcUrls: ["https://arb1.arbitrum.io/rpc"],
                    blockExplorerUrls: ["https://arbiscan.io/"],
                },
            ],
        }));
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
