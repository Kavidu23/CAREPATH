import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-emailpassword',
  standalone: true,
  imports: [],
  templateUrl: './emailpassword.component.html',
  styleUrls: ['./emailpassword.component.css']
})
export class EmailpasswordComponent implements OnInit {
  email: string | null = null;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.email = params['email'] || 'your email address';
    });
  }
}