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
        let blogs = [...this.blogService.getAllBlogs()];
        if (blogs.length > 0) {
            this.lastBlog = blogs.pop();
        }
        this.otherBlogs = blogs.reverse();
        this.totalBlogs = this.blogService.getAllBlogs().length;
        this.totalPages = Math.ceil(this.totalBlogs / this.pageSize);
        this.loadBlogs();
    }
    loadBlogs() {
        this.otherBlogs = this.blogService.getBlogsByPage(this.currentPage, this.pageSize);
    }

    goToPage(page: number) {
        this.currentPage = page;
        this.loadBlogs();
    }
    viewBlogDetail(id: number) {
        this.router.navigate(['/blog', id]);
    }

    trim(text: string, max_length = 200) {
        if (text.length > max_length) {
            return text.slice(0, max_length) + '...';
        }
        return text;
    }
}
