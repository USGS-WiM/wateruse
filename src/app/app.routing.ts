// ------------------------------------------------------------------------------
// ----- app.routing.ts -----------------------------------------------
// ------------------------------------------------------------------------------

// copyright:   2017 WiM - USGS
// authors:  Tonia Roddick - USGS Wisconsin Internet Mapping
// purpose: routing for the application (home, settings, login)

import { NgModule } from "@angular/core";
import { RouterModule, Routes  } from '@angular/router';

import { AuthGuard } from "app/shared/guards/auth.guard";
import { LoginComponent } from "app/login/login.component";
import { HomeComponent } from "app/home/home.component";
import { RegionListResolve } from "app/regionList.resolve";
import { SettingsComponent } from "app/settings/settings.component";

const appRoutes: Routes = [
    { 
        path: '', 
        component: HomeComponent, 
        canActivate: [AuthGuard],
        resolve: {
            regions: RegionListResolve
    }     
    },
    { 
        path: 'login', 
        component: LoginComponent 
    },
    {
        path: 'settings',
        component: SettingsComponent,
        canLoad: [AuthGuard]
    },
    // otherwise redirect to home
    { path: '**', redirectTo: '' }
];

export const AppRoutingModule = RouterModule.forRoot(appRoutes);