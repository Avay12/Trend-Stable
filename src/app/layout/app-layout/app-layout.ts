import { Component, ViewEncapsulation } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app-layout.html',
  styleUrls: ['./app-layout.css'],
  encapsulation: ViewEncapsulation.None
})
export class AppLayout {}
