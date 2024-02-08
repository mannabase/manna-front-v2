import { Injectable } from '@angular/core';
import { MetamaskBrightIdService } from './metamask-bright-id.service';
import { MannaService } from './manna.service';
import { ContractService } from './contract.service';
import { TuiAlertService } from '@taiga-ui/core';
import { Subscription, EMPTY } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ClaimService {
  constructor(
    private metamaskBrightIdService: MetamaskBrightIdService,
    private mannaService: MannaService,
    private contractService: ContractService,
    private alertService: TuiAlertService
  ) {}

  claimDailyReward(walletAddress: string, successCallback: () => void, errorCallback: (errorMessage: string) => void): Subscription {
    const timestamp = Math.floor(Date.now() / 1000);
    const message = `Check-in\naddress: ${walletAddress}\ntimestamp: ${timestamp}`;

    return this.metamaskBrightIdService.signMessage(message).subscribe(
      signature => {
        return this.mannaService.sendCheckIn(walletAddress, signature, timestamp).subscribe(
          () => {
            successCallback();
          },
          error => {
            errorCallback("Failed to Claim. Please try again.");
          }
        );
      },
      error => {
        errorCallback("Failed to sign the Claim message. Please try again.");
      }
    );
  }

  claimWithSignatures(walletAddress: string, isVerified: boolean, successCallback: () => void, errorCallback: (errorMessage: string) => void): Subscription {
    if (!isVerified) {
      errorCallback('You must be verified to withdraw.');
      return EMPTY.subscribe(); 
    }
  
    const timestamp = Math.floor(Date.now() / 1000);
    const message = `Request for check-in signatures\naddress: ${walletAddress}\ntimestamp: ${timestamp}`;
  
    console.log('Signing message:', message); // Log the message being signed
  
    return this.metamaskBrightIdService.signMessage(message).subscribe(
      signature => {
        console.log('Signature received:', signature); // Log the received signature
  
        return this.mannaService.sendClaimWithSig(walletAddress, signature, timestamp).subscribe(
          serverResponse => {
            console.log('Server response:', serverResponse); // Log the server response
  
            if (serverResponse.status === 'ok' && serverResponse.signatures) {
              const formattedSignatures = serverResponse.signatures.map((sig: any) => {
                return [sig.day, sig.signature.v, sig.signature.r, sig.signature.s];
              });
  
              console.log('Formatted Signatures:', formattedSignatures); // Log the formatted signatures
  
              return this.contractService.claimWithSigsContract(formattedSignatures).subscribe(
                () => {
                  successCallback();
                },
                contractError => {
                  console.error('Contract error:', contractError); // Log any errors from the contract
                  errorCallback('Failed to claim on smart contract with signatures.');
                }
              );
            } else {
              errorCallback(`Error: ${serverResponse?.msg || 'Invalid server response'}`);
              return EMPTY.subscribe();
            }
          },
          serverError => {
            console.error('Server error on sending claim request:', serverError); // Log server-side errors
            errorCallback('Failed to send claim request.');
            return EMPTY.subscribe();
          }
        );
      },
      signError => {
        console.error('Error signing message:', signError); // Log errors during the signing process
        errorCallback('Failed to sign the claim message.');
        return EMPTY.subscribe();
      }
    );
  }

  
}
