import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router'; // Import Router
import { DataService } from '../data.service'; // Adjust the path if needed
import { CommonModule } from '@angular/common'; // Import CommonModule
import { interval, Subscription } from 'rxjs'; // Import RxJS for countdown

@Component({
  selector: 'app-receipt',
  templateUrl: './receipt.component.html',
  styleUrls: ['./receipt.component.css'],
  standalone: true,
  imports: [CommonModule],
})
export class ReceiptComponent implements OnInit, OnDestroy {
  invoice: any;
  date: string = new Date().toLocaleDateString();
  countdown: number = 300; // 5 minutes in seconds (5 * 60)
  private countdownSubscription: Subscription | null = null; // To manage RxJS subscription

  constructor(
    private route: ActivatedRoute,
    private dataService: DataService,
    private router: Router // Inject Router
  ) {}

  

  ngOnInit(): void {
    // Accessing query parameter instead of route parameter
    this.route.queryParams.subscribe((params) => {
      const invoiceId = params['invoiceId'];
      console.log('Invoice ID from queryParams:', invoiceId); // Debug log
  
      if (invoiceId) {
        this.dataService.getInvoiceById(invoiceId).subscribe({
          next: (data) => {
            console.log('Invoice data received:', data); // Debug log
            this.invoice = data;
          },
          error: (err) => {
            console.error('Error loading invoice:', err);
          },
        });
      } else {
        console.error('Invoice ID is missing.');
      }
    });
  
    // Start countdown timer
    this.startCountdown();
  }
  

  

  startCountdown(): void {
    // Use RxJS interval to update countdown every second
    this.countdownSubscription = interval(1000).subscribe(() => {
      this.countdown--;
      if (this.countdown <= 0) {
        this.redirectToHome();
      }
    });

    // Automatically redirect after 5 minutes (300,000 ms)
    setTimeout(() => {
      this.redirectToHome();
    }, 300000);
  }

  redirectToHome(): void {
    // Unsubscribe to prevent memory leaks
    if (this.countdownSubscription) {
      this.countdownSubscription.unsubscribe();
    }
    // Navigate to home
    this.router.navigate(['/home']); // Adjust '/home' to your home route
  }

  ngOnDestroy(): void {
    // Clean up subscription when component is destroyed
    if (this.countdownSubscription) {
      this.countdownSubscription.unsubscribe();
    }
  }

  printReceipt(): void {
    window.print();
  }

  // Optional: Format countdown for display (e.g., MM:SS)
  getFormattedCountdown(): string {
    const minutes = Math.floor(this.countdown / 60);
    const seconds = this.countdown % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
}