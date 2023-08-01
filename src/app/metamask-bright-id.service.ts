import {Inject, Injectable, Injector} from '@angular/core';
import {ethers , providers } from 'ethers';
import {BehaviorSubject, catchError, firstValueFrom, from, map, Observable, of, switchMap} from 'rxjs';
import {tap} from 'rxjs/operators';
import {HttpClient} from '@angular/common/http';
import {MannaService} from "./manna.service";
import { UserService} from "./user.service";
import {TuiAlertService, TuiDialogService} from "@taiga-ui/core";
import {chainConfig, mannaChainId, serverUrl} from "./config";
import { userVerificationStatus } from 'brightid_sdk_v6';



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
    public brightIdVerifiedData: any = null;

    constructor(
        private http: HttpClient,
        readonly alertService: TuiAlertService,
        readonly dialogService: TuiDialogService,
        readonly mannaService: MannaService,
        readonly userService: UserService,
        readonly injector: Injector,
    ) {}
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