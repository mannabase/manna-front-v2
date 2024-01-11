import {Component} from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { externalLinks } from '../config';

interface AccordionItem {
  title: string;
  content: string;
  expanded: boolean;
}
@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss'],
  animations: [
    trigger('slideToggle', [
      state('true', style({ height: '*', opacity: 1 })),
      state('false', style({ height: '0px', opacity: 0 })),
      transition('true <=> false', animate('500ms ease-out'))
    ])
  ]
})
export class AboutComponent {

  twitterUrl = externalLinks.twitterUrl;
  discordUrl = externalLinks.discordUrl;
  mediumUrl = externalLinks.mediumUrl;
  emailUrl =externalLinks.emailUrl;

  items: AccordionItem[] = [
    { 
      title: 'How Do I Sell Manna?', 
      content: 'The sale of manna is up to the Manna DAO, community, and exchanges to list and generate liquidity. When exchanges list Manna, this information will be announced and shared to the community.', 
      expanded: true 
    },
    { 
      title: 'Where Can I Use Manna? ', 
      content: 'The purpose of Mannabase is to provide the fundamental distribution of Manna. From there, it is up to the community to discover how to utilize it. ', 
      expanded: false 
    },
    {
      title: 'What is the Total Supply and Distribution?',
      content: `The manna supply can be tracked <a href="${externalLinks.mediumUrl}" target="_blank" rel="noopener noreferrer" class="link-style">here</a>. Manna DAO holdings can be seen <a href="${externalLinks.mediumUrl}" target="_blank" rel="noopener noreferrer" class="link-style">here</a>. The remainder is held by the community. Manna did not receive VC funding or hold an ICO. The only way new Manna is created is through unique humans claiming it daily.`,
      expanded: false
    },
    { 
      title: 'How is Manna Governed?', 
      content: 'Manna is governed by the Manna DAO. The objective of the Manna DAO is to manage a treasury of Manna funded through ongoing contributions by the community. It also exists for the community to make important decisions on upgrades or developments for Manna. ', 
      expanded: false 
    },
    { 
      title: 'Why is Manna built on Optimism?', 
      content: 'Optimism is a highly trusted Ethereum layer 2 protocol that provides access to the Ethereum ecosystem while also offering extremely low gas fees. This enables users to access the broader crypto ecosystem while also enabling cheap and affordable transactions. ', 
      expanded: false 
    },
    { 
      title: 'Why Use Gitcoin Passport?', 
      content: 'In order to ensure each user can only claim manna once per day, it is critical we prevent users from making many accounts. This can be challenging in a decentralized and global ecosystem. Gitcoin Passport is working to solve this and is a leader in the field of unique identity solutions on chain. ', 
      expanded: false 
    },
  ];

  toggleAccordion(clickedItem: AccordionItem): void {
    if (clickedItem.expanded) {
      clickedItem.expanded = false;
      return;
    }
    this.items.forEach(item => {
      item.expanded = false;
    });
    clickedItem.expanded = true;
  }

  isExpanded(item: AccordionItem): boolean {
    return item.expanded;
  }
}
