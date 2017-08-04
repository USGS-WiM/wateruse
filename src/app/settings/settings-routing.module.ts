// ------------------------------------------------------------------------------
// ----- settings-routing.module -------------------------------------------
// ------------------------------------------------------------------------------

// copyright:   2016 WiM - USGS
// authors:  Tonia Roddick USGS Wisconsin Internet Mapping
// purpose: routes for the settings module (parent/children)

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SettingsComponent } from "app/settings/settings.component";
import { AuthGuard } from "app/shared/guards/auth.guard";
import { AllRegionsResolve } from "app/settings/resolves/allregions.resolve";
import { AllSourceTypesResolve } from "app/settings/resolves/allsourceTypes.resolve";
import { AllCategoryTypesResolve } from "app/settings/resolves/allcategoryTypes.resolve";
import { AllUnitTypesResolve } from "app/settings/resolves/allunitTypes.resolve";
import { AllStatusTypesResolve } from "app/settings/resolves/allStatusTypes.resolve";
import { AllRolesResolve } from "app/settings/resolves/allroles.resolve";
import { LookupsComponent } from "app/settings/lookups/lookups.component";
import { RegionComponent } from "app/settings/regions/regions.component";
import { CategoriesComponent } from "app/settings/lookups/lookupParts/category/lookups-categories.component";
import { SourcesComponent } from "app/settings/lookups/lookupParts/sources/lookups-sourcetypes.component";
import { StatusesComponent } from "app/settings/lookups/lookupParts/statuses/lookups-statuses.component";
import { UnitTypesComponent } from "app/settings/lookups/lookupParts/units/lookups-units.component";
import { RolesComponent } from "app/settings/lookups/lookupParts/roles/lookups-roles.component";

const settingsRoutes: Routes = [
	{
		path: 'settings',
		component: SettingsComponent,
		canActivate: [AuthGuard]
	},
	{
		path: 'settings/regions',
		component: RegionComponent,
		resolve: {
			allRegions: AllRegionsResolve
		}   
	},
	{
		path: 'settings/lookups',
		component: LookupsComponent,
		/*resolve: {
			//allCategoryTypes: AllCategoryTypesResolve,
			//allRoles: AllRolesResolve,
			//allSourceTypes: AllSourceTypesResolve,
			allStatusTypes: AllStatusTypesResolve,
			allUnitTypes: AllUnitTypesResolve
		},*/
		canActivateChild: [AuthGuard],
		children: [
			{
				path: 'categories',
				component: CategoriesComponent,
				resolve: {
					allCategoryTypes: AllCategoryTypesResolve
				}		
			},
			{
				path: 'roles',
				component: RolesComponent,
				resolve: {allRoles: AllRolesResolve}			
			},
			{
				path: 'sourcetypes',
				component: SourcesComponent,
				resolve: {allSourceTypes: AllSourceTypesResolve}			
			},
			{
				path: 'status',
				component: StatusesComponent,
				resolve: {allStatusTypes: AllStatusTypesResolve}	
			},
			{
				path: 'unittypes',
				component: UnitTypesComponent,
				resolve: {allUnitTypes: AllUnitTypesResolve}					
			}
    	]
	}			 
];

@NgModule({
	imports: [
		RouterModule.forChild(settingsRoutes)
	],
	exports: [
		RouterModule
	]
})
export class SettingsRoutingModule { }
/*,
				resolve: {
					allSourceTypes: AllSourceTypesResolve,
					allCategoryTypes: AllCategoryTypesResolve,
					allUnitTypes: AllUnitTypesResolve,
					allStatusTypes: AllStatusTypesResolve,
					allRoles: AllRolesResolve					
				}*/