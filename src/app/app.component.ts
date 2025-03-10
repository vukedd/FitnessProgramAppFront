import { Component } from '@angular/core';
import { RouterOutlet,RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { HeaderComponent } from "./layout/header/header.component";
import { SidebarComponent } from "./layout/sidebar/sidebar.component";
import { AvatarModule } from 'primeng/avatar';
import { InputGroupModule } from 'primeng/inputgroup';
import { ProgramCreateComponent } from "./program/program-create/program-create.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ButtonModule, RouterModule, HeaderComponent, SidebarComponent, AvatarModule, InputGroupModule, ProgramCreateComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  
  title = 'fitness-program-app';
  ngOnInit() {
    if (typeof window !== 'undefined' && window.localStorage) {
      sessionStorage.setItem('key', 'value');
      const data = sessionStorage.getItem('key');
    }
  }
}
