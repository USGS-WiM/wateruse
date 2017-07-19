// ------------------------------------------------------------------------------
// ----- lookups.component.ts -----------------------------------------------
// ------------------------------------------------------------------------------

// copyright:   2017 WiM - USGS
// authors:  Tonia Roddick - USGS Wisconsin Internet Mapping
// purpose: lookups crud in admin settings page

import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import { SettingsService } from "app/settings/settings.service";
import { InfoModal } from "app/shared/modals/info.modal";
import { ToasterService } from "angular2-toaster/angular2-toaster";
import { FormBuilder, FormGroup, Validators, FormControl, FormArray } from '@angular/forms';
import { AreYouSureModal } from "app/shared/modals/areYouSure.modal";
import { ISourceType } from "app/shared/interfaces/SourceType.interface";

@Component({
    moduleId: module.id,
    templateUrl: 'lookups-sourcetypes.component.html' 
})

export class SourcesComponent implements OnInit {
    @ViewChild('areYouSure') areYouSure: AreYouSureModal;
    @ViewChild('SourceForm') sourceForm;
    @ViewChild('info') infomodal: InfoModal;
    public sourceTypes: Array<ISourceType>;	                 
	public rowBeingEdited: number;    
	private tempData: ISourceType;
    public isEditing: boolean;
    public newSourceTypeForm: FormGroup;
    public showNewSTForm: boolean;
    public deleteID: number;
    public errorMessage: string;

    constructor(private _route: ActivatedRoute, private _settingsService: SettingsService, private _toastService: ToasterService, private _fb: FormBuilder){
        this.newSourceTypeForm = _fb.group({
            'id': new FormControl(null),
            'name': new FormControl(null, Validators.required),
            'description': new FormControl(null),
            'code': new FormControl(null, Validators.required)
        });
    }

    ngOnInit(){
        this.showNewSTForm = false;
        this.rowBeingEdited = -1; //start it off neg  
        this.deleteID = -1;

        this._route.parent.data.subscribe((data: { allSourceTypes: Array<ISourceType> }) => {
            this.sourceTypes = [];
            data.allSourceTypes.forEach((st: ISourceType) => {
                st.isEditing = false;
                this.sourceTypes.push(st);
            });
            this._settingsService.setSourceTypes(this.sourceTypes);
        });
        // when categories get updated 
        this._settingsService.sourcetypes().subscribe((stypes: Array<ISourceType>) => {
            this.sourceTypes = [];
            stypes.forEach((st: ISourceType) => {
                st.isEditing = false;
                this.sourceTypes.push(st);
            });
        });
    } // end ngOnInit()

    // want to edit
	public EditRowClicked(i: number) {
		this.rowBeingEdited = i;
		this.tempData = Object.assign({}, this.sourceTypes[i]); // make a copy in case they cancel
		this.sourceTypes[i].isEditing = true;
		this.isEditing = true; // set to true so create new is disabled
	}

    // nevermind editing
	public CancelEditRowClicked(i: number) {
		this.sourceTypes[i] = Object.assign({}, this.tempData);
		this.sourceTypes[i].isEditing = false;
		this.rowBeingEdited = -1;
		this.isEditing = false; // set to true so create new is disabled
		if (this.sourceForm.form.dirty) this.sourceForm.reset();
	}

    // edits made, save clicked
	public saveSourceType(stype: ISourceType, i: number) {
		if (stype.name == undefined || stype.name == "" || stype.code == undefined || stype.code == "") {
            //don't save it 
            let infoMessage = "Source Type Name and Code are both required."
            this.infomodal.showInfoModal(infoMessage);
		} else {
			delete stype.isEditing;
			this._settingsService.putSourceType(stype.id, stype).subscribe((resp: ISourceType) => {
				this._toastService.pop('success', 'Success', 'Source Type was updated')
				stype.isEditing = false;
				this.sourceTypes[i] = stype;
				this._settingsService.setSourceTypes(this.sourceTypes);
				this.rowBeingEdited = -1;
				this.isEditing = false; // set to true so create new is disabled
				if (this.sourceForm.form.dirty) this.sourceForm.reset();
			});
		}
    }
    
    // create new source Type button click
    public showNewSourceTypeForm(){
        // populate controls with value or null (edit/create)
        this.newSourceTypeForm.controls['name'].setValue(null);
        this.newSourceTypeForm.controls['description'].setValue(null);
        this.newSourceTypeForm.controls['code'].setValue(null);
        this.showNewSTForm = true;
    }

    //post new source type
    public createNewSourceType(){
        let sourceT = this.newSourceTypeForm.value;
        this._settingsService.postSourceType(sourceT).subscribe((response: ISourceType) => {
            response.isEditing = false;
            this.sourceTypes.push(response);
            this._settingsService.setSourceTypes(this.sourceTypes);
            this._toastService.pop('success', 'Success', 'Source Type was created.'); 
            this.cancelCreateSourceType();
        }, error => {                        
            this._toastService.pop('error', 'Error', 'Source Type was not created.'); 
            console.log("error");
        });
    }

    // delete category type
    public deleteSourceType(stID: number){
        // show are you sure modal
        this.areYouSure.showSureModal('Are you sure you want to delete this Source Type?'); // listener is AreYouSureDialogResponse()
        this.deleteID = stID;
    }
    // output emitter function when areYouSure is closed
    public AreYouSureDialogResponse(val: boolean) {
        //if they clicked Yes
        if (val) {
            //delete the Source type
            // get the index to be deleted by the id
            let ind: number = this.getSourceTypeIndex(this.deleteID);
            //delete it
            this._settingsService.deleteSourceType(this.deleteID).subscribe(
                result => {         
                    this._toastService.pop('success', 'Success', 'Source Type deleted.');           
                    this.sourceTypes.splice(ind, 1); //delete from array
                    this._settingsService.setCategories(this.sourceTypes); // update service
                },
                error => {
                    this._toastService.pop('error', 'Error', 'Source Type was not deleted.'); 
                    this.errorMessage = error;                    
                }
            );
        }
    }

     //  get index in sourceTypes based on sourcetype.id value
    private getSourceTypeIndex(stID: number): number {
        let ind: number = -1
        this.sourceTypes.some((sourcetype, index, _ary) => {
            if (sourcetype.id === stID) ind = index;
            return sourcetype.id === stID;
        });
        return ind;
    }

    //cancel or done creating new category, reset stuff
    public cancelCreateSourceType(){
        this.showNewSTForm = false;
        this.newSourceTypeForm.reset();
    }
}
