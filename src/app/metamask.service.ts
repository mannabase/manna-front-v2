<<<<<<< HEAD:src/app/methods.service.ts
import { Injectable } from '@angular/core';
import { ethers } from 'ethers';
import { BehaviorSubject } from 'rxjs';
import { first } from 'rxjs/operators';
=======
import {Injectable} from '@angular/core';
import {ethers} from 'ethers';
import {BehaviorSubject} from 'rxjs';
>>>>>>> 7b1d482cfb76d7767c8951dd012f7774a154ae07:src/app/metamask.service.ts

declare let ethereum: any;

@Injectable({
  providedIn: 'root'
})
export class MetamaskService {
  isConnected$ = new BehaviorSubject<boolean>(false);
  isCorrectChain$ = new BehaviorSubject<boolean>(false);
  account$ = new BehaviorSubject<string | null>(null);
  balance: string | null = null;

  async checkMetamaskStatus(): Promise<void> {
    if (typeof ethereum !== 'undefined') {
      try {
        const accounts = await ethereum.request({method: 'eth_accounts'});
        const isConnected = accounts.length > 0;
        this.isConnected$.next(isConnected);
        if (isConnected) {
          await this.checkChain();
          this.getAccountAndBalance();
        }
      } catch (error) {
        console.error('Error checking MetaMask status:', error);
      }
    } else {
      console.error('MetaMask is not installed');
    }
  }

  async checkChain(): Promise<void> {
    const provider = new ethers.providers.Web3Provider(ethereum);
    const network = await provider.getNetwork();
    this.isCorrectChain$.next(network.chainId === 0x4a);
  }

  async tryClaim(): Promise<void> {
    if (this.isConnected$.value) {
      if (!this.isCorrectChain$.value) {
        await this.switchToIDChain();
      } else {
        this.claim();
      }
    } else {
      await this.connect();
    }
  }

  async connect(): Promise<void> {
    try {
      await ethereum.enable();
      this.isConnected$.next(true);
      await this.checkChain();
      this.getAccountAndBalance();
    } catch (error) {
      console.error('Error connecting to MetaMask:', error);
    }
  }

  async switchToIDChain(): Promise<void> {
    try {
      await ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: '0x4a',
            chainName: 'IDChain',
            rpcUrls: ['https://idchain.one/rpc/'],
            nativeCurrency: {
              name: 'Eidi',
              symbol: 'EIDI',
              decimals: 18,
            },
            blockExplorerUrls: ['https://explorer.idchain.one/'],
          },
        ],
      });
    } catch (error: any) {
      if (error.code === 4001) {
        console.warn('User rejected chain switch');
      } else {
        console.error('Error switching chain:', error);
      }
    }
  }

  async getAccountAndBalance(): Promise<void> {
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
  
    try {
      const address = this.account$.getValue(); // Use getValue() to get the current value
      if (address !== null) {
        this.account$.next(await signer.getAddress());
        const balance = await provider.getBalance(address);
        this.balance = ethers.utils.formatEther(balance);
      }
    } catch (error) {
      console.error('Error getting account and balance:', error);
    }
  }
  claim(): void {
    console.log('Claim button clicked');
  }
}
