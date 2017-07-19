// ------------------------------------------------------------------------------
// ----- source.modal.ts -----------------------------------------------
// ------------------------------------------------------------------------------

// copyright:   2017 WiM - USGS
// authors:  Tonia Roddick - USGS Wisconsin Internet Mapping
// purpose: modal component that opens to allow create/edit of source entity

import { Component, ViewChild, Output, EventEmitter, Input } from '@angular/core';
import { ISource } from "app/shared/interfaces/Source.interface";
import { FormBuilder, FormGroup, Validators, FormControl, FormArray } from '@angular/forms';
import { HomeService } from "app/home/home.service";
import { WateruseService } from "app/shared/services/wateruse.service";
import { ISourceType } from "app/shared/interfaces/SourceType.interface";
import { ICategoryType } from "app/shared/interfaces/Category.interface";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { ToasterService } from "angular2-toaster/angular2-toaster";

@Component({
  selector: 'editsource',
  templateUrl: './source.modal.html'
})

export class EditSourceModal {
    @ViewChild('editSource') public editSourceModal; // modal for validator
    private modalElement: any;
    public modalSource: ISource; // will be the source being edited or 0 for create new
    @Input() regionID: number; // regionID passed in to store before put/post of source
    @Output() updatedSource = new EventEmitter<ISource>(); //send back up new/edited source
    public sourceForm: FormGroup; //myform
    public sourceTypeList: Array<ISourceType>;
    public categoryTypeList: Array<ICategoryType>;
    public CloseResult: any; //why the close the modal (not sure if I need this yet)
    public sourceTips: any; // tooltips

    constructor(private _fb: FormBuilder, private _homeService: HomeService, private _waterService: WateruseService, 
        private _modalService: NgbModal, private _toastService: ToasterService){
        this.sourceForm = _fb.group({
            'id': new FormControl(null),
            'name': new FormControl(null),
            'sourceTypeID': new FormControl(null, Validators.required),
            'facilityName': new FormControl(null, Validators.required),
            'facilityCode': new FormControl(null, Validators.required),
            'catagoryTypeID': new FormControl(null), 
            'stationID': new FormControl(null),
            'regionID': new FormControl(null, Validators.required),
            location: _fb.group({
                'x': new FormControl(null, Validators.required),
                'y': new FormControl(null, Validators.required),
                'srid': new FormControl(null, Validators.required)
            })
        });
    }

    ngOnInit() {
        // tooltips on form
        this.sourceTips= {location: "Latitude/Longitude in North American Datum in 1983 and as Decimal Degrees."}
        // subscribe to know when to show the modal
        this._homeService.showSourceModal.subscribe((show: boolean) => {
            if (show) this.showTheSourceModal();
        });
        // subscribe to get source to show in the modal
        this._homeService.sourceForModal.subscribe((s: ISource) => {
            this.modalSource = s;
        });
        // get the sourcetypes
        this._waterService.sourcetypes().subscribe((st: Array<ISourceType>) => {
            this.sourceTypeList = st;            
        });
        // get the categorytypes
        this._waterService.categorytypes().subscribe((ct: Array<ICategoryType>) => {
            this.categoryTypeList = ct;
        });
        // set the viewchild modal as the modalelement
        this.modalElement = this.editSourceModal;
    }

    // flag is true to show the modal
    public showTheSourceModal() {
        // populate controls with value or null (edit/create)
        this.sourceForm.controls['id'].setValue(this.modalSource.id ? this.modalSource.id : null);
        this.sourceForm.controls['name'].setValue(this.modalSource.id ? this.modalSource.name : null);
        this.sourceForm.controls['sourceTypeID'].setValue(this.modalSource.id ? this.modalSource.sourceTypeID : null);
        this.sourceForm.controls['facilityName'].setValue(this.modalSource.id ? this.modalSource.facilityName : null);        
        this.sourceForm.controls['facilityCode'].setValue(this.modalSource.id ? this.modalSource.facilityCode : null);
        this.sourceForm.controls['catagoryTypeID'].setValue(this.modalSource.id ? this.modalSource.catagoryTypeID : null);        
        this.sourceForm.controls['stationID'].setValue(this.modalSource.id ? this.modalSource.stationID : null);
        this.sourceForm.controls['regionID'].setValue(this.regionID);

        // location needs to be separate object for proper json formatting on post/put
        let locationControlGrp = <FormArray>this.sourceForm.controls['location'];
        locationControlGrp.controls['x'].setValue(this.modalSource.id ? this.modalSource.location.x : null);
        locationControlGrp.controls['y'].setValue(this.modalSource.id ? this.modalSource.location.y : null);
        locationControlGrp.controls['srid'].setValue(this.modalSource.id ? this.modalSource.location.srid : 4269);
        
        // open the modal now
        this._modalService.open(this.modalElement, {backdrop: 'static', keyboard: false, size: 'lg'} ).result.then((valid) =>{           
            this.CloseResult = `Closed with: ${valid}`;           
            if (valid){
                //all good 
                let source: ISource = this.sourceForm.value;
                // PUT it (if id exists)
                if (source.id > 0){
                    this._waterService.putSource(source.id, source).subscribe((response: ISource) => {
                        this._toastService.pop('success', 'Success', 'Source was updated.'); 
                        this._homeService.setModalSource(null); // clear out the service source that this modal needed
                        this.updatedSource.emit(response); // emit the edited source
                    }, error => {                        
                        this._toastService.pop('error', 'Error', 'Source was not updated.'); 
                        console.log("Error");
                    });
                } else {
                    // POST it
                    this._waterService.postSource(source).subscribe((response: ISource) => {
                        this._toastService.pop('success', 'Success', 'Source was created.'); 
                        this._homeService.setModalSource(null); // clear out the service source that this modal needed
                        this.updatedSource.emit(response); // emit the created source
                    }, error => {                        
                        this._toastService.pop('error', 'Error', 'Source was not created.'); 
                        console.log("error");
                    });
                }
            }
        }, (reason) => {
            //this.CloseResult = `Dismissed ${this.getDismissReason(reason)}`
        });
    }
}