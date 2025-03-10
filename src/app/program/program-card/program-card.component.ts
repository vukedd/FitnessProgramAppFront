import { Component, Input, OnInit } from '@angular/core';
import { ProgramOverviewDTO } from '../program-overview-dto';
import { CardModule } from 'primeng/card';
import {ButtonModule} from 'primeng/button' 
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { RatingModule } from 'primeng/rating';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProgramService } from '../program-service/program.service';
@Component({
  selector: 'app-program-card',
  imports: [CardModule,ButtonModule,RatingModule,CommonModule,FormsModule],
  templateUrl: './program-card.component.html',
  styleUrl: './program-card.component.css'
})
export class ProgramCardComponent implements OnInit {
  @Input() program!: ProgramOverviewDTO;
  @Input() showLikeCount: boolean = true;
  
  isFollowed: boolean = false;
  iconClass = 'pi pi-heart';
  followTextClass="Follow";
  followSeverity: 'success' | 'info' | 'warn' | 'danger' | 'help' | 'primary' | 'secondary' | 'contrast' | null | undefined = 'secondary';
  apiUrl:string;

  constructor(
    private sanitizer: DomSanitizer,
    private router: Router,
    private programService:ProgramService
  ) {
    this.apiUrl=programService.apiUrl;
  }

  ngOnInit(): void {
    this.iconClass = !this.isFollowed ? 'pi pi-heart' : 'pi pi-heart-fill';
    this.followTextClass=!this.isFollowed?"Follow":"Unfollow";
    this.followSeverity=!this.isFollowed?'primary' :'secondary';
  }
  
  
  
  navigateToDetails(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.router.navigate(['/programs', this.program.id]);
  }
  
  toggleLike(event: Event): void {
    event.stopPropagation(); // Prevent card click when clicking like button
    this.isFollowed = !this.isFollowed;
    this.iconClass = !this.isFollowed ? 'pi pi-heart' : 'pi pi-heart-fill';
    this.followTextClass=!this.isFollowed?"Follow":"Unfollow";
    this.followSeverity=!this.isFollowed?"primary":"secondary";

    // Here you would add API call to like/unlike the program
  }
  

  
}
