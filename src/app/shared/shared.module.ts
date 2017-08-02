// ------------------------------------------------------------------------------
// ----- shared.module -----------------------------------------------------
// ------------------------------------------------------------------------------

// copyright:   2017 WiM - USGS
// authors:  Tonia Roddick - USGS Wisconsin Internet Mapping
// purpose: module for the sharing of global stuff 

import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { NgbModule, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { HotTableModule } from 'ng2-handsontable';
import {ToasterModule, ToasterService} from 'angular2-toaster';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AuthGuard } from 'app/shared/guards/auth.guard';
import { WateruseService } from 'app/shared/services/wateruse.service';
import { LoginService } from 'app/login/login.service';
import { PipesModule } from 'app/shared/pipes/pipes.module';
import { AuthService } from 'app/shared/services/auth.service';
import { numberFormat } from "app/shared/directives/number.directive";
import { AreYouSureModal } from "app/shared/modals/areYouSure.modal";
import { InfoModal } from "app/shared/modals/info.modal";
import { LoadingService } from "app/shared/services/loading.service";
import { WangularModule } from 'wangular';

@NgModule({
  declarations: [numberFormat, AreYouSureModal, InfoModal ],
  exports: [ NgbModule,numberFormat, AreYouSureModal, InfoModal, HotTableModule, ToasterModule, WangularModule ],
  imports: [ CommonModule, BrowserAnimationsModule, NgbModule.forRoot(), FormsModule, PipesModule, HotTableModule, ToasterModule ]
})

export class SharedModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: SharedModule,
      providers: [ AuthGuard, WateruseService, LoginService, AuthService, NgbActiveModal, LoadingService ]
    }
  }

}
