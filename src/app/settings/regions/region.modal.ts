// ------------------------------------------------------------------------------
// ----- source.modal.ts -----------------------------------------------
// ------------------------------------------------------------------------------

// copyright:   2017 WiM - USGS
// authors:  Tonia Roddick - USGS Wisconsin Internet Mapping
// purpose: modal component that opens to allow create/edit of source entity

import { Component, ViewChild, Output, EventEmitter, Input } from '@angular/core';

import { FormBuilder, FormGroup, Validators, FormControl, FormArray } from '@angular/forms';
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { ToasterService } from "angular2-toaster/angular2-toaster";
import { IRegion } from "app/shared/interfaces/Region.interface";
import { SettingsService } from "app/settings/settings.service";

@Component({
  selector: 'editregion',
  templateUrl: './region.modal.html'
})

export class EditRegionModal {
    @ViewChild('editRegion') public editRegionModal; // modal for validator
    private modalElement: any;
    public modalRegion: IRegion; // will be the source being edited or 0 for create new
    @Output() updatedRegion = new EventEmitter<IRegion>(); //send back up new/edited source
    public regionForm: FormGroup; //myform
    public CloseResult: any; //why the close the modal (not sure if I need this yet)

    constructor(private _fb: FormBuilder, private _settingsService: SettingsService, private _modalService: NgbModal, private _toastService: ToasterService){
        this.regionForm = _fb.group({
            'id': new FormControl(null),
            'name': new FormControl(null, Validators.required),
            'description': new FormControl(null),
            'shortName': new FormControl(null, Validators.required),
            'fipsCode': new FormControl(null, Validators.required)
        });
    }

    ngOnInit() {
        // subscribe to know when to show the modal
        this._settingsService.showRegionModal.subscribe((show: boolean) => {
            if (show) this.showTheRegionModal();
        });
        // subscribe to get source to show in the modal
        this._settingsService.regionForModal.subscribe((r: IRegion) => {
            this.modalRegion = r;
        });
       
        // set the viewchild modal as the modalelement
        this.modalElement = this.editRegionModal;
    }

    // flag is true to show the modal
    public showTheRegionModal() {
        // populate controls with value or null (edit/create)
        this.regionForm.controls['id'].setValue(this.modalRegion.id ? this.modalRegion.id : null);
        this.regionForm.controls['name'].setValue(this.modalRegion.id ? this.modalRegion.name : null);
        this.regionForm.controls['description'].setValue(this.modalRegion.id ? this.modalRegion.description : null);
        this.regionForm.controls['shortName'].setValue(this.modalRegion.id ? this.modalRegion.shortName : null);    
        this.regionForm.controls['fipsCode'].setValue(this.modalRegion.id ? this.modalRegion.fipsCode : null)
        // open the modal now
        this._modalService.open(this.modalElement, {backdrop: 'static', keyboard: false, size: 'lg'} ).result.then((valid) =>{           
            this.CloseResult = `Closed with: ${valid}`;           
            if (valid){
                //all good 
                let region: IRegion = this.regionForm.value;
                // PUT it (if id exists)
                if (region.id > 0){
                    this._settingsService.putEntity(region.id, region, 'regionsURL')
                        .subscribe((response: IRegion) => {
                            this._toastService.pop('success', 'Success', 'Region was updated.'); 
                            this._settingsService.setModalRegion(null); // clear out the service source that this modal needed
                            this.updatedRegion.emit(response); // emit the edited source
                        }, error => this._toastService.pop('error', 'Error updating Region', error._body.message || error.statusText));
                } else {
                    // POST it
                    this._settingsService.postEntity(region, 'regionsURL')
                        .subscribe((response: IRegion) => {
                            this._toastService.pop('success', 'Success', 'Region was created.'); 
                            this._settingsService.setModalRegion(null); // clear out the service source that this modal needed
                            this.updatedRegion.emit(response); // emit the created source
                        }, error => this._toastService.pop('error', 'Error creating Region', error._body.message || error.statusText));
                }
            }
        }, (reason) => {
            //this.CloseResult = `Dismissed ${this.getDismissReason(reason)}`
        });
    }
}