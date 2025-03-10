import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { ThemeService } from '../../theme.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MenubarModule } from 'primeng/menubar';
import { MenuItem, MessageService } from 'primeng/api';
import { DrawerModule } from 'primeng/drawer';
import { SidebarComponent } from "../sidebar/sidebar.component";
import { InputTextModule } from 'primeng/inputtext';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { JwtService } from '../../auth/jwt/jwt.service';
import { DialogModule } from 'primeng/dialog';
import { RegisterFormComponent } from "../../user/register/register-form/register-form.component";
import { LoginFormComponent } from "../../user/login/login-form/login-form.component";
import { ToastModule } from 'primeng/toast';
import { consumerPollProducersForChange } from '@angular/core/primitives/signals';
import { UserProfile } from '../../user/login/dtos/user-profile';

@Component({
  selector: 'app-header',
  imports: [ButtonModule, ToolbarModule, CommonModule, FormsModule, MenubarModule, DrawerModule, SidebarComponent, InputTextModule, InputGroupModule, InputGroupAddonModule, DialogModule, RegisterFormComponent, LoginFormComponent, ToastModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
  providers:  [MessageService],
  encapsulation: ViewEncapsulation.None
})
export class HeaderComponent implements OnInit{

  sidemenuVisible:boolean=false;
  isDarkMode = false;
  searchText:string='';
  items: MenuItem[] | undefined;
  visible: boolean = false;
  isLoginMode: boolean = true;

  showDialog() {
      this.visible = true;
  }

  closeDialog() {
    this.visible = false;
  }

  handleModeChange(value: boolean) {
    this.isLoginMode = value;
  }

  handleRegisterError(errorMessage: string) {
    this.messageService.add({ severity: 'error', summary: 'Error', detail: errorMessage });
  }

  handleRegisterSuccess(successMessage: string) {
    this.messageService.add({ severity: 'success', summary: 'Success', detail: successMessage })
    this.isLoginMode = true;
  }

  handleLoginError(statusCode: number) {
    switch (statusCode) {
      case 401:
        this.messageService.add({ severity: 'error', summary: "Error", detail: "The credentials you have entered are invalid!"});
        break;
      case 403:
        this.messageService.add({ severity: 'error', summary: "Error", detail: "Before you continue, please verify your account!"});
        break;
      default:
        this.messageService.add({ severity: 'error', summary: "Error", detail: "An error occurred, please try later!"});
    }
  }

  handleLoginSuccess(statusCode: number) {
    if (statusCode == 200) {
      this.messageService.add({severity: 'success', summary: "Success", detail: "You have successfully logged in!"})
    }
  }

  constructor(private themeService: ThemeService, private jwtService: JwtService, private messageService: MessageService) {
    this.themeService.darkMode$.subscribe(
        isDark => this.isDarkMode = isDark
    );
  } 
  
  ngOnInit(): void {
    if (this.jwtService.isLoggedIn()){
      let email:string = "starting"
      this.jwtService.getLoggedInUser().subscribe(
        {
          next: (response) => {
            this.items = [
              {
                label: `${response.email}`,
                icon: '',
                items: [
                  {
                    label: 'Profile',
                    icon: 'pi pi-user',
                    
                  },
                  {
                    label: 'Logout',
                    icon: 'pi pi-sign-out',
                    command: () => {
                      this.jwtService.logout()
                      window.location.href = '';
                    }
                  },
                ],
              },
            ];
          },
          error: (error) => {
            email = "Error";
          }
        }
      )
    }
  }
  toggleTheme() {
    this.themeService.toggleDarkMode();
  }
  onSearchChange() {
    //this.searchService.updateSearch(this.searchText);
  }
  
 
}
