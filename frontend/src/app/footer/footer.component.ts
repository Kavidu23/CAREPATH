import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';  // Import RouterModule for routing functionality

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterModule],  // Import RouterModule for routing
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent {
  // Any additional logic for the footer can be added here
}
