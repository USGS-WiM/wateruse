import { Injectable } from '@angular/core';
import { BehaviorSubject } from "rxjs/BehaviorSubject";
import { ISource } from "app/shared/interfaces/Source.interface";

@Injectable()
export class HomeService {
    // modal for editing source
    private _sourceModalSubj: BehaviorSubject<boolean> = <BehaviorSubject<boolean>>new BehaviorSubject(false);
    public setSourceModal(val: any) {
        this._sourceModalSubj.next(val);
    }
    public get showSourceModal(): any {
        return this._sourceModalSubj.asObservable();
    }
    // source for the modal
    private _modalSourceSubj: BehaviorSubject<ISource> = <BehaviorSubject<ISource>>new BehaviorSubject({});
    public setModalSource(val: any) {
        this._modalSourceSubj.next(val);
    }
    public get sourceForModal(): any {
        return this._modalSourceSubj.asObservable();
    }
}