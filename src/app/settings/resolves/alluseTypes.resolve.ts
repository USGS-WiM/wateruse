// ------------------------------------------------------------------------------
// ----- alluseTypes.resolve --------------------------------------------------
// ------------------------------------------------------------------------------

// copyright:   2018 WiM - USGS
//
// authors:  Katrin Jacobsen USGS Web Informatics and Mapping            
//
// purpose: resolver to get all use types when route is navigated to

import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from "rxjs/Observable";
import { IUseType } from "app/shared/interfaces/Use.interface";
import { SettingsService } from "app/settings/settings.service";

@Injectable()
export class AllUseTypesResolve implements Resolve<Array<IUseType>> {

  constructor(private _settingsService: SettingsService) {}

  // this resolver is not working. I don't know if its the service or the resolver, but the subscribe is returning nothing even though service
  //is getting the full project properly. either keep digging or remove resolver...
  resolve(route: ActivatedRouteSnapshot): Observable<Array<IUseType>> {
     return this._settingsService.getEntities('useTypeURL');
  }
}