import { Component } from '@angular/core';
import { HeaderComponent } from "../header/header.component";
import { FooterComponent } from "../footer/footer.component";

@Component({
  selector: 'app-p-dashboard',
  standalone: true,
  imports: [HeaderComponent, FooterComponent],
  templateUrl: './p-dashboard.component.html',
  styleUrl: './p-dashboard.component.css'
})
export class PDashboardComponent {

}
