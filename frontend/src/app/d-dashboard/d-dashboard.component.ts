import { Component } from '@angular/core';
import { HeaderComponent } from "../header/header.component";
import { FooterComponent } from "../footer/footer.component";

@Component({
  selector: 'app-d-dashboard',
  standalone: true,
  imports: [HeaderComponent, FooterComponent],
  templateUrl: './d-dashboard.component.html',
  styleUrl: './d-dashboard.component.css'
})
export class DDashboardComponent {

}
