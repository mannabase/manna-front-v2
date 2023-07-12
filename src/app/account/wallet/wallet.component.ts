import { Component } from '@angular/core';
import { ethers } from 'ethers';

declare let ethereum: any;

@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.component.html',
  styleUrls: ['./wallet.component.scss']

})
export class WalletComponent {
  isConnected = false;
  isCorrectChain = false;
  account: string | null = null;
  balance: string | null = null;

  async handleButtonClick(): Promise<void> {
    if (this.isConnected) {
      if (!this.isCorrectChain) {
        await this.switchToIDChain();
      } else {
        this.claim();
      }
    } else {
      await this.connect();
    }
  }

  async connect(): Promise<void> {
    if (typeof ethereum !== 'undefined') {
      try {
        await ethereum.enable();
        this.isConnected = true;
        await this.checkChain();
        this.getAccountAndBalance();
      } catch (error) {
        console.error('Error connecting to MetaMask:', error);
      }
    } else {
      console.error('MetaMask is not installed');
    }
  }

  async checkChain(): Promise<void> {
    const provider = new ethers.providers.Web3Provider(ethereum);
    const network = await provider.getNetwork();
    this.isCorrectChain = network.chainId === 0x4a; 
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
    } catch (error:any) {
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
    this.account = await signer.getAddress();
    const balance = await provider.getBalance(this.account);
    this.balance = ethers.utils.formatEther(balance);
  }

  claim(): void {
    console.log('Claim button clicked');
  }
}
