import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-popular-services',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './popular-services.html',
  styleUrl: './popular-services.css',
})
export class PopularServices {}
