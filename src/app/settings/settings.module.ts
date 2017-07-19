// ------------------------------------------------------------------------------
// ----- settings.module.ts -----------------------------------------------
// ------------------------------------------------------------------------------

// copyright:   2017 WiM - USGS
// authors:  Tonia Roddick - USGS Wisconsin Internet Mapping
// purpose: settings module for admin users

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { RegionListResolve } from "app/regionList.resolve";
import { SharedModule } from "app/shared/shared.module";
import { PipesModule } from "app/shared/pipes/pipes.module";
import { RegionComponent } from "app/settings/regions/regions.component";
import { SettingsComponent } from "app/settings/settings.component";
import { LookupsComponent } from "app/settings/lookups/lookups.component";
import { SettingsRoutingModule } from "app/settings/settings-routing.module";
import { AllCategoryTypesResolve } from "app/settings/resolves/allcategoryTypes.resolve";
import { AllRegionsResolve } from "app/settings/resolves/allregions.resolve";
import { AllRolesResolve } from "app/settings/resolves/allroles.resolve";
import { AllSourceTypesResolve } from "app/settings/resolves/allsourceTypes.resolve";
import { AllStatusTypesResolve } from "app/settings/resolves/allStatusTypes.resolve";
import { AllUnitTypesResolve } from "app/settings/resolves/allunitTypes.resolve";
import { SettingsService } from "app/settings/settings.service";
import { EditRegionModal } from "app/settings/regions/region.modal";
import { CategoriesComponent } from "app/settings/lookups/lookupParts/category/lookups-categories.component";
import { RolesComponent } from "app/settings/lookups/lookupParts/roles/lookups-roles.component";
import { SourcesComponent } from "app/settings/lookups/lookupParts/sources/lookups-sourcetypes.component";
import { StatusesComponent } from "app/settings/lookups/lookupParts/statuses/lookups-statuses.component";
import { UnitTypesComponent } from "app/settings/lookups/lookupParts/units/lookups-units.component";

@NgModule({
    declarations: [SettingsComponent, RegionComponent, LookupsComponent, EditRegionModal, 
        CategoriesComponent, RolesComponent, SourcesComponent, StatusesComponent, UnitTypesComponent ],
    imports: [CommonModule, FormsModule, ReactiveFormsModule, SharedModule.forRoot(), SettingsRoutingModule, PipesModule],
    exports: [SettingsComponent],
    providers: [SettingsService, AllCategoryTypesResolve, AllRegionsResolve, AllRolesResolve, AllSourceTypesResolve, AllStatusTypesResolve, AllUnitTypesResolve]
})
export class SettingsModule { }
