import { Component } from '@angular/core';
import { HeaderComponent } from "../header/header.component";
import { FooterComponent } from "../footer/footer.component";
import { HeadercheckComponent } from "../headercheck/headercheck.component";

@Component({
  selector: 'app-hospital',
  standalone: true,
  imports: [HeaderComponent, FooterComponent, HeadercheckComponent],
  templateUrl: './hospital.component.html',
  styleUrl: './hospital.component.css'
})
export class HospitalComponent {

}
