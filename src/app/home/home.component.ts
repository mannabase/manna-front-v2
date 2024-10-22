import { Component, Injector, OnInit } from '@angular/core';
import { TuiAlertService, TuiDialogService } from '@taiga-ui/core';
import { MetamaskService, MetamaskState } from 'src/app/metamask.service';
import { VerifyState, VerifyService } from 'src/app/verify.service';
import { PolymorpheusComponent } from '@taiga-ui/polymorpheus';
import { ClaimDialogComponent } from '../claim-dialog/claim-dialog.component';
import { externalLinks } from '../config';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
    ballonsHomePage: string = '../../assets/images/ballons.webp';
    erthHomePage: string = '../../assets/images/erth.webp';
    twitterUrl = externalLinks.twitterUrl;
    discordUrl = externalLinks.discordUrl;
    mediumUrl = externalLinks.mediumUrl;

    constructor(
        readonly metamaskService: MetamaskService,
        readonly dialogService: TuiDialogService,
        readonly injector: Injector,
        readonly alertService: TuiAlertService
    ) {}
    boxes = [
        {
            title: 'Get Verified',
            description:
                'All manna users are verified while preserving user privacy. Making a network of unique, anonymous humans.',
            link: 'Get Verified',
            imagePath: '../../assets/images/verified.png',
        },
        {
            title: 'Earn',
            description:
                'Get manna everyday.  Everyone in the world  can join and earn daily manna.',
            link: 'Earn',
            imagePath: '../../assets/images/earn_manna_logoes.png',
        },
        {
            title: 'Spend',
            description:
                'Use manna for what you love. Join a growing community of manna users and discover new ways to use it.',

            link: 'Start Now',
            imagePath: '../../assets/images/spend.png',
        },
    ];
    communityBoxes = [
        {
            link: 'Governed Forum',
            description:
                'Participate in discussion and proposals for future update and decisions with tha Manna cummunity',
        },
        {
            link: 'Verified Unique People',
            description:
                'Participate directly or delegate to active members in the community.All verified Manna users have a voice.',
        },
        {
            link: 'Governance DAO',
            description:
                'Vote on important proposals and view vote history on past proposals.',
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
        console.log(
            'this.metamaskService.metamaskState$',
            this.metamaskService.metamaskState$.value
        );
    }
}
