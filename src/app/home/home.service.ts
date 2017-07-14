// ------------------------------------------------------------------------------
// ----- home.service.ts -----------------------------------------------
// ------------------------------------------------------------------------------

// copyright:   2017 WiM - USGS
// authors:  Tonia Roddick - USGS Wisconsin Internet Mapping
// purpose: service for storing modal source entity and communicate to open source.modal from home.component

import { Injectable } from '@angular/core';
import { BehaviorSubject } from "rxjs/BehaviorSubject";
import { ISource } from "app/shared/interfaces/Source.interface";

@Injectable()
export class HomeService {
    // modal for editing source
    private _sourceModalSubj: BehaviorSubject<boolean> = <BehaviorSubject<boolean>>new BehaviorSubject(false);
    // setter
    public setSourceModal(val: any) {
        this._sourceModalSubj.next(val);
    }
    //getter
    public get showSourceModal(): any {
        return this._sourceModalSubj.asObservable();
    }

    // source for the modal
    private _modalSourceSubj: BehaviorSubject<ISource> = <BehaviorSubject<ISource>>new BehaviorSubject({});
    // setter
    public setModalSource(val: any) {
        this._modalSourceSubj.next(val);
    }
    // getter
    public get sourceForModal(): any {
        return this._modalSourceSubj.asObservable();
    }
}