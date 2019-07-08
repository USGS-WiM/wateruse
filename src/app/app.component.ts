// ------------------------------------------------------------------------------
// ----- app.component.ts -----------------------------------------------
// ------------------------------------------------------------------------------

// copyright:   2017 WiM - USGS
// authors:  Tonia Roddick - USGS Wisconsin Internet Mapping
// purpose: main entry component to the rest of the application

import { Component, ChangeDetectorRef } from '@angular/core';
import { AuthService } from "app/shared/services/auth.service";
import { LoadingService } from "app/shared/services/loading.service";
import { ActivatedRoute } from "@angular/router";

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.css']
})
export class AppComponent {
	public showPageLoading: boolean;

	constructor(private _route: ActivatedRoute, private _authService: AuthService, private cdRef:ChangeDetectorRef, 
		private _loadingService: LoadingService) { }

	ngOnInit() {
		this.showPageLoading = false;
		this._authService.loggedInID().subscribe((id: number)=> {
			this.loggedIn();
    	});
	    this._authService.loggedInRole().subscribe((role: string)=> {
    		this.loggedInRole()
		});
		this._loadingService.getLoading.subscribe((load:boolean) =>{
			this.showPageLoading = load;
		})	
	}

	public loggedIn() { 
		return localStorage.getItem('credentials') !== null ? true : false;

	}
	public loggedInRole() {
		return localStorage.getItem('loggedInRole');
	}

	// fixed ExpressionChangedAfterItHasBeenCheckedError issue when loggedIn() changes
	ngAfterViewChecked()
	{		
		this.cdRef.detectChanges();
	}
}
