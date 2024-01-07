import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { BlogService } from '../../blog.service';

@Component({
  selector: 'app-write-blog',
  templateUrl: './write-blog.component.html',
  styleUrls: ['./write-blog.component.scss']
})
export class WriteBlogComponent {
  isSubmitting = false;
  submissionError: string = '';
  submissionSuccess: string = '';
  blog = {
    title: '',
    description: '',
    writer: '',
    picture: ''
  };

  constructor(private blogService: BlogService) {}

  onSubmit(form: NgForm) {
    if (this.blog.title && this.blog.description && this.blog.writer) {
      this.isSubmitting = true;
      this.blogService.addBlog(this.blog).subscribe(
        (response) => {
          // Handle successful response
          this.submissionSuccess = 'Blog posted successfully!';
          this.isSubmitting = false;
          form.reset();
        },
        (error) => {
          // Handle error
          this.submissionError = 'An error occurred. Please try again.';
          this.isSubmitting = false;
        }
      );
    }
  }
}
