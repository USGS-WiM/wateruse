// ------------------------------------------------------------------------------
// ----- lookups-roles.component.ts -----------------------------------------------
// ------------------------------------------------------------------------------

// copyright:   2017 WiM - USGS
// authors:  Tonia Roddick - USGS Wisconsin Internet Mapping
// purpose: lookups crud in admin settings page for roles

import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import { SettingsService } from "app/settings/settings.service";
import { InfoModal } from "app/shared/modals/info.modal";
import { ToasterService } from "angular2-toaster/angular2-toaster";
import { FormBuilder, FormGroup, Validators, FormControl, FormArray } from '@angular/forms';
import { AreYouSureModal } from "app/shared/modals/areYouSure.modal";
import { IRoles } from "app/shared/interfaces/Roles.interface";

@Component({
    moduleId: module.id,
    templateUrl: 'lookups-roles.component.html' 
})
export class RolesComponent implements OnInit {
    @ViewChild('areYouSure') areYouSure: AreYouSureModal;
    @ViewChild('RolesForm') rolesForm;
    @ViewChild('info') infomodal: InfoModal;
    public rolesList: Array<IRoles>;	                 
	public rowBeingEdited: number;    
	private tempData: IRoles;
    public isEditing: boolean;
    public newRoleForm: FormGroup;
    public showNewRoleForm: boolean;
    public deleteID: number;
    public errorMessage: string;

    constructor(private _route: ActivatedRoute, private _settingsService: SettingsService, private _toastService: ToasterService, private _fb: FormBuilder){
        this.newRoleForm = _fb.group({
            'id': new FormControl(null),
            'name': new FormControl(null, Validators.required),
            'description': new FormControl(null, Validators.required)
        });
    }

    ngOnInit(){
        this.showNewRoleForm = false;
        this.rowBeingEdited = -1; //start it off neg  
        this.deleteID = -1;

        this._route.parent.data.subscribe((data: { allRoles: Array<IRoles> }) => {
            this.rolesList = [];
            data.allRoles.forEach((r: IRoles) => {
                r.isEditing = false;
                this.rolesList.push(r);
            });
            this._settingsService.setRoles(this.rolesList);
        });
        // when categories get updated 
        this._settingsService.roles().subscribe((roles: Array<IRoles>) => {
            this.rolesList = [];
            roles.forEach((r: IRoles) => {
                r.isEditing = false;
                this.rolesList.push(r);
            });
        });
    } // end ngOnInit()

    // want to edit
	public EditRowClicked(i: number) {
		this.rowBeingEdited = i;
		this.tempData = Object.assign({}, this.rolesList[i]); // make a copy in case they cancel
		this.rolesList[i].isEditing = true;
		this.isEditing = true; // set to true so create new is disabled
	}

    // nevermind editing
	public CancelEditRowClicked(i: number) {
		this.rolesList[i] = Object.assign({}, this.tempData);
		this.rolesList[i].isEditing = false;
		this.rowBeingEdited = -1;
		this.isEditing = false; // set to true so create new is disabled
		if (this.rolesForm.form.dirty) this.rolesForm.reset();
	}

    // edits made, save clicked
	public saveRole(r: IRoles, i: number) {
		if (r.name == undefined || r.name == "" || r.description == undefined || r.description == "") {
            //don't save it 
            let infoMessage = "Role Name and Description are both required."
            this.infomodal.showInfoModal(infoMessage);
		} else {
			delete r.isEditing;
			this._settingsService.putRole(r.id, r).subscribe((resp: IRoles) => {
				this._toastService.pop('success', 'Success', 'Role was updated')
				r.isEditing = false;
				this.rolesList[i] = r;
				this._settingsService.setRoles(this.rolesList);
				this.rowBeingEdited = -1;
				this.isEditing = false; // set to true so create new is disabled
				if (this.rolesForm.form.dirty) this.rolesForm.reset();
			});
		}
    }
    
    // create new category Type button click
    public showTheNewRoleForm(){
        // populate controls with value or null (edit/create)
        this.newRoleForm.controls['name'].setValue(null);
        this.newRoleForm.controls['description'].setValue(null);
        this.showNewRoleForm = true;
    }

    //post new category type
    public createNewRole(){
        let role = this.newRoleForm.value;
        this._settingsService.postRole(role).subscribe((response: IRoles) => {
            response.isEditing = false;
            this.rolesList.push(response);
            this._settingsService.setRoles(this.rolesList);
            this._toastService.pop('success', 'Success', 'Role was created.'); 
            this.cancelCreateRole();
        }, error => {                        
            this._toastService.pop('error', 'Error', 'Role was not created.'); 
            console.log("error");
        });
    }

    // delete role
    public deleteRole(rID: number){
        // show are you sure modal
        this.areYouSure.showSureModal('Are you sure you want to delete this Role?'); // listener is AreYouSureDialogResponse()
        this.deleteID = rID;
    }
    // output emitter function when areYouSure is closed
    public AreYouSureDialogResponse(val: boolean) {
        //if they clicked Yes
        if (val) {
            //delete the role
            // get the index to be deleted by the id
            let ind: number = this.getRoleIndex(this.deleteID);
            //delete it
            this._settingsService.deleteRole(this.deleteID).subscribe(
                result => {         
                    this._toastService.pop('success', 'Success', 'Role deleted.');           
                    this.rolesList.splice(ind, 1); //delete from array
                    this._settingsService.setRoles(this.rolesList); // update service
                },
                error => {
                    this._toastService.pop('error', 'Error', 'Role was not deleted.'); 
                    this.errorMessage = error;                    
                }
            );
        }
    }

     //  get index in rolelist based on role.id value
    private getRoleIndex(rID: number): number {
        let ind: number = -1
        this.rolesList.some((r, index, _ary) => {
            if (r.id === rID) ind = index;
            return r.id === rID;
        });
        return ind;
    }

    //cancel or done creating new category, reset stuff
    public cancelCreateRole(){
        this.showNewRoleForm = false;
        this.newRoleForm.reset();
    }
}
