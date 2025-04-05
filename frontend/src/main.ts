import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import AOS from 'aos';

bootstrapApplication(AppComponent, appConfig)
  .then(() => AOS.init({ duration: 800, easing: 'ease-in-out', once: true }))
  .catch((err) => console.error(err));

