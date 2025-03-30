import { Component } from '@angular/core';
import { HeaderComponent } from "../header/header.component";
import { FooterComponent } from "../footer/footer.component";
import { HeadercheckComponent } from "../headercheck/headercheck.component";

@Component({
  selector: 'app-supplier',
  standalone: true,
  imports: [HeaderComponent, FooterComponent, HeadercheckComponent],
  templateUrl: './supplier.component.html',
  styleUrl: './supplier.component.css'
})
export class SupplierComponent {

}
