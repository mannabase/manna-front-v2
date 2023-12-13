// import {Injectable} from '@angular/core'
// import {BehaviorSubject, from, Observable, of} from 'rxjs'
// import {catchError, map, switchMap, tap} from 'rxjs/operators'
// import {ethers} from 'ethers'
// import {ClaimManna, Manna, MannaBrightID} from './ABI'
// import {claimMannaContractAddress, mannaBrightIDContractAddress, mannaContractAddress} from "./config"


// declare let ethereum: any

// @Injectable({
//     providedIn: 'root',
// })
// export class ContractService {
//     private provider: ethers.JsonRpcProvider
//     private signer: Promise<ethers.JsonRpcSigner>
//     private mannaBrightIDContract: ethers.Contract
//     private claimMannaContract: ethers.Contract
//     private mannaContract: ethers.Contract
//     verifyMeLoading: boolean = false
//     registerMeLoading: boolean = false


//     private contractDataSubject = new BehaviorSubject<{
//         isVerified: boolean | null,
//         isRegistered: boolean | null,
//         toClaim: bigint,
//         balance: bigint
//     }>({
//         isVerified: null,
//         isRegistered: null,
//         toClaim: 0n,
//         balance: 0n,
//     })

//     contractData$ = this.contractDataSubject.asObservable()

//     constructor(
//         private metamaskBrightIdService: MetamaskBrightIdService,
//     ) {
//         this.provider = new ethers.JsonRpcProvider(ethereum)
//         this.signer = this.provider.getSigner()

//         this.mannaBrightIDContract = new ethers.Contract(mannaBrightIDContractAddress, MannaBrightID, this.signer)
//         this.claimMannaContract = new ethers.Contract(claimMannaContractAddress, ClaimManna, this.signer)
//         this.mannaContract = new ethers.Contract(mannaContractAddress, Manna, this.signer)
//     }

//     get contractData() {
//         return this.contractDataSubject.getValue()
//     }

//     setContractIsVerified(isVerified: boolean) {
//         const data = {...this.contractData, isVerified}
//         this.contractDataSubject.next(data)
//     }

//     setContractIsRegistered(isRegistered: boolean) {
//         const data = {...this.contractData, isRegistered}
//         this.contractDataSubject.next(data)
//     }

//     setContractToClaim(toClaim: bigint) {
//         const data = {...this.contractData, toClaim}
//         this.contractDataSubject.next(data)
//     }

//     setContractBalance(balance: bigint) {
//         const data = {...this.contractData, balance}
//         this.contractDataSubject.next(data)
//     }

//     claimManna(): void {
//         const toClaim = this.contractData.toClaim

//         if (toClaim != 0n) {
//             from(this.claimMannaContract['claim']())
//                 .pipe(
//                     // switchMap((res: any) => from((res as ethers.ContractTransaction).wait())),
//                     tap(() => {
//                         this.loadInfo()
//                         this.setContractToClaim(0n)
//                     }),
//                     catchError((err: unknown) => {
//                         console.error((err as Error).message)
//                         return of(null)
//                     }),
//                 )
//                 .subscribe()
//         }
//     }

//     async isVerified(): Promise<boolean> {
//         return true
//     }

//     verifyMe(): Observable<void | null> {
//         if (!this.verifyMeLoading) {
//             this.verifyMeLoading = true

//             return this.metamaskBrightIdService.checkBrightIdState().pipe(
//                 switchMap((verificationStatus: BrightIdState) => {
//                     if (verificationStatus === BrightIdState.VERIFIED && this.metamaskBrightIdService.brightIdVerifiedData) {
//                         const userAddress = this.getAddress()

//                         return from(
//                             this.mannaBrightIDContract['verify'](
//                                 [userAddress],
//                                 this.metamaskBrightIdService.brightIdVerifiedData.timestamp,
//                                 this.metamaskBrightIdService.brightIdVerifiedData.sig.v,
//                                 `0x${this.metamaskBrightIdService.brightIdVerifiedData.sig.r}`,
//                                 `0x${this.metamaskBrightIdService.brightIdVerifiedData.sig.s}`,
//                             ),
//                         ).pipe(
//                             switchMap((transactionResponse: any) =>
//                                 from((transactionResponse as providers.TransactionResponse).wait()),
//                             ),

//                             map(() => null),
//                             tap(() => {
//                                 this.verifyMeLoading = false
//                                 this.metamaskBrightIdService.loadBalance()
//                             }),
//                         )
//                     } else {
//                         this.verifyMeLoading = false
//                         return of(null)
//                     }
//                 }),
//                 catchError((err: any) => {
//                     console.error(err.message)
//                     this.verifyMeLoading = false
//                     return of(null)
//                 }),
//             )
//         }
//         return of(null)
//     }

//     registerMe(): void {
//         if (!this.registerMeLoading) {
//             this.registerMeLoading = true

//             from(this.claimMannaContract['register']())
//                 .pipe(
//                     // switchMap((transaction: any) => from((transaction as ethers.ContractTransaction).wait())),
//                     tap(() => {
//                         this.registerMeLoading = false
//                         this.loadInfo()
//                     }),
//                     catchError((err: any) => {
//                         this.registerMeLoading = false
//                         console.error(err.message)
//                         return of(null)
//                     }),
//                 )
//                 .subscribe()
//         }
//     }

//     loadInfo(): void {
//         from(this.mannaContract['balanceOf'](this.getAddress()) as Promise<bigint>)
//             .pipe(
//                 tap((balance: bigint) => {
//                     this.setContractBalance(balance)
//                 }),
//                 catchError((err: unknown) => {
//                     console.error((err as Error).message)
//                     return of(null)
//                 }),
//             ).subscribe()

//         from(this.claimMannaContract['isVerified'](this.getAddress()) as Promise<boolean>)
//             .pipe(
//                 tap((isVerified: boolean) => {
//                     this.setContractIsVerified(isVerified)

//                     if (isVerified) {
//                         from(this.claimMannaContract['isRegistered'](this.getAddress()) as Promise<boolean>)
//                             .pipe(
//                                 tap((isRegistered: boolean) => {
//                                     this.setContractIsRegistered(isRegistered)
//                                 }),
//                                 catchError((err: unknown) => {
//                                     console.error((err as Error).message)
//                                     return of(null)
//                                 }),
//                             ).subscribe()

//                         from(this.claimMannaContract['toClaim'](this.getAddress()) as Promise<bigint>)
//                             .pipe(
//                                 tap((toClaim: bigint) => {
//                                     this.setContractToClaim(toClaim)
//                                 }),
//                                 catchError((err: unknown) => {
//                                     console.error((err as Error).message)
//                                     return of(null)
//                                 }),
//                             ).subscribe()
//                     }
//                 }),
//                 catchError((err: unknown) => {
//                     console.error((err as Error).message)
//                     return of(null)
//                 }),
//             ).subscribe()
//     }


//     getAddress() {
//         return this.signer.getAddress()
//     }
// }
import { Injectable } from '@angular/core';
import { ethers, JsonRpcProvider, BigNumberish, Fragment, JsonFragment } from 'ethers';
import { chainConfig, mannaContractAddress, mannaContractABI, claimMannaContractAddress, claimMannaContractABI } from './config';
import { MetamaskBrightIdService } from './metamask-bright-id.service'; 

@Injectable({
  providedIn: 'root',
})
export class ContractService {
  private provider: JsonRpcProvider;
  private mannaContract: ethers.Contract;
  private claimMannaContract: ethers.Contract;

  constructor(private metamaskService: MetamaskBrightIdService) {
    this.provider = new ethers.JsonRpcProvider(chainConfig.params[0].rpcUrls[0]);
    this.mannaContract = new ethers.Contract(
      mannaContractAddress,
      mannaContractABI as Array<string | Fragment | JsonFragment>,
      this.provider
    );

    this.claimMannaContract = new ethers.Contract(
      claimMannaContractAddress,
      claimMannaContractABI as Array<string | Fragment | JsonFragment>,
      this.provider
    );
    this.initializeContracts();
  }
  private async initializeContracts(): Promise<void> {
    this.metamaskService.account$.subscribe(async (walletAddress) => {
        if (walletAddress) {
            const signer = await this.provider.getSigner(walletAddress);
            this.mannaContract = new ethers.Contract(
                mannaContractAddress,
                mannaContractABI,
                signer 
            );

            this.claimMannaContract = new ethers.Contract(
                claimMannaContractAddress,
                claimMannaContractABI,
                signer 
            );
        }
    });
}

  async balanceOf(walletAddress: string): Promise<string> {
    try {
      const balance = await this.mannaContract['balanceOf'](walletAddress);
      return ethers.formatEther(balance); 
    } catch (error) {
      console.error('Error fetching balance:', error);
      throw error;
    }
  }
  async getUserScore(userAddress: string): Promise<number> {
    try {
      const userScores = await this.claimMannaContract['userScores'](userAddress);
      return parseInt(userScores.toString());
    } catch (error) {
      console.error('Error fetching user score:', error);
      throw error;
    }
  }
  async getScoreThreshold(): Promise<number> {
    try {
      const threshold = await this.claimMannaContract['scoreThreshold']();
      return parseInt(threshold.toString());
    } catch (error) {
      console.error('Error fetching score threshold:', error);
      throw error;
    }
  }

  async claimManna(): Promise<void> {
    try {
      const claimTx = await this.claimMannaContract['claim']();
      await claimTx.wait();
      console.log('Claim successful');
    } catch (error) {
      console.error('Error claiming Manna:', error);
      throw error;
    }
  }

  async submitScore(score: number, userAddress: string): Promise<void> {
    try {
      const submitScoreTx = await this.claimMannaContract['submitScore'](score, userAddress);
      await submitScoreTx.wait();
      console.log('Score submitted successfully');
    } catch (error) {
      console.error('Error submitting score:', error);
      throw error;
    }
  }
}