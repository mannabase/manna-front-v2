import { Injectable } from '@angular/core';
import { BehaviorSubject, from, Observable, of, switchMap } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { MetamaskService } from './metamask.service';
import Web3 from 'web3';
import { claimMannaContractABI, claimMannaContractAddress, mannaContractABI, mannaContractAddress } from './config';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Signature, UserScore } from './types';
import { createWeb3Modal, defaultConfig } from '@web3modal/ethers';


const projectId = '83f8bb3871bd791900a7248b8abdcb21';

    // 2. Set chains
    const mainnet = {
      chainId: 1,
      name: 'Ethereum',
      currency: 'ETH',
      explorerUrl: 'https://etherscan.io',
      rpcUrl: 'https://cloudflare-eth.com',
    };

    // 3. Create your application's metadata object
    const metadata = {
      name: 'My Website',
      description: 'My Website description',
      url: 'https://mywebsite.com', // url must match your domain & subdomain
      icons: ['https://avatars.mywebsite.com/'],
    };

    // 4. Create Ethers config
    const ethersConfig = defaultConfig({
      /*Required*/
      metadata,

      /*Optional*/
      enableEIP6963: true, // true by default
      enableInjected: true, // true by default
      enableCoinbase: true, // true by default
      rpcUrl: '...', // used for the Coinbase SDK
      defaultChainId: 1, // used for the Coinbase SDK
    });
const modal = createWeb3Modal({
  ethersConfig,
  chains: [mainnet],
  projectId,
  enableAnalytics: true, // Optional - defaults to your Cloud configuration
  enableOnramp: true, // Optional - false as default
});

@Injectable({
  providedIn: 'root',
})
export class ContractService {
  private web3Modal = modal;
  private web3?: Web3;
  private mannaContract?: any;
  private claimMannaContract?: any;
  private initializing: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(private metamaskService: MetamaskService) {
    this.metamaskService.account$.pipe(
      takeUntilDestroyed(),
      switchMap(walletAddress => {
        this.initializing.next(true);
        if (walletAddress == null) return of(null);
        return from(this.initializeProvider());
      }),
    ).subscribe((web3Provider) => {
      if (web3Provider == null) return;
      this.web3 = web3Provider;
      this.mannaContract = new this.web3.eth.Contract(mannaContractABI, mannaContractAddress);
      this.claimMannaContract = new this.web3.eth.Contract(claimMannaContractABI, claimMannaContractAddress);
      this.initializing.next(false);
    });
  }

  private async initializeProvider(): Promise<Web3 | null> {
    try {
      await this.web3Modal.open();
      const provider = this.web3Modal.getWalletProvider();
      if (!provider) {
        throw new Error('No provider found');
      }
      return new Web3(provider);
    } catch (error) {
      console.error('Failed to connect to provider', error);
      return null;
    }
  }

  balanceOf(walletAddress: string): Observable<string> {
    if (!this.initializing.value) {
      return from(this.mannaContract.methods.balanceOf(walletAddress).call()).pipe(
        map((balance: string) => {
          const formattedBalance = this.web3!.utils.fromWei(balance, 'ether');
          return (parseFloat(formattedBalance) / 1000000).toString();
        })
      );
    } else {
      return this.initializing.pipe(
        filter(value => !value),
        switchMap(() => {
          return from(this.mannaContract.methods.balanceOf(walletAddress).call()).pipe(
            map((balance: string) => {
              const formattedBalance = this.web3!.utils.fromWei(balance, 'ether');
              return (parseFloat(formattedBalance) / 1000000).toString();
            })
          );
        }),
      );
    }
  }

  getUserScore(userAddress: string): Observable<UserScore | undefined> {
    return from(this.claimMannaContract.methods.userScores(userAddress).call().then((response: any) => {
      const timestamp = parseInt(response[0], 10);
      if (timestamp == 0) return undefined;
      const score = parseInt(response[1], 10);
      return { timestamp, score };
    }));
  }

  getScoreThreshold(): Observable<number> {
    if (!this.initializing.value) {
      return from(this.claimMannaContract.methods.scoreThreshold().call()).pipe(
        map((threshold: string) => parseInt(threshold, 10) / 1000000)
      );
    } else {
      return this.initializing.pipe(
        filter(value => !value),
        switchMap(() => {
          return from(this.claimMannaContract.methods.scoreThreshold().call()).pipe(
            map((threshold: string) => parseInt(threshold, 10) / 1000000)
          );
        }),
      );
    }
  }

  submitUserScore(address: string, scoreData: any): Observable<void> {
    console.log('Submitting user score data:', scoreData);
    return from(this.claimMannaContract.methods.submitScore(
      scoreData.score,
      [
        scoreData.timestamp,
        scoreData.signature.v,
        scoreData.signature.r,
        scoreData.signature.s,
      ],
    ).send({ from: address }).then((tx: any) => tx));
  }

  claimWithSigsContract(signatures: Signature[]): Observable<void> {
    return from(this.claimMannaContract.methods.claimWithSigs(signatures).send().then((tx: any) => tx));
  }
}
