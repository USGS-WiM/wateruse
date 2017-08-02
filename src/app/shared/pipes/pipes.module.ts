// ------------------------------------------------------------------------------
// ----- pipes.module ---------------------------------------------------
// ------------------------------------------------------------------------------

// copyright:   2017 WiM - USGS
// authors:  Tonia Roddick USGS Wisconsin Internet Mapping
// purpose: Module for the Pipes used in the app

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
//import { ArraySortPipe } from "app/shared/pipes/order.pipe";
import { FilterPipe } from "app/shared/pipes/filter.pipe";
import { IdFilterPipe } from "app/shared/pipes/filterbyid.pipe";

@NgModule({
  imports: [ CommonModule],
  declarations: [  FilterPipe, IdFilterPipe ],//ArraySortPipe,
  exports: [ FilterPipe, IdFilterPipe ],//ArraySortPipe
  providers: []
})
export class PipesModule { }
