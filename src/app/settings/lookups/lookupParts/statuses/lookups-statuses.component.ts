// ------------------------------------------------------------------------------
// ----- lookups-categories.component.ts -----------------------------------------------
// ------------------------------------------------------------------------------

// copyright:   2017 WiM - USGS
// authors:  Tonia Roddick - USGS Wisconsin Internet Mapping
// purpose: lookups crud in admin settings page for category type

import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import { SettingsService } from "app/settings/settings.service";
import { InfoModal } from "app/shared/modals/info.modal";
import { ToasterService } from "angular2-toaster/angular2-toaster";
import { FormBuilder, FormGroup, Validators, FormControl, FormArray } from '@angular/forms';
import { AreYouSureModal } from "app/shared/modals/areYouSure.modal";
import { IStatusType } from "app/shared/interfaces/StatusType.interface";

@Component({
    moduleId: module.id,
    templateUrl: 'lookups-statuses.component.html' 
})

export class StatusesComponent implements OnInit {
    @ViewChild('areYouSure') areYouSure: AreYouSureModal;
    @ViewChild('StatusTypeForm') statusForm;
    @ViewChild('info') infomodal: InfoModal;
    public statusTypes: Array<IStatusType>;	                 
	public rowBeingEdited: number;    
	private tempData: IStatusType;
    public isEditing: boolean;
    public newStatusTypeForm: FormGroup;
    public showNewStatusTypeForm: boolean;
    public deleteID: number;

    constructor(private _route: ActivatedRoute, private _settingsService: SettingsService, private _toastService: ToasterService, private _fb: FormBuilder){
        this.newStatusTypeForm = _fb.group({
            'id': new FormControl(null),
            'name': new FormControl(null, Validators.required),
            'description': new FormControl(null),
            'code': new FormControl(null, Validators.required)
        });
    }

    ngOnInit(){
        this.showNewStatusTypeForm = false;
        this.rowBeingEdited = -1; //start it off neg  
        this.deleteID = -1;

        this._route.parent.data.subscribe((data: { allStatusTypes: Array<IStatusType> }) => {
            this.statusTypes = [];
            data.allStatusTypes.forEach((stat: IStatusType) => {
                stat.isEditing = false;
                this.statusTypes.push(stat);
            });
            this._settingsService.setStatusTypes(this.statusTypes);
        });
        // when categories get updated 
        this._settingsService.statustypes().subscribe((c: Array<IStatusType>) => {
            this.statusTypes = [];
            c.forEach((ct: IStatusType) => {
                ct.isEditing = false;
                this.statusTypes.push(ct);
            });
        });
    } // end ngOnInit()

    // want to edit
	public EditRowClicked(i: number) {
		this.rowBeingEdited = i;
		this.tempData = Object.assign({}, this.statusTypes[i]); // make a copy in case they cancel
		this.statusTypes[i].isEditing = true;
		this.isEditing = true; // set to true so create new is disabled
	}

    // nevermind editing
	public CancelEditRowClicked(i: number) {
		this.statusTypes[i] = Object.assign({}, this.tempData);
		this.statusTypes[i].isEditing = false;
		this.rowBeingEdited = -1;
		this.isEditing = false; // set to true so create new is disabled
		if (this.statusForm.form.dirty) this.statusForm.reset();
	}

    // edits made, save clicked
	public saveStatusType(c: IStatusType, i: number) {
		if (c.name == undefined || c.name == "" || c.code == undefined || c.code == "") {
            //don't save it 
            let infoMessage = "Status Type Name and Code are both required."
            this.infomodal.showInfoModal(infoMessage);
		} else {
			delete c.isEditing;
            this._settingsService.putEntity(c.id, c, 'STATUSTYPES_URL')
                .subscribe((resp: IStatusType) => {
                    this._toastService.pop('success', 'Success', 'Status Type was updated')
                    c.isEditing = false;
                    this.statusTypes[i] = c;
                    this._settingsService.setStatusTypes(this.statusTypes);
                    this.rowBeingEdited = -1;
                    this.isEditing = false; // set to true so create new is disabled
                    if (this.statusForm.form.dirty) this.statusForm.reset();
                }, error => this._toastService.pop("error", "Error updating Status Type", error._body.message || error.statusText));
		}
    }
    
    // create new Status Type button click
    public showNewStatForm(){
        // populate controls with value or null (edit/create)
        this.newStatusTypeForm.controls['name'].setValue(null);
        this.newStatusTypeForm.controls['description'].setValue(null);
        this.newStatusTypeForm.controls['code'].setValue(null);
        this.showNewStatusTypeForm = true;
    }

    //post new category type
    public createNewStatusType(){
        let stat = this.newStatusTypeForm.value;
        this._settingsService.postEntity(stat, 'STATUSTYPES_URL')
            .subscribe((response: IStatusType) => {            
                response.isEditing = false;
                this.statusTypes.push(response);
                this._settingsService.setStatusTypes(this.statusTypes);
                this._toastService.pop('success', 'Success', 'Status Type was created.'); 
                this.cancelCreateStatusType();
            }, error => this._toastService.pop('error', 'Error creating Statu Type', error._body.message || error.statusText));
    }

    // delete category type
    public deleteStatusType(catID: number){
        // show are you sure modal
        this.areYouSure.showSureModal('Are you sure you want to delete this Status Type?'); // listener is AreYouSureDialogResponse()
        this.deleteID = catID;
    }
    // output emitter function when areYouSure is closed
    public AreYouSureDialogResponse(val: boolean) {
        //if they clicked Yes
        if (val) {
            //delete the category type
            // get the index to be deleted by the id
            let ind: number = this.getStatusIndex(this.deleteID);
            //delete it
            this._settingsService.deleteEntity(this.deleteID, 'STATUSTYPES_URL')
                .subscribe(result => {         
                    this._toastService.pop('success', 'Success', 'Status Type deleted.');           
                    this.statusTypes.splice(ind, 1); //delete from array
                    this._settingsService.setCategories(this.statusTypes); // update service
                }, error => this._toastService.pop('error', 'Error deleting Status Type', error._body.message || error.statusText));
        }
    }

     //  get index in regionList based on region.id value
    private getStatusIndex(cID: number): number {
        let ind: number = -1
        this.statusTypes.some((ct, index, _ary) => {
            if (ct.id === cID) ind = index;
            return ct.id === cID;
        });
        return ind;
    }

    //cancel or done creating new category, reset stuff
    public cancelCreateStatusType(){
        this.showNewStatusTypeForm = false;
        this.newStatusTypeForm.reset();
    }
}
