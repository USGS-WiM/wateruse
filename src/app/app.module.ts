// ------------------------------------------------------------------------------
// ----- app.module.ts -----------------------------------------------
// ------------------------------------------------------------------------------

// copyright:   2017 WiM - USGS
// authors:  Tonia Roddick - USGS Wisconsin Internet Mapping
// purpose: main entry module to the rest of the application

import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { APP_INITIALIZER } from '@angular/core';
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
import { TimeseriesComponent } from "app/home/timeseries.component";
import { SourceListComponent } from "app/home/sourcelist.component";
import { SettingsModule } from "app/settings/settings.module";
import { ConfigService } from "app/config.service";
import { environment } from '../environments/environment';

export function ConfigLoader(configService: ConfigService) {
	//Note: this factory needs to return a function (that returns a promise)
	return () => configService.load(environment.configFile);
}

@NgModule({
	declarations: [AppComponent, LoginComponent, HomeComponent, SourceListComponent, EditSourceModal, TimeseriesComponent],
	imports: [BrowserModule, FormsModule, ReactiveFormsModule, HttpModule, AppRoutingModule, PipesModule, SharedModule.forRoot(), SettingsModule],
	exports: [ReactiveFormsModule],
	providers: [RegionListResolve, HomeService, 
		ConfigService,
        {
            provide: APP_INITIALIZER,
            useFactory: ConfigLoader,
            deps: [ConfigService],
            multi:true
        }],
	bootstrap: [AppComponent]
})
export class AppModule { }
