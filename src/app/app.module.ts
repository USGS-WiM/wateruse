import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule }    from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';
import { LoginComponent } from "app/login/login.component";
import { HomeComponent } from "app/home/home.component";

import { AppRoutingModule } from "app/app.routing";
import { AuthGuard } from "app/shared/guards/auth.guard";
import { WateruseService } from "app/shared/services/wateruse.service";
import { AuthenticationService } from "app/login/authentication.service";
import { RegionListResolve } from "app/regionList.resolve";

@NgModule({
  declarations: [ AppComponent, LoginComponent, HomeComponent ],
  imports: [ BrowserModule, FormsModule, HttpModule, AppRoutingModule ],
  providers: [AuthGuard, AuthenticationService, WateruseService, RegionListResolve], //AlertService
  bootstrap: [AppComponent]
})
export class AppModule { }
