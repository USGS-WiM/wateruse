// ------------------------------------------------------------------------------
// ----- lookups-units.component.ts -----------------------------------------------
// ------------------------------------------------------------------------------

// copyright:   2017 WiM - USGS
// authors:  Tonia Roddick - USGS Wisconsin Internet Mapping
// purpose: lookups crud in admin settings page for unit types

import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import { SettingsService } from "app/settings/settings.service";
import { InfoModal } from "app/shared/modals/info.modal";
import { ToasterService } from "angular2-toaster/angular2-toaster";
import { FormBuilder, FormGroup, Validators, FormControl, FormArray } from '@angular/forms';
import { AreYouSureModal } from "app/shared/modals/areYouSure.modal";
import { IUnitType } from "app/shared/interfaces/UnitType.interface";

@Component({
    moduleId: module.id,
    templateUrl: 'lookups-units.component.html' 
})

export class UnitTypesComponent implements OnInit {   
	@ViewChild('areYouSure') areYouSure: AreYouSureModal;
    @ViewChild('UnitsForm') unitsForm;
    @ViewChild('info') infomodal: InfoModal;
    public unitTypes: Array<IUnitType>;
	public rowBeingEdited: number;    
	private tempData: IUnitType;
    public isEditing: boolean;
    public newUnitForm: FormGroup;
    public showNewUnitForm: boolean;
    public deleteID: number;
    public errorMessage: string;

    constructor(private _route: ActivatedRoute, private _settingsService: SettingsService, private _toastService: ToasterService, private _fb: FormBuilder){
        this.newUnitForm = _fb.group({
            'id': new FormControl(null),
            'name': new FormControl(null, Validators.required),
            'abbreviation': new FormControl(null, Validators.required)
        });
    }

    ngOnInit(){
        this.showNewUnitForm = false;
        this.rowBeingEdited = -1; //start it off neg  
        this.deleteID = -1;

        this._route.parent.data.subscribe((data: { allUnitTypes: Array<IUnitType> }) => {
            this.unitTypes = [];
            data.allUnitTypes.forEach((u: IUnitType) => {
                u.isEditing = false;
                this.unitTypes.push(u);
            });
            this._settingsService.setUnitTypes(this.unitTypes);
        });
        // when unit types get updated 
        this._settingsService.unittypes().subscribe((units: Array<IUnitType>) => {
            this.unitTypes = [];
            units.forEach((u: IUnitType) => {
                u.isEditing = false;
                this.unitTypes.push(u);
            });
        });
    } // end ngOnInit()

    // want to edit
	public EditRowClicked(i: number) {
		this.rowBeingEdited = i;
		this.tempData = Object.assign({}, this.unitTypes[i]); // make a copy in case they cancel
		this.unitTypes[i].isEditing = true;
		this.isEditing = true; // set to true so create new is disabled
	}

    // nevermind editing
	public CancelEditRowClicked(i: number) {
		this.unitTypes[i] = Object.assign({}, this.tempData);
		this.unitTypes[i].isEditing = false;
		this.rowBeingEdited = -1;
		this.isEditing = false; // set to true so create new is disabled
		if (this.unitsForm.form.dirty) this.unitsForm.reset();
	}

    // edits made, save clicked
	public saveUnitType(u: IUnitType, i: number) {
		if (u.name == undefined || u.name == "" || u.abbreviation == undefined || u.abbreviation == "") {
            //don't save it 
            let infoMessage = "Unit Type Name and Abbreviation are both required."
            this.infomodal.showInfoModal(infoMessage);
		} else {
			delete u.isEditing;
			this._settingsService.putUnitType(u.id, u).subscribe((resp: IUnitType) => {
				this._toastService.pop('success', 'Success', 'Unit Type was updated')
				u.isEditing = false;
				this.unitTypes[i] = u;
				this._settingsService.setUnitTypes(this.unitTypes);
				this.rowBeingEdited = -1;
				this.isEditing = false; // set to true so create new is disabled
				if (this.unitsForm.form.dirty) this.unitsForm.reset();
			});
		}
    }
    
    // create new category Type button click
    public showTheNewUnitTypeForm(){
        // populate controls with value or null (edit/create)
        this.newUnitForm.controls['name'].setValue(null);
        this.newUnitForm.controls['abbreviation'].setValue(null);
        this.showNewUnitForm = true;
    }

    //post new category type
    public createNewUnitType(){
        let utype = this.newUnitForm.value;
        this._settingsService.postUnitType(utype).subscribe((response: IUnitType) => {
            response.isEditing = false;
            this.unitTypes.push(response);
            this._settingsService.setUnitTypes(this.unitTypes);
            this._toastService.pop('success', 'Success', 'Unit Type was created.'); 
            this.cancelCreateUnitType();
        }, error => {                        
            this._toastService.pop('error', 'Error', 'Unit Type was not created.'); 
            console.log("error");
        });
    }

    // delete role
    public deleteUnitType(rID: number){
        // show are you sure modal
        this.areYouSure.showSureModal('Are you sure you want to delete this Unit Type?'); // listener is AreYouSureDialogResponse()
        this.deleteID = rID;
    }
    // output emitter function when areYouSure is closed
    public AreYouSureDialogResponse(val: boolean) {
        //if they clicked Yes
        if (val) {
            //delete the role
            // get the index to be deleted by the id
            let ind: number = this.getUnitTypeIndex(this.deleteID);
            //delete it
            this._settingsService.deleteUnitType(this.deleteID).subscribe(
                result => {         
                    this._toastService.pop('success', 'Success', 'Unit Type deleted.');           
                    this.unitTypes.splice(ind, 1); //delete from array
                    this._settingsService.setUnitTypes(this.unitTypes); // update service
                },
                error => {
                    this._toastService.pop('error', 'Error', 'Unit Type was not deleted.'); 
                    this.errorMessage = error;                    
                }
            );
        }
    }

     //  get index in unittypes based on unittype.id value
    private getUnitTypeIndex(uID: number): number {
        let ind: number = -1
        this.unitTypes.some((ut, index, _ary) => {
            if (ut.id === uID) ind = index;
            return ut.id === uID;
        });
        return ind;
    }

    //cancel or done creating new category, reset stuff
    public cancelCreateUnitType(){
        this.showNewUnitForm = false;
        this.newUnitForm.reset();
    }
}
