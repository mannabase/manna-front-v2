import {Inject, Injectable, Injector} from '@angular/core';
import {ethers , providers } from 'ethers';
import {BehaviorSubject, catchError, firstValueFrom, from, map, Observable, of, switchMap} from 'rxjs';
import {tap} from 'rxjs/operators';
import {HttpClient} from '@angular/common/http';
import {MannaService} from "./manna.service";
import { UserService} from "./user.service";
import {TuiAlertService, TuiDialogService} from "@taiga-ui/core";
import {PolymorpheusComponent} from "@tinkoff/ng-polymorpheus";
import {chainConfig, mannaChainId, serverUrl} from "./config";
import { userVerificationStatus } from 'brightid_sdk_v6';
import { MannaBrightID,ClaimManna,Manna } from './ABI';



declare let ethereum: any;

declare global {
    interface Window { ethereum: any; }
  }

export enum MetamaskState {
    NOT_INSTALLED = "NOT_INSTALLED",
    NOT_CONNECTED = "NOT_CONNECTED",
    CONNECTED = "CONNECTED",
    WRONG_CHAIN = "WRONG_CHAIN",
    READY = "READY",
}
export enum brightIdState {
    NOT_VERIFIED = "NOT_VERIFIED",
    VERIFIED = "VERIFIED",
    UNIQUE_VERIFIED = "UNIQUE_VERIFIED",
}

@Injectable({
    providedIn: 'root'
})
export class MetamaskBrightIdService {
    network$ = new BehaviorSubject<ethers.providers.Network | null>(null);
    account$ = new BehaviorSubject<string>('');
    balance$ = new BehaviorSubject<ethers.BigNumber | null>(null);
    qrcodeValue: string = '';
    private provider: ethers.providers.Web3Provider;
    private signer: ethers.providers.JsonRpcSigner;
    private mannaBrightIDContract: ethers.Contract;
    private verifyMeLoading: boolean = false;
    private brightIdVerifiedData: any = null;

    constructor(
        private http: HttpClient,
        readonly alertService: TuiAlertService,
        readonly dialogService: TuiDialogService,
        readonly mannaService: MannaService,
        readonly userService: UserService,
        readonly injector: Injector,
    ) {
        this.provider = new ethers.providers.Web3Provider(ethereum);
        this.signer = this.provider.getSigner();
        const mannaBrightIDContractAddress = '0x3AF27879b3627654a96Ed6DeDB6003Cc90272877';
        this.mannaBrightIDContract = new ethers.Contract(mannaBrightIDContractAddress, MannaBrightID, this.signer);
    }
    connect(): Observable<string> {
        return from((window as any).ethereum.request({method: 'eth_requestAccounts'}))
            .pipe(
                map((accounts: any) => accounts[0])
            );
    }
    public checkMetamaskState(): Observable<MetamaskState> {
        return new Observable(subscriber => {
            if (typeof ethereum == 'undefined') {
                subscriber.next(MetamaskState.NOT_INSTALLED);
                return;
            }
            from(ethereum.request({method: 'eth_accounts'}) as Promise<any[]>)
                .subscribe({
                    next: (account: any[]) => {
                        if (account.length == 0) {
                            subscriber.next(MetamaskState.NOT_CONNECTED);
                            return;
                        }
                        this.account$.next(account[0]);
                        subscriber.next(MetamaskState.CONNECTED);
                        const provider = new ethers.providers.Web3Provider(ethereum);
                        from(provider.getNetwork())
                            .subscribe({
                                next: network => {
                                    if (network.chainId == mannaChainId) {
                                        subscriber.next(MetamaskState.READY);
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
    public checkBrightIdState(): Observable<brightIdState> {
        return from(userVerificationStatus("Manna", `${this.account$.value}`, {
            signed: "eth",
            timestamp: "milliseconds"
        })).pipe(
            tap((data: any) => {
                if (data.verified) {
                    this.brightIdVerifiedData = data;
                }
            }),
            map((data: any) => {
                if (data.verified && data.unique) {
                    return brightIdState.UNIQUE_VERIFIED;
                } else if (data.verified) {
                    return brightIdState.VERIFIED;
                } else {
                    return brightIdState.NOT_VERIFIED;
                }
            }),
            catchError((error: any) => {
                    this.qrcodeValue = `brightid://link-verification/Manna/${this.account$.value}`;
                    this.alertService.open("User not found. Please verify using the QR code.", {
                        status: "error"
                    }).subscribe();
                return of(brightIdState.NOT_VERIFIED);
            })
        );
    }
    
    verifyMe(): Observable<void | null> {
        if (!this.verifyMeLoading) {
            this.verifyMeLoading = true;
    
            return this.checkBrightIdState().pipe(
                switchMap(verificationStatus => {
                    if (verificationStatus === brightIdState.VERIFIED && this.brightIdVerifiedData) {
                        const userAddress = this.account$.value;
    
                        return from(
                            this.mannaBrightIDContract['verify'](
                                [userAddress],
                                this.brightIdVerifiedData.timestamp,
                                this.brightIdVerifiedData.sig.v,
                                `0x${this.brightIdVerifiedData.sig.r}`,
                                `0x${this.brightIdVerifiedData.sig.s}`
                            )
                        ).pipe(
                            map((response: any) => response as providers.TransactionResponse),
                            switchMap((transactionResponse: providers.TransactionResponse) =>
                                from(transactionResponse.wait()).pipe(
                                    map(() => null),
                                )
                            ),
                            tap(() => {
                                this.verifyMeLoading = false;
                                this.loadBalance();
                            }),
                        );
                    } else {
                        this.verifyMeLoading = false;
                        return of(null);
                    }
                }),
                catchError(err => {
                    console.error(err.message);
                    this.verifyMeLoading = false;
                    return of(null);
                })
            );
        }
        return of(null);
    }
    
    
    
    
    
    
    

    switchToMannaChain(): Observable<any> {
        return from(ethereum.request(chainConfig));
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