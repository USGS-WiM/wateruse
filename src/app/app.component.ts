import { Component } from '@angular/core';
import { AuthService } from "app/shared/services/auth.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
 // public loggedIn: boolean;
  //public loggedInRole: string;

  constructor(private _authService: AuthService){}

  ngOnInit(){
 //   this._authService.loggedInID().subscribe((id: number)=> {
 //     this.loggedIn = localStorage.getItem('credentials') !== null ? true : false;      
 //   });
  //  this._authService.loggedInRole().subscribe((role: string)=> {
  //    this.loggedInRole = localStorage.getItem('loggedInRole');
  //  });
  }

  public loggedIn(){
    return localStorage.getItem('credentials') !== null ? true : false; 
  }
  public loggedInRole() {
    return localStorage.getItem('loggedInRole');
  }
}
