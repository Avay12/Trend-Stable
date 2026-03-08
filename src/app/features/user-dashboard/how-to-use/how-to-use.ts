import { Component } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-how-to-use',
  imports: [],
  templateUrl: './how-to-use.html',
  styleUrl: './how-to-use.css',
  animations: [
    trigger('fadeInUp', [
      state('void', style({ opacity: 0, transform: 'translateY(20px)' })),
      state('*', style({ opacity: 1, transform: 'translateY(0)' })),
      transition('void => *', animate('600ms cubic-bezier(0.4, 0, 0.2, 1)'))
    ])
  ]
})
export class HowToUse {

}
