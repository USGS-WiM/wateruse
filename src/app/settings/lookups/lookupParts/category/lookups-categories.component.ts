// ------------------------------------------------------------------------------
// ----- lookups-categories.component.ts -----------------------------------------------
// ------------------------------------------------------------------------------

// copyright:   2017 WiM - USGS
// authors:  Tonia Roddick - USGS Wisconsin Internet Mapping
// purpose: lookups crud in admin settings page for category type

import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import { ICategoryType } from "app/shared/interfaces/Category.interface";
import { SettingsService } from "app/settings/settings.service";
import { InfoModal } from "app/shared/modals/info.modal";
import { ToasterService } from "angular2-toaster/angular2-toaster";
import { FormBuilder, FormGroup, Validators, FormControl, FormArray } from '@angular/forms';
import { AreYouSureModal } from "app/shared/modals/areYouSure.modal";

@Component({
    moduleId: module.id,
    templateUrl: 'lookups-categories.component.html' 
})

export class CategoriesComponent implements OnInit {
    @ViewChild('areYouSure') areYouSure: AreYouSureModal;
    @ViewChild('CategoryForm') categoryForm;
    @ViewChild('info') infomodal: InfoModal;
    public categoryTypes: Array<ICategoryType>;	                 
	public rowBeingEdited: number;    
	private tempData: ICategoryType;
    public isEditing: boolean;
    public newCatForm: FormGroup;
    public showNewCatForm: boolean;
    public deleteID: number;

    constructor(private _route: ActivatedRoute, private _settingsService: SettingsService, private _toastService: ToasterService, private _fb: FormBuilder){
        this.newCatForm = _fb.group({
            'id': new FormControl(null),
            'name': new FormControl(null, Validators.required),
            'description': new FormControl(null),
            'code': new FormControl(null, Validators.required)
        });
    }

    ngOnInit(){
        this.showNewCatForm = false;
        this.rowBeingEdited = -1; //start it off neg  
        this.deleteID = -1;

        this._route.parent.data.subscribe((data: { allCategoryTypes: Array<ICategoryType> }) => {
            this.categoryTypes = [];
            data.allCategoryTypes.forEach((ct: ICategoryType) => {
                ct.isEditing = false;
                this.categoryTypes.push(ct);
            });
            this._settingsService.setCategories(this.categoryTypes);
        });
        // when categories get updated 
        this._settingsService.categorytypes().subscribe((c: Array<ICategoryType>) => {
            this.categoryTypes = [];
            c.forEach((ct: ICategoryType) => {
                ct.isEditing = false;
                this.categoryTypes.push(ct);
            });
        });
    } // end ngOnInit()

    // want to edit
	public EditRowClicked(i: number) {
		this.rowBeingEdited = i;
		this.tempData = Object.assign({}, this.categoryTypes[i]); // make a copy in case they cancel
		this.categoryTypes[i].isEditing = true;
		this.isEditing = true; // set to true so create new is disabled
	}

    // nevermind editing
	public CancelEditRowClicked(i: number) {
		this.categoryTypes[i] = Object.assign({}, this.tempData);
		this.categoryTypes[i].isEditing = false;
		this.rowBeingEdited = -1;
		this.isEditing = false; // set to true so create new is disabled
		if (this.categoryForm.form.dirty) this.categoryForm.reset();
	}

    // edits made, save clicked
	public saveCategory(c: ICategoryType, i: number) {
		if (c.name == undefined || c.name == "" || c.code == undefined || c.code == "") {
            //don't save it 
            let infoMessage = "Category Type Name and Code are both required."
            this.infomodal.showInfoModal(infoMessage);
		} else {
            delete c.isEditing;
            this._settingsService.putEntity(c.id, c, 'CATEGORYTYPES_URL')
                .subscribe((resp: ICategoryType) => {
                    this._toastService.pop('success', 'Success', 'Category Type was updated')
                    c.isEditing = false;
                    this.categoryTypes[i] = c;
                    this._settingsService.setCategories(this.categoryTypes);
                    this.rowBeingEdited = -1;
                    this.isEditing = false; // set to true so create new is disabled
                    if (this.categoryForm.form.dirty) this.categoryForm.reset();
                }, error => this._toastService.pop("error", "Error updating Category Type", error.statusText));
		}
    }
    
    // create new category Type button click
    public showNewCategoryForm(){
        // populate controls with value or null (edit/create)
        this.newCatForm.controls['name'].setValue(null);
        this.newCatForm.controls['description'].setValue(null);
        this.newCatForm.controls['code'].setValue(null);
        this.showNewCatForm = true;
    }

    //post new category type
    public createNewCategory(){
        let category = this.newCatForm.value;
        this._settingsService.postEntity(category, 'CATEGORYTYPES_URL')
            .subscribe((response: ICategoryType) => {
                response.isEditing = false;
                this.categoryTypes.push(response);
                this._settingsService.setCategories(this.categoryTypes);
                this._toastService.pop('success', 'Success', 'Category Type was created.'); 
                this.cancelCreateCategory();
            }, error => this._toastService.pop('error', 'Error creating Category Type', error.statusText));
    }

    // delete category type
    public deleteCategory(catID: number){
        // show are you sure modal
        this.areYouSure.showSureModal('Are you sure you want to delete this Category Type?'); // listener is AreYouSureDialogResponse()
        this.deleteID = catID;
    }
    // output emitter function when areYouSure is closed
    public AreYouSureDialogResponse(val: boolean) {
        //if they clicked Yes
        if (val) {
            //delete the category type
            // get the index to be deleted by the id
            let ind: number = this.getCategoryIndex(this.deleteID);
            //delete it
            this._settingsService.deleteEntity(this.deleteID, 'CATEGORYTYPES_URL')
                .subscribe(result => {         
                    this._toastService.pop('success', 'Success', 'Category Type deleted.');           
                    this.categoryTypes.splice(ind, 1); //delete from array
                    this._settingsService.setCategories(this.categoryTypes); // update service
                }, error => this._toastService.pop('error', 'Error Deleting Category Type', error.statusText));
        }
    }

     //  get index in regionList based on region.id value
    private getCategoryIndex(cID: number): number {
        let ind: number = -1
        this.categoryTypes.some((ct, index, _ary) => {
            if (ct.id === cID) ind = index;
            return ct.id === cID;
        });
        return ind;
    }

    //cancel or done creating new category, reset stuff
    public cancelCreateCategory(){
        this.showNewCatForm = false;
        this.newCatForm.reset();
    }
}
