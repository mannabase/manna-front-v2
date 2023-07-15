import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-blog',
  templateUrl: './blog.component.html',
  styleUrls: ['./blog.component.scss']
})
export class BlogComponent implements OnInit {
  blogs: any[] = [
    {
      id: 1,
      title: 'Blog 1',
      content: 'This is the content of Blog 1.',
      imageUrl: 'src/assets/images/marketplace_sample1.png'
    },
    {
      id: 2,
      title: 'Blog 2',
      content: 'This is the content of Blog 2.',
      imageUrl: 'src/assets/images/marketplace_sample2.png'
    },
    {
      id: 3,
      title: 'Blog 3',
      content: 'This is the content of Blog 3.',
      imageUrl: 'src/assets/images/marketplace_sample3.png'
    }
  ];
  

  constructor(private router: Router) { }

  ngOnInit() {
  }

  viewBlogDetail(id: number) {
    this.router.navigate(['/blog', id]);
  }
}
