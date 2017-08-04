// ------------------------------------------------------------------------------
// ----- allregions.resolve --------------------------------------------------
// ------------------------------------------------------------------------------

// copyright:   2016 WiM - USGS
//
// authors:  Tonia Roddick USGS Wisconsin Internet Mapping             
//
// purpose: resolver to get all regions when route is navigated to

import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from "rxjs/Observable";
import { IUnitType } from "app/shared/interfaces/UnitType.interface";
import { SettingsService } from "app/settings/settings.service";

@Injectable()
export class AllUnitTypesResolve implements Resolve<Array<IUnitType>> {

  constructor(private _settingsService: SettingsService) {}

  // this resolver is not working. I don't know if its the service or the resolver, but the subscribe is returning nothing even though service
  //is getting the full project properly. either keep digging or remove resolver...
  resolve(route: ActivatedRouteSnapshot): Observable<Array<IUnitType>> {
     return this._settingsService.getEntities('unitTypesURL');
  }
}