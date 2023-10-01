import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BlogService } from '../../blog.service'; 

@Component({
    selector: 'app-blog-detail',
    templateUrl: './blog-detail.component.html',
    styleUrls: ['./blog-detail.component.scss'],
})
export class BlogDetailComponent implements OnInit {
    selectedBlog: any;

    constructor(
        private route: ActivatedRoute,
        private blogService: BlogService 
    ) {}

    ngOnInit() {
        const blogId = +this.route.snapshot.paramMap.get('id')!;
        this.selectedBlog = this.blogService.getBlogById(blogId);
    }
}
