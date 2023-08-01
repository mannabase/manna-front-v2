import { Injectable } from '@angular/core';
import { BehaviorSubject, from, Observable, of } from 'rxjs';
import { catchError, switchMap, tap , map } from 'rxjs/operators';
import { ethers, providers } from 'ethers';
import { MannaBrightID, ClaimManna, Manna } from './ABI';
import { MetamaskBrightIdService,BrightIdState} from './metamask-bright-id.service';
import {mannaBrightIDContractAddress, claimMannaContractAddress, mannaContractAddress} from "./config";



declare let ethereum: any;
@Injectable({
    providedIn: 'root',
  })
export class ContractService {
    private provider: ethers.providers.Web3Provider;
    private signer: ethers.providers.JsonRpcSigner;
    private mannaBrightIDContract: ethers.Contract;
    private claimMannaContract: ethers.Contract;
    private mannaContract: ethers.Contract;
    verifyMeLoading: boolean = false;
    registerMeLoading: boolean = false;


    private contractDataSubject = new BehaviorSubject<{
        isVerified: boolean | null,
        isRegistered: boolean | null,
        toClaim: ethers.BigNumber,
        balance: ethers.BigNumber
    }>({
        isVerified: null,
        isRegistered: null,
        toClaim: ethers.BigNumber.from(0),
        balance: ethers.BigNumber.from(0),
    });

    contractData$ = this.contractDataSubject.asObservable();

    constructor(
        private metamaskBrightIdService: MetamaskBrightIdService,
    ) {
        this.provider = new ethers.providers.Web3Provider(ethereum);
        this.signer = this.provider.getSigner();

        this.mannaBrightIDContract = new ethers.Contract(mannaBrightIDContractAddress, MannaBrightID, this.signer);
        this.claimMannaContract = new ethers.Contract(claimMannaContractAddress, ClaimManna, this.signer);
        this.mannaContract = new ethers.Contract(mannaContractAddress, Manna, this.signer);
    }

    get contractData() {
        return this.contractDataSubject.getValue();
    }

    setContractIsVerified(isVerified: boolean) {
        const data = { ...this.contractData, isVerified };
        this.contractDataSubject.next(data);
    }

    setContractIsRegistered(isRegistered: boolean) {
        const data = { ...this.contractData, isRegistered };
        this.contractDataSubject.next(data);
    }

    setContractToClaim(toClaim: ethers.BigNumber) {
        const data = { ...this.contractData, toClaim };
        this.contractDataSubject.next(data);
    }
    setContractBalance(balance: ethers.BigNumber) {
        const data = { ...this.contractData, balance };
        this.contractDataSubject.next(data);
    }

    claimManna(): void {
        const toClaim = ethers.BigNumber.from(this.contractData.toClaim);

        if (!toClaim.isZero()) {
            from(this.claimMannaContract['claim']())
                .pipe(
                    switchMap((res: any) => from((res as ethers.ContractTransaction).wait())),
                    tap(() => {
                        this.loadInfo();
                        this.setContractToClaim(ethers.BigNumber.from(0));
                    }),
                    catchError((err: unknown) => {
                        console.error((err as Error).message);
                        return of(null);
                    })
                )
                .subscribe();
        }
    }
    verifyMe(): Observable<void | null> {
        if (!this.verifyMeLoading) {
            this.verifyMeLoading = true;

            return this.metamaskBrightIdService.checkBrightIdState().pipe(
                switchMap((verificationStatus: BrightIdState) => {
                    if (verificationStatus === BrightIdState.VERIFIED && this.metamaskBrightIdService.brightIdVerifiedData) {
                        const userAddress = this.getAddress();

                        return from(
                            this.mannaBrightIDContract['verify'](
                                [userAddress],
                                this.metamaskBrightIdService.brightIdVerifiedData.timestamp,
                                this.metamaskBrightIdService.brightIdVerifiedData.sig.v,
                                `0x${this.metamaskBrightIdService.brightIdVerifiedData.sig.r}`,
                                `0x${this.metamaskBrightIdService.brightIdVerifiedData.sig.s}`
                            )
                        ).pipe(
                            switchMap((transactionResponse: any) =>
                                from((transactionResponse as providers.TransactionResponse).wait())
                            ),

                            map(() => null),
                            tap(() => {
                                this.verifyMeLoading = false;
                                this.metamaskBrightIdService.loadBalance();
                            }),
                        );
                    } else {
                        this.verifyMeLoading = false;
                        return of(null);
                    }
                }),
                catchError((err: any) => {
                    console.error(err.message);
                    this.verifyMeLoading = false;
                    return of(null);
                })
            );
        }
        return of(null);
    }
    registerMe(): void {
        if (!this.registerMeLoading) {
            this.registerMeLoading = true;

            from(this.claimMannaContract['register']())
                .pipe(
                    switchMap((transaction: any) => from((transaction as ethers.ContractTransaction).wait())),
                    tap(() => {
                        this.registerMeLoading = false;
                        this.loadInfo();
                    }),
                    catchError((err: any) => {
                        this.registerMeLoading = false;
                        console.error(err.message);
                        return of(null);
                    })
                )
                .subscribe();
        }
    }

    loadInfo(): void {
        from(this.mannaContract['balanceOf'](this.getAddress()) as Promise<ethers.BigNumber>)
            .pipe(
                tap((balance: ethers.BigNumber) => {
                    this.setContractBalance(balance);
                }),
                catchError((err: unknown) => {
                    console.error((err as Error).message);
                    return of(null);
                })
            ).subscribe();

        from(this.claimMannaContract['isVerified'](this.getAddress()) as Promise<boolean>)
            .pipe(
                tap((isVerified: boolean) => {
                    this.setContractIsVerified(isVerified);

                    if (isVerified) {
                        from(this.claimMannaContract['isRegistered'](this.getAddress()) as Promise<boolean>)
                            .pipe(
                                tap((isRegistered: boolean) => {
                                    this.setContractIsRegistered(isRegistered);
                                }),
                                catchError((err: unknown) => {
                                    console.error((err as Error).message);
                                    return of(null);
                                })
                            ).subscribe();

                        from(this.claimMannaContract['toClaim'](this.getAddress()) as Promise<ethers.BigNumber>)
                            .pipe(
                                tap((toClaim: ethers.BigNumber) => {
                                    this.setContractToClaim(toClaim);
                                }),
                                catchError((err: unknown) => {
                                    console.error((err as Error).message);
                                    return of(null);
                                })
                            ).subscribe();
                    }
                }),
                catchError((err: unknown) => {
                    console.error((err as Error).message);
                    return of(null);
                })
            ).subscribe();
    }




    getAddress() {
        return this.signer.getAddress();
      }
}
