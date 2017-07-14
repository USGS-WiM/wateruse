// ------------------------------------------------------------------------------
// ----- app.module.ts -----------------------------------------------
// ------------------------------------------------------------------------------

// copyright:   2017 WiM - USGS
// authors:  Tonia Roddick - USGS Wisconsin Internet Mapping
// purpose: main entry module to the rest of the application

import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule }    from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';
import { LoginComponent } from "app/login/login.component";
import { HomeComponent } from "app/home/home.component";

import { AppRoutingModule } from "app/app.routing";
import { RegionListResolve } from "app/regionList.resolve";
import { SharedModule } from "app/shared/shared.module";
import { PipesModule } from "app/shared/pipes/pipes.module";
import { HomeService } from "app/home/home.service";
import { EditSourceModal } from "app/home/source.modal";

@NgModule({
  declarations: [ AppComponent, LoginComponent, HomeComponent, EditSourceModal ],
  imports: [ BrowserModule, FormsModule, ReactiveFormsModule, HttpModule, AppRoutingModule, PipesModule, SharedModule.forRoot() ],
  exports: [ReactiveFormsModule],
  providers: [ RegionListResolve, HomeService], //AlertService
  bootstrap: [AppComponent]
})
export class AppModule { }
