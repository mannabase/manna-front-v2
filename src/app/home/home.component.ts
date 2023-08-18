import { Component, Injector, OnInit } from '@angular/core';
import { TuiAlertService, TuiDialogService } from '@taiga-ui/core';
import { MetamaskBrightIdService } from 'src/app/metamask-bright-id.service';
import { UserClaimingState, UserService } from 'src/app/user.service';
import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { ClaimDialogComponent } from '../claim-dialog/claim-dialog.component';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
    ballonsHomePage: string = '../../assets/images/ballons.png';
    erthHomePage: string = '../../assets/images/erth.png'

    buttonMessageMap = new Map<UserClaimingState, string>([
        [UserClaimingState.ZERO, 'Connect Metamask'],
        [UserClaimingState.METAMASK_CONNECTED, 'Change to ID Chain'],
        [UserClaimingState.CORRECT_CHAIN, 'Verify'],
        [UserClaimingState.VERIFIED, 'Claim'],
    ]);

    constructor(
        readonly metamaskBrightIdService: MetamaskBrightIdService,
        readonly dialogService: TuiDialogService,
        readonly injector: Injector,
        readonly alertService: TuiAlertService
    ) {}
    boxes = [
        {
            title: 'Get Verified',
            description: 'All manna user are verified while presrving user privacy. Making a network of uniqe, real accounts',
            link: 'Get Verified',
            imagePath: '../../assets/images/verified.png',
        },
        {
            title: 'Earn',
            description: 'Get manna everyday.  Everyone in the world  can join and earn daily manna. Get manna  everyday.',
            link: 'Earn',
            imagePath: '../../assets/images/earn_manna_logoes.png',
        },
        {
            title: 'Spend',
            description: 'Use manna for what you love.Trade it in the marketplace, giv it to those in need,or stake for rewards.',
            link: 'Spend',
            imagePath: '../../assets/images/spend.png',
        },
    ];
    communityBoxes = [
        {
            link: 'Governed Forum',
            description: 'Participate in discussion and proposals for future update and decisions with tha Manna cummunity',
        },
        {
            link: 'Verified Unique People',
            description: 'Participate directly or delegate to active members in the community.All verified Manna users have a voice.',
        },
        {
            link: 'Governance DAO',
            description: 'Vote on important proposals and view vote history on past proposals.',
        },
    ];
    ngOnInit() {}

    openClaimDialog() {
        this.dialogService
            .open<number>(
                new PolymorpheusComponent(ClaimDialogComponent, this.injector),
                {
                    dismissible: true,
                }
            )
            .subscribe({
                next: (value) => {},
            });
    }
}
