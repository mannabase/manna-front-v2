import { Component, OnInit } from '@angular/core';
import { BlogService } from '../blog.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-blog',
    templateUrl: './blog.component.html',
    styleUrls: ['./blog.component.scss'],
})
export class BlogComponent implements OnInit {
    lastBlog: any;
    otherBlogs: any[] = [];
    currentPage: number = 1;
    pageSize: number = 6;
    totalBlogs: number = 0;
    totalPages: number = 0;

    constructor(private router: Router, private blogService: BlogService) {}

    ngOnInit() {
        this.loadBlogs();
    }

    loadBlogs() {
        this.blogService.getAllBlogs(this.currentPage, this.pageSize).subscribe(blogs => {
            this.totalBlogs = blogs.length;
            this.totalPages = Math.ceil(this.totalBlogs / this.pageSize);

            if (blogs.length > 0) {
                this.lastBlog = blogs.pop();
                this.otherBlogs = blogs.reverse();
            }
        });
    }

    goToPage(page: number) {
        this.currentPage = page;
        this.loadBlogs();
    }

    viewBlogDetail(id: string) { // Ensure the ID type matches with what your service expects
        this.router.navigate(['/blog', id]);
    }

    trim(text: string, max_length = 200) {
        if (text.length > max_length) {
            return text.slice(0, max_length) + '...';
        }
        return text;
    }
}
