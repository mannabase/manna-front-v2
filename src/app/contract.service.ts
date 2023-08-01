import { Injectable } from '@angular/core';
import { BehaviorSubject, from, Observable, of } from 'rxjs';
import { catchError, switchMap, tap , map } from 'rxjs/operators';
import { ethers, providers } from 'ethers';
import { MannaBrightID, ClaimManna, Manna } from './ABI';
import { MetamaskBrightIdService,brightIdState} from './metamask-bright-id.service';
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
    }>({
        isVerified: null,
        isRegistered: null,
        toClaim: ethers.BigNumber.from(0),
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

    claimManna(): void {
        const toClaim = ethers.BigNumber.from(this.contractData.toClaim);
    
        if (!toClaim.isZero()) {
            this.claimMannaContract['claim']()
                .then((res: ethers.ContractTransaction) => {
                    return res.wait();
                })
                .then(() => {
                    this.loadInfo();
                    this.setContractToClaim(ethers.BigNumber.from(0));
                })
                .catch((err: unknown) => {
                    console.error((err as Error).message);
                });
        }
    }
    verifyMe(): Observable<void | null> {
        if (!this.verifyMeLoading) {
            this.verifyMeLoading = true;
    
            return this.metamaskBrightIdService.checkBrightIdState().pipe(
                switchMap((verificationStatus: brightIdState) => {
                    if (verificationStatus === brightIdState.VERIFIED && this.metamaskBrightIdService.brightIdVerifiedData) {
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
            
            this.claimMannaContract['register']
                .then((transaction:any) => {
                    transaction.wait()
                        .then(() => {
                            this.registerMeLoading = false;
                            this.loadInfo();
                        })
                        .catch((err:any) => {
                            this.registerMeLoading = false;
                            console.error(err.message);
                        });
                })
                .catch((err:any) => {
                    this.registerMeLoading = false;
                    console.error(err.message);
                });
        }
    }
    loadInfo(): void {
        this.mannaContract['balanceOf'](this.getAddress()).then((balance: ethers.BigNumber) => {
            // Set the balance in your state here
        });
    
        this.claimMannaContract['isVerified'](this.getAddress()).then((isVerified: boolean ) => {
            if (isVerified) {
                this.setContractIsVerified(true);
    
                this.claimMannaContract['isRegistered'](this.getAddress()).then((isRegistered: boolean) => {
                    this.setContractIsRegistered(isRegistered);
                });
    
                this.claimMannaContract['toClaim'](this.getAddress()).then((result: ethers.BigNumber) => {
                    this.setContractToClaim(result);
                });
    
            } else {
                this.setContractIsVerified(false);
            }
        });
    }
    getAddress() {
        return this.signer.getAddress();
      }
}
