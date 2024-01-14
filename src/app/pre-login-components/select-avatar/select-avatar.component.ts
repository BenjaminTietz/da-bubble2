import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-select-avatar',
  templateUrl: './select-avatar.component.html',
  styleUrl: './select-avatar.component.scss'
})
export class SelectAvatarComponent {

  username: string = "Frederik Beck";

  constructor(private router: Router) {}

  continue() {
    // Füge hier die Logik hinzu, die beim Weiterklicken ausgeführt werden soll
    console.log('Weiter geklickt!');
    // Beispiel: Navigiere zu einer anderen Komponente
    this.router.navigate(['/home']);
  }
}
