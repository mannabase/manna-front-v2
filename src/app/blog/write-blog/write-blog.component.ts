import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { BlogService } from '../../blog.service';

@Component({
  selector: 'app-write-blog',
  templateUrl: './write-blog.component.html',
  styleUrl: './write-blog.component.scss'
})
export class WriteBlogComponent {

  constructor(private blogService: BlogService) {}

  onSubmit(form: NgForm) {
      if (form.valid) {
          this.blogService.addBlog(form.value).subscribe(
              (response) => {
                  // Handle successful response
              },
              (error) => {
                  // Handle error
              }
          );
      }
  }
}