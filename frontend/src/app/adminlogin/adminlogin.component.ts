import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms'; // For ngModel
import { DataService } from '../data.service'; // Your service
import { Router } from '@angular/router'; // For navigation

@Component({
  selector: 'app-adminlogin',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './adminlogin.component.html',
  styleUrls: ['./adminlogin.component.css']
})
export class AdminloginComponent {
  email: string = '';
  password: string = '';

  constructor(private dataService: DataService, private router: Router) { }

  login() {
    this.dataService.adminLogin(this.email, this.password).subscribe({
      next: (response) => {
        if (response.message === 'Login successful') {
          alert('Login successful!');
          this.router.navigate([response.redirectUrl]); // e.g. /clinic-admin/1 or /web-admin/
        }
        if (response.message === 'You have already logged in') {
          alert('Redirecting......');
          this.router.navigate([response.redirectUrl]); // e.g. /clinic-admin/1 or /web-admin/
        }
      },
      error: (err) => {
        console.error('Login error:', err);
        alert('Login failed! Please check your credentials.');
      }
    });
  }
}
