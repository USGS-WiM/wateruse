import { NgModule } from "@angular/core";
import { RouterModule, Routes  } from '@angular/router';

import { AuthGuard } from "app/shared/guards/auth.guard";
import { AppComponent } from "app/app.component";
import { LoginComponent } from "app/login/login.component";
import { HomeComponent } from "app/home/home.component";
import { RegionListResolve } from "app/regionList.resolve";

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
    // otherwise redirect to home
    { path: '**', redirectTo: '' }
];

export const AppRoutingModule = RouterModule.forRoot(appRoutes);