import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { serverUrl } from './config';

@Injectable({
  providedIn: 'root',
})
export class BlogService {
  private apiUrl = `${serverUrl}/blog`;

  constructor(private http: HttpClient) {}

  getAllBlogs(page: number = 1, limit: number = 10) {
    return this.http.get<any[]>(`${this.apiUrl}?page=${page}&limit=${limit}`);
  }

  getBlogById(id: string) {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  addBlog(blogData: any) {
    return this.http.post(`${this.apiUrl}`, blogData);
  }

  updateBlog(id: string, blogData: any) {
    return this.http.put(`${this.apiUrl}/${id}`, blogData);
  }
  deleteBlog(id: string) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

    // getPreviousBlog(id: number) {
    //     const index = this.blogs.findIndex((blog) => blog.id === id);
    //     return index > 0 ? this.blogs[index - 1] : null;
    // }

    // getNextBlog(id: number) {
    //     const index = this.blogs.findIndex((blog) => blog.id === id);
    //     return index >= 0 && index < this.blogs.length - 1 ? this.blogs[index + 1] : null;
    // }
}
