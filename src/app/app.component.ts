// ------------------------------------------------------------------------------
// ----- app.component.ts -----------------------------------------------
// ------------------------------------------------------------------------------

// copyright:   2017 WiM - USGS
// authors:  Tonia Roddick - USGS Wisconsin Internet Mapping
// purpose: main entry component to the rest of the application

import { Component } from '@angular/core';
import { AuthService } from "app/shared/services/auth.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  constructor(){}

  public loggedIn(){
    return localStorage.getItem('credentials') !== null ? true : false; 
  }
  public loggedInRole() {
    return localStorage.getItem('loggedInRole');
  }
}
