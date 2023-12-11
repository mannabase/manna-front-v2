import {Injectable, Injector} from '@angular/core'
import {ethers} from 'ethers'
import {BehaviorSubject, catchError, from, map, Observable, of, tap} from 'rxjs'
import {TuiAlertService, TuiDialogService} from '@taiga-ui/core'
import {chainConfig, mannaChainId} from './config'

declare let ethereum: any

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
    network$ = new BehaviorSubject<ethers.Network | null>(null)
    account$ = new BehaviorSubject<string>('')
    balance$ = new BehaviorSubject<bigint | null>(null)
    qrcodeValue: string = ''
    public brightIdVerifiedData: any = null

    constructor(
        private readonly alertService: TuiAlertService,
        private readonly dialogService: TuiDialogService,
        private readonly injector: Injector,
    ) {
    }

    connect(): Observable<string> {
        return from((window as any).ethereum.request({method: 'eth_requestAccounts'})).pipe(
            map((accounts: any) => accounts[0]),
        )
    }

    checkMetamaskState(): Observable<MetamaskState> {
        return new Observable((subscriber) => {
            if (typeof ethereum == 'undefined') {
                subscriber.next(MetamaskState.NOT_INSTALLED)
                return
            }
            from(ethereum.request({method: 'eth_accounts'}) as Promise<any[]>).subscribe({
                next: (account: any[]) => {
                    if (account.length == 0) {
                        subscriber.next(MetamaskState.NOT_CONNECTED)
                        return
                    }
                    this.account$.next(account[0])
                    subscriber.next(MetamaskState.CONNECTED)
                    const provider = new ethers.BrowserProvider(ethereum)
                    from(provider.getNetwork()).subscribe({
                        next: (network) => {
                            if (network.chainId == mannaChainId) {
                                subscriber.next(MetamaskState.READY)
                            } else {
                                subscriber.next(MetamaskState.WRONG_CHAIN)
                            }
                        },
                        error: (err) => {
                            this.alertService.open('Failed to load web3 network', {
                                status: 'error',
                            })
                        },
                    })
                },
                error: (err) => {
                    this.alertService.open('Failed to load web3 accounts', {
                        status: 'error',
                    })
                },
            })
        })
    }


    switchToMannaChain(): Observable<any> {
        return from(ethereum.request(chainConfig))
    }

    async loadBalance() {
        if (this.account$.value) {
            const provider = new ethers.BrowserProvider(ethereum)
            this.balance$.next(0n)
        } else {
            this.balance$.next(null)
        }
    }

    signMessage(message: string): Observable<string> {
        return from((window as any).ethereum.request({
            method: 'personal_sign',
            params: [message, this.account$.value],
        }) as Promise<string>)
    }
}
