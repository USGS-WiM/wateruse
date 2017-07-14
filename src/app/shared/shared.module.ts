// ------------------------------------------------------------------------------
// ----- projectlist.module -----------------------------------------------------
// ------------------------------------------------------------------------------

// copyright:   2016 WiM - USGS
//
// authors:  Tonia Roddick USGS Wisconsin Internet Mapping             
//
// purpose: module for the sharing of global stuff 

import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { NgbModule, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { AuthGuard } from 'app/shared/guards/auth.guard';
import { WateruseService } from 'app/shared/services/wateruse.service';
import { LoginService } from 'app/login/login.service';
import { PipesModule } from 'app/shared/pipes/pipes.module';
import { AuthService } from 'app/shared/services/auth.service';
import { numberFormat } from "app/shared/directives/number.directive";


@NgModule({
  declarations: [numberFormat ],
  exports: [ NgbModule,numberFormat ],
  imports: [ CommonModule, NgbModule.forRoot(), FormsModule, PipesModule ]
})

export class SharedModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: SharedModule,
      providers: [ AuthGuard, WateruseService, LoginService, AuthService, NgbActiveModal ]
    }
  }

}
