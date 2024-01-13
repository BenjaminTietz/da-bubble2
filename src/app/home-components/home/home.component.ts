import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  title = 'da-bubble';

  public isScreenSmall!: boolean;
  drawerMode: 'side' | 'over' = 'side';
  drawerOpened: boolean = false;

  constructor() {
    this.checkScreenSize();
  }


  private checkScreenSize() {
    this.isScreenSmall = window.innerWidth < 850;
    this.drawerMode = this.isScreenSmall ? 'over' : 'side';
    this.drawerOpened = !this.isScreenSmall;
  }


  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkScreenSize();
  }





}
