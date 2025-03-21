import { Component } from '@angular/core';
import { HeaderComponent } from "../header/header.component";
import { FooterComponent } from "../footer/footer.component";

@Component({
  selector: 'app-dlist',
  standalone: true,
  imports: [HeaderComponent, FooterComponent],
  templateUrl: './dlist.component.html',
  styleUrl: './dlist.component.css'
})
export class DlistComponent {

}
