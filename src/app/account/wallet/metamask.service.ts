import { Injectable } from '@angular/core';
import { ethers } from 'ethers';
import detectEthereumProvider from '@metamask/detect-provider';

@Injectable({
  providedIn: 'root'
})
export class MetamaskService {
  provider: ethers.providers.Web3Provider | undefined;
  signer: ethers.Signer | undefined;

  constructor() { }

  async connect(): Promise<void> {
    try {
      const provider = await detectEthereumProvider();
      if (provider) {
        this.provider = new ethers.providers.Web3Provider(provider);
        this.signer = this.provider.getSigner();
      } else {
        throw new Error('Please install MetaMask');
      }
    } catch (error) {
      console.error('Error connecting to MetaMask:', error);
      throw error;
    }
  }

  async getCurrentChainId(): Promise<number | undefined> {
    try {
      if (this.provider) {
        const chainId = await this.provider.getNetwork().then(network => network.chainId);
        return chainId;
      }
      return undefined;
    } catch (error) {
      console.error('Error getting chain ID:', error);
      throw error;
    }
  }

  async switchToChain(chainId: number): Promise<void> {
    try {
      if (this.provider) {
        await this.provider.send('wallet_switchEthereumChain', [{ chainId: ethers.utils.hexValue(chainId) }]);
      } else {
        throw new Error('Please connect to MetaMask first');
      }
    } catch (error: any) {
      if (error.code === 4902) {
        console.warn('User rejected chain switch');
      } else {
        console.error('Error switching chain:', error);
        throw error;
      }
    }
  }

  async claim(): Promise<void> {
    // Implement your claim logic here
    console.log('Claim button clicked');
  }
}
