import { Component, OnInit, OnDestroy, EventEmitter, Output } from '@angular/core';
import { MetamaskBrightIdService, MetamaskState } from 'src/app/metamask-bright-id.service';
import { TuiAlertService } from '@taiga-ui/core';
import { Subscription } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { mannaChainName, serverUrl } from '../../config';
import { ContractService } from '../../contract.service';
import { MannaService } from '../../manna.service'; 

interface UserScoreData {
    timestamp: number;
    score: number;
}

@Component({
    selector: 'app-user-account',
    templateUrl: './user-account.component.html',
    styleUrls: ['./user-account.component.scss'],
})

export class UserAccountComponent implements OnInit, OnDestroy {
    walletAddress: string | null = null;
    scoreThreshold: number | null = null;
    userScore: UserScoreData | null = null;
    accountSubscription: Subscription = new Subscription();
    buttonText = 'Connect';
    loader: boolean = false;
    isScoreGreaterThan25: boolean = false;
    showScore: boolean = false;
    state = MetamaskState.NOT_CONNECTED;
    MetamaskState = MetamaskState;
    connectedToMetamask: boolean = false;
    mannaChain = mannaChainName;

    @Output() userScoreAvailable: EventEmitter<boolean> = new EventEmitter<boolean>();

    constructor(
        readonly alertService: TuiAlertService,
        private metamaskService: MetamaskBrightIdService,
        private http: HttpClient,
        readonly metamaskBrightIdService: MetamaskBrightIdService,
        private contractService: ContractService,
        private mannaService: MannaService 
    ) {
        this.accountSubscription = this.metamaskService.account$.subscribe((address) => {
            this.walletAddress = address;
            if (address) {
                this.refreshUserScore();
            }
        });
    }

    ngOnInit() {
        this.refreshUserScore();
        this.fetchScoreThreshold();
    }

    ngOnDestroy() {
        this.accountSubscription.unsubscribe();
    }

    updateState() {
        this.metamaskBrightIdService.checkMetamaskState().subscribe({
            next: (value) => {
                console.log('Metamask state:', value)
                if (value === MetamaskState.READY) {
                    this.state = value
                    this.connectedToMetamask = true
                } else if (
                    value === MetamaskState.NOT_CONNECTED ||
                    value === MetamaskState.NOT_INSTALLED
                ) {
                    this.state = value
                    this.connectedToMetamask = false
                } else {
                    this.state = value
                    this.connectedToMetamask = false
                }
            },
        })
    }

    openMetamaskExtension() {
        if (typeof window.ethereum === 'undefined') {
            this.alertService.open('Metamask is not installed. Please install Metamask and try again.', {status: 'error'}).subscribe();
            window.open('https://metamask.io/');
            return;
        }

        this.metamaskBrightIdService.connect().subscribe({
            next: account => {
                this.alertService.open("Connected to account: " + account, {status: "success"}).subscribe();
                this.state = MetamaskState.CONNECTED;
                this.updateState();
            },
            error: (err) => {
                this.alertService.open("Failed to connect Metamask", {status: "error"}).subscribe();
                this.state = MetamaskState.NOT_CONNECTED;
                this.updateState();
            },
        });
    }

    switchChain() {
        this.metamaskBrightIdService.switchToMannaChain().subscribe({
            next: () => {
                this.alertService.open('Chain Switched to ' + mannaChainName, {status: 'success'}).subscribe();
                this.state = MetamaskState.READY;
                this.showScore = true;
            },
            error: (err) => {
                this.alertService.open('Failed to switch chain', {status: 'error'}).subscribe();
            },
        });
    }

    private refreshUserScore() {
        if (!this.walletAddress) {
            console.log('No wallet address available for fetching user score.');
            return;
        }
        
        console.log('Fetching user score for address:', this.walletAddress);
        this.contractService.getUserScore(this.walletAddress).subscribe(
            scoreData => {
                console.log('User score fetched:', scoreData.score, 'at timestamp:', scoreData.timestamp);
                this.userScore = scoreData;
                this.isScoreGreaterThan25 = scoreData.score > 25000000; // Assuming the score is 25 million or more
                this.showScore = true;
                this.userScoreAvailable.emit(true);
            },
            error => console.error('Error fetching score from contract:', error)
        );
    }

    private fetchScoreThreshold() {
        this.contractService.getScoreThreshold().subscribe(
            threshold => this.scoreThreshold = threshold,
            error => console.error('Error fetching score threshold:', error)
        );
    }

    updateUserScore() {
        if (!this.walletAddress) {
            console.error('No wallet address available.');
            return;
        }
        this.loader = true;

        const timestamp = Math.floor(Date.now() / 1000);

        this.metamaskService.signUserMessage().subscribe(
            signature => {
                this.mannaService.sendSignature(this.walletAddress!, signature, timestamp).subscribe(
                    serverResponse => {
                        this.contractService.submitUserScore(this.walletAddress!, serverResponse.data).subscribe(
                            () => {
                                console.log('Score updated successfully.');
                                this.refreshUserScore();
                                this.loader = false;
                                this.alertService.open('Score updated successfully.', {status: 'success', label: 'Success'}).subscribe();
                            },
                            error => {
                                console.error('Error submitting score to contract:', error);
                                this.loader = false;
                                this.alertService.open('Failed to update score.', {status: 'error', label: 'Error'}).subscribe();
                            }
                        );
                    },
                    error => {
                        console.error('Error sending signature to server:', error);
                        this.loader = false;
                        this.alertService.open('Failed to send signature to server.', {status: 'error', label: 'Error'}).subscribe();
                    }
                );
            },
            error => {
                console.error('Error signing message:', error);
                this.loader = false;
                this.alertService.open('Failed to sign message.', {status: 'error', label: 'Error'}).subscribe();
            }
        );
    }
    openLinkInNewTab() {
        window.open('https://passport.gitcoin.co', '_blank');
    }
}
