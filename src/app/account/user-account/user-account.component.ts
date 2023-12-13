import { Component, OnInit, OnDestroy, EventEmitter, Output } from '@angular/core';
import { MetamaskBrightIdService, MetamaskState } from 'src/app/metamask-bright-id.service';
import { TuiAlertService } from '@taiga-ui/core';
import { Subscription } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { mannaChainName, serverUrl } from '../../config';
import { ContractService } from '../../contract.service';

@Component({
    selector: 'app-user-account',
    templateUrl: './user-account.component.html',
    styleUrls: ['./user-account.component.scss'],
})
export class UserAccountComponent implements OnInit, OnDestroy {
    walletAddress: string | null = null;
    scoreThreshold: number | null = null;
    userScore: number | null = null;
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
        private contractService: ContractService
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

        async onSign() {
            const timeStamp = Math.floor(Number(Date.now().toString()) / 1000)

            try {
                const msg = `Verification request\naddress: ${this.walletAddress}\ntimestamp: ${timeStamp}`
                this.metamaskService.signMessage(msg).subscribe((sign: string) => {
                    console.log('Signature:', sign)
                    console.log('Timestamp:', timeStamp)
                    this.buttonText = 'Check Score'
                    const headers = new HttpHeaders({'Content-Type': 'application/json'})
                    this.loader = true
                    // this.sendToServer(
                    //     {
                    //         signature: sign,
                    //         user: this.walletAddress,
                    //         timestamp: timeStamp,
                    //     },
                    //     'signing/gitcoinPassportScore',
                    //     headers,
                    // )
                })
            } catch (error) {
                console.error('Error connecting or sending data to server:', error)
            } finally {
                this.loader = false
            }
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
                this.alertService
                    .open(
                        'Metamask is not installed. Please install Metamask and try again.',
                        {
                            status: 'error',
                        },
                    )
                    .subscribe()
                window.open('https://metamask.io/')
                return
            }

            this.metamaskBrightIdService.connect().subscribe({
                next: account => {
                    this.alertService.open("Connected to account: " + account, {
                        status: "success",
                    }).subscribe()
                    this.state = MetamaskState.CONNECTED
                    this.updateState()
                },
                error: (err) => {
                    this.alertService.open("Failed to connect Metamask", {
                        status: "error",
                    }).subscribe()
                    this.state = MetamaskState.NOT_CONNECTED
                    this.updateState()
                },
            })
        }

        switchChain() {
            this.metamaskBrightIdService.switchToMannaChain().subscribe({
              next: () => {
                this.alertService.open('Chain Switched to ' + mannaChainName, {
                  status: 'success',
                }).subscribe();
                this.state = MetamaskState.READY
                this.showScore = true
    
              },
              error: (err) => {
                this.alertService.open('Failed to switch chain', {
                  status: 'error',
                }).subscribe();
              },
            });
          }
          private async refreshUserScore(): Promise<void> {
            if (!this.walletAddress) {
                console.log('No wallet address available for fetching user score.');
                return;
            }
    
            console.log('Fetching user score for address:', this.walletAddress);
            try {
                const userScore = await this.contractService.getUserScore(this.walletAddress);
                console.log('User score fetched:', userScore);
                this.userScore = userScore;
                this.isScoreGreaterThan25 = userScore > 25;
                this.showScore = true;
                this.userScoreAvailable.emit(true);
            } catch (error) {
                console.error('Error fetching score from contract:', error);
            }
        }
        private async fetchScoreThreshold(): Promise<void> {
            try {
              const threshold = await this.contractService.getScoreThreshold();
              this.scoreThreshold = threshold;
            } catch (error) {
              console.error('Error fetching score threshold:', error);
            }
          }
    }
