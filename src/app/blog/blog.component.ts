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

    constructor(private router: Router, private blogService: BlogService) {}

    ngOnInit() {
        this.lastBlog = this.blogService.getAllBlogs().pop(); 
        this.otherBlogs = this.blogService.getAllBlogs().reverse(); 
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
