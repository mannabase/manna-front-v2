import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BlogService } from '../../blog.service'; 

@Component({
    selector: 'app-blog-detail',
    templateUrl: './blog-detail.component.html',
    styleUrls: ['./blog-detail.component.scss'],
})
export class BlogDetailComponent implements OnInit {
    selectedBlog: any;
    previousBlog: any;
    nextBlog: any;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private blogService: BlogService 
    ) {}

    ngOnInit() {
        this.loadBlog();
    }

    loadBlog() {
        const blogId = +this.route.snapshot.paramMap.get('id')!;
        this.selectedBlog = this.blogService.getBlogById(blogId);
        this.previousBlog = this.blogService.getPreviousBlog(blogId);
        this.nextBlog = this.blogService.getNextBlog(blogId);
    }

    navigateToBlog(blogId: number) {
        this.router.navigate(['/blog', blogId]).then(() => {
            this.loadBlog();
        });
    }
    navigateBack() {
        this.router.navigate(['/blog']); 
    }
}
