import { Component, ViewChild, Output, EventEmitter, Input } from '@angular/core';
import { ISource } from "app/shared/interfaces/Source.interface";
import { FormBuilder, FormGroup, Validators, FormControl, FormArray } from '@angular/forms';
import { HomeService } from "app/home/home.service";
import { WateruseService } from "app/shared/services/wateruse.service";
import { ISourceType } from "app/shared/interfaces/SourceType.interface";
import { ICategoryType } from "app/shared/interfaces/Category.interface";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: 'editsource',
  templateUrl: './source.modal.html'
})
export class EditSourceModal {
    @ViewChild('editSource') public editSourceModal; // modal for validator
    private modalElement: any;
    public modalSource: ISource; // will be the source being edited or 0 for create new
    @Output() updatedSource = new EventEmitter<any>(); //send back up stuff
    public sourceForm: FormGroup; //myform
    public sourceTypeList: Array<ISourceType>;
    public categoryTypeList: Array<ICategoryType>;
    public CloseResult: any; //why the close the modal (not sure if I need this yet)
    
    constructor(private _fb: FormBuilder, private _homeService: HomeService, private _waterService: WateruseService, private _modalService: NgbModal){
        this.sourceForm = _fb.group({
            'id': new FormControl(null),
            'name': new FormControl(null, Validators.required),
            'sourceTypeID': new FormControl(null, Validators.required),
            'facilityname': new FormControl(null, Validators.required),
            'facilitycode': new FormControl(null, Validators.required),
            'catagoryTypeID': new FormControl(null), 
            'station': new FormControl(null),
            'LocationX': new FormControl(null),
            'LocationY': new FormControl(null),
            'LocationSRID': new FormControl(null)            
        });
    }

    ngOnInit() {
        this._homeService.showSourceModal.subscribe((show: boolean) => {
            if (show) this.showTheSourceModal();
        });
        this._homeService.sourceForModal.subscribe((s: ISource) => {
            this.modalSource = s;
        });
        this._waterService.sourcetypes().subscribe((st: Array<ISourceType>) => {
            this.sourceTypeList = st;            
        });
        this._waterService.categorytypes().subscribe((ct: Array<ICategoryType>) => {
            this.categoryTypeList = ct;
        });
        this.modalElement = this.editSourceModal;
    }

    public showTheSourceModal() {        
        this.sourceForm.controls['id'].setValue(this.modalSource.id);
        this.sourceForm.controls['name'].setValue(this.modalSource.name);
        this.sourceForm.controls['sourceTypeID'].setValue(this.modalSource.sourceTypeID);
        this.sourceForm.controls['facilityname'].setValue(this.modalSource.facilityName);        
        this.sourceForm.controls['facilitycode'].setValue(this.modalSource.facilityCode);
        this.sourceForm.controls['catagoryTypeID'].setValue(this.modalSource.catagoryTypeID);        
        this.sourceForm.controls['station'].setValue(this.modalSource.stationID);
        this.sourceForm.controls['LocationX'].setValue(this.modalSource.location.x);
        this.sourceForm.controls['LocationY'].setValue(this.modalSource.location.y);
        this.sourceForm.controls['LocationSRID'].setValue(this.modalSource.location.srid);
        
        // open the modal now
        this._modalService.open(this.modalElement, {backdrop: 'static', keyboard: false, size: 'lg'} ).result.then((valid) =>{           
            this.CloseResult = `Closed with: ${valid}`;           
            if (valid){
                //all good, put it
                let updatedSource: ISource = this.sourceForm.value;
                // PUT it
                this._waterService.putSource(updatedSource.id, updatedSource).subscribe((response: ISource) => {
                    this._homeService.setModalSource(null);
                    this.updatedSource.emit(response);
                })
            }
        }, (reason) => {
            //this.CloseResult = `Dismissed ${this.getDismissReason(reason)}`
        });
    }
}