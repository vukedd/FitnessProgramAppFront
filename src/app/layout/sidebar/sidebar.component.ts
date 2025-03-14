import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DrawerModule } from 'primeng/drawer';
import { MenuModule } from 'primeng/menu';
import { AvatarModule } from 'primeng/avatar';
import { AvatarGroupModule } from 'primeng/avatargroup';
import { JwtService } from '../../auth/jwt/jwt.service';


@Component({
  selector: 'app-sidebar',
  imports: [DrawerModule,MenuModule,ButtonModule,CommonModule,RouterModule,AvatarGroupModule,AvatarModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
  encapsulation: ViewEncapsulation.None
})
export class SidebarComponent {
  username: string = 'John';
  email: string = 'Doe';
  photo: string = 'placeholder-pfp.jpg';
  role: string = '';

  constructor(private jwtService: JwtService) { }

  ngOnInit(): void {
    if (this.isLoggedIn()) {
      this.loadUserData();
    } else {
      this.username = '';
      this.email = '';
      this.role = '';
    }
  }

  isLoggedIn() {
    return this.jwtService.isLoggedIn();
  }

  private loadUserData(): void {
    this.jwtService.getLoggedInUser().subscribe(
      (userData) => {
        this.username = userData.username;
        this.email = userData.email;
      },
      (error) => {
        console.error('Error loading user data:', error);
      }
    );
  }
}
