import { Component } from '@angular/core';
import { HeaderComponent } from "../header/header.component";
import { FooterComponent } from "../footer/footer.component";
import { HeadercheckComponent } from "../headercheck/headercheck.component";

@Component({
  selector: 'app-dprofile',
  standalone: true,
  imports: [HeaderComponent, FooterComponent, HeadercheckComponent],
  templateUrl: './dprofile.component.html',
  styleUrl: './dprofile.component.css'
})
export class DprofileComponent {

}
