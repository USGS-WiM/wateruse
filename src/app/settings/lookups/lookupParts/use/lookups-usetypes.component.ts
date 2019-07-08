// ------------------------------------------------------------------------------
// ----- lookups-usetypes.component.ts -----------------------------------------------
// ------------------------------------------------------------------------------

// copyright:   2018 WiM - USGS
// authors:  Katrin Jacobsen - USGS Web Informatics and Mapping
// purpose: lookups crud in admin settings page for use type

import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import { IUseType } from "app/shared/interfaces/Use.interface";
import { SettingsService } from "app/settings/settings.service";
import { InfoModal } from "app/shared/modals/info.modal";
import { ToasterService } from "angular2-toaster/angular2-toaster";
import { FormBuilder, FormGroup, Validators, FormControl, FormArray } from '@angular/forms';
import { AreYouSureModal } from "app/shared/modals/areYouSure.modal";

@Component({
    moduleId: module.id,
    templateUrl: 'lookups-usetypes.component.html' 
})

export class UseTypesComponent implements OnInit {
    @ViewChild('areYouSure') areYouSure: AreYouSureModal;
    @ViewChild('UseForm') useForm;
    @ViewChild('info') infomodal: InfoModal;
    public useTypes: Array<IUseType>;	                 
	public rowBeingEdited: number;    
	private tempData: IUseType;
    public isEditing: boolean;
    public newUseForm: FormGroup;
    public showNewUseForm: boolean;
    public deleteID: number;

    constructor(private _route: ActivatedRoute, private _settingsService: SettingsService, private _toastService: ToasterService, private _fb: FormBuilder){
        this.newUseForm = _fb.group({
            'id': new FormControl(null),
            'name': new FormControl(null, Validators.required),
            'description': new FormControl(null),
            'code': new FormControl(null, Validators.required)
        });
    }

    ngOnInit(){
        this.showNewUseForm = false;
        this.rowBeingEdited = -1; //start it off neg  
        this.deleteID = -1;

        this._route.data.subscribe((data: { allUseTypes: Array<IUseType> }) => {
            this.useTypes = [];
            data.allUseTypes.forEach((ct: IUseType) => {
                ct.isEditing = false;
                this.useTypes.push(ct);
            });
            this._settingsService.setUseTypes(this.useTypes);
        });
        // when usetypes get updated 
        this._settingsService.usetypes().subscribe((u: Array<IUseType>) => {
            this.useTypes = [];
            u.forEach((ut: IUseType) => {
                ut.isEditing = false;
                this.useTypes.push(ut);
            });
        });
    } // end ngOnInit()

    // want to edit
	public EditRowClicked(i: number) {
		this.rowBeingEdited = i;
		this.tempData = Object.assign({}, this.useTypes[i]); // make a copy in case they cancel
		this.useTypes[i].isEditing = true;
		this.isEditing = true; // set to true so create new is disabled
	}

    // nevermind editing
	public CancelEditRowClicked(i: number) {
		this.useTypes[i] = Object.assign({}, this.tempData);
		this.useTypes[i].isEditing = false;
		this.rowBeingEdited = -1;
		this.isEditing = false; // set to true so create new is disabled
		if (this.useForm.form.dirty) this.useForm.reset();
	}

    // edits made, save clicked
	public saveUse(c: IUseType, i: number) {
		if (c.name == undefined || c.name == "" || c.code == undefined || c.code == "") {
            //don't save it 
            let infoMessage = "Use Type Name and Code are both required."
            this.infomodal.showInfoModal(infoMessage);
		} else {
            delete c.isEditing;
            this._settingsService.putEntity(c.id, c, 'useTypeURL')
                .subscribe((resp: IUseType) => {
                    this._toastService.pop('success', 'Success', 'Use Type was updated')
                    c.isEditing = false;
                    this.useTypes[i] = c;
                    this._settingsService.setUseTypes(this.useTypes);
                    this.rowBeingEdited = -1;
                    this.isEditing = false; // set to true so create new is disabled
                    if (this.useForm.form.dirty) this.useForm.reset();
                }, error => this._toastService.pop("error", "Error updating Use Type", error._body.message || error.statusText));
		}
    }
    
    // create new use Type button click
    public showNewUseTypeForm(){
        // populate controls with value or null (edit/create)
        this.newUseForm.controls['name'].setValue(null);
        this.newUseForm.controls['description'].setValue(null);
        this.newUseForm.controls['code'].setValue(null);
        this.showNewUseForm = true;
    }

    //post new use type
    public createNewUseType(){
        let use = this.newUseForm.value;
        this._settingsService.postEntity(use, 'useTypeURL')
            .subscribe((response: IUseType) => {
                response.isEditing = false;
                this.useTypes.push(response);
                this._settingsService.setUseTypes(this.useTypes);
                this._toastService.pop('success', 'Success', 'Use Type was created.'); 
                this.cancelCreateUseType();
            }, error => this._toastService.pop('error', 'Error creating Use Type', error._body.message || error.statusText));
    }

    // delete use type
    public deleteUse(useID: number){
        // show are you sure modal
        this.areYouSure.showSureModal('Are you sure you want to delete this Use Type?'); // listener is AreYouSureDialogResponse()
        this.deleteID = useID;
    }
    // output emitter function when areYouSure is closed
    public AreYouSureDialogResponse(val: boolean) {
        //if they clicked Yes
        if (val) {
            //delete the use type
            // get the index to be deleted by the id
            let ind: number = this.getUseTypeIndex(this.deleteID);
            //delete it
            this._settingsService.deleteEntity(this.deleteID, 'useTypeURL')
                .subscribe(result => {         
                    this._toastService.pop('success', 'Success', 'Use Type deleted.');           
                    this.useTypes.splice(ind, 1); //delete from array
                    this._settingsService.setUseTypes(this.useTypes); // update service
                }, error => this._toastService.pop('error', 'Error Deleting Use Type', error._body.message || error.statusText));
        }
    }

     //  get index in regionList based on region.id value
    private getUseTypeIndex(uID: number): number {
        let ind: number = -1
        this.useTypes.some((ut, index, _ary) => {
            if (ut.id === uID) ind = index;
            return ut.id === uID;
        });
        return ind;
    }

    //cancel or done creating new use types, reset stuff
    public cancelCreateUseType(){
        this.showNewUseForm = false;
        this.newUseForm.reset();
    }
}
