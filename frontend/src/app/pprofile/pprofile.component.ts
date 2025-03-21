import { Component } from '@angular/core';
import { HeaderComponent } from "../header/header.component";
import { FooterComponent } from "../footer/footer.component";

@Component({
  selector: 'app-pprofile',
  standalone: true,
  imports: [HeaderComponent, FooterComponent],
  templateUrl: './pprofile.component.html',
  styleUrl: './pprofile.component.css'
})
export class PprofileComponent {

}
