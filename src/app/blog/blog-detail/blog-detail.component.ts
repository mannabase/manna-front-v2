import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-blog-detail',
  templateUrl: './blog-detail.component.html',
  styleUrls: ['./blog-detail.component.scss']
})
export class BlogDetailComponent implements OnInit {
  blog: any;

  constructor(private route: ActivatedRoute) {
  }

  ngOnInit() {
    const blogId = Number(this.route.snapshot.paramMap.get('id'));
    this.blog = this.getBlogById(blogId);
  }

  getBlogById(id: number) {
    return {
      id: id,
      title: `Blog ${id}`,
      content: `This is the content of Blog ${id}.`,
      imageUrl: `https://example.com/image${id}.jpg`
    };
  }
}
