// ------------------------------------------------------------------------------
// ----- warning.modal.ts ----------------------------------------------------
// ------------------------------------------------------------------------------

// copyright:   2017 WiM - USGS
// authors:  Tonia Roddick - USGS Wisconsin Internet Mapping
// purpose: modal used to make sure they want to delete something

import { Component, ViewChild, Output, EventEmitter, Input } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
// import { DialogService } from "app/shared/services/dialog.service";

@Component({
  selector: 'warningModal',
  template: `  
    <ng-template #warning  id="warnModal" let-c="close" let-d="dismiss">  
        <div class="modal-header">
            <h4 class="modal-title">WARNING</h4>            
        </div>
        <div class="modal-body">
            <p>{{ModalMessage}}</p>
        </div>
        <div class="modal-footer">
            <button type="button" (click)="c('Close')" class="btn-black">Close</button>
        </div>
    </ng-template>
    `
})

export class WarningModal {    
    @ViewChild('warning') public warningModal;    
    @Output() modalResponseEvent = new EventEmitter<boolean>(); // when they hit save, emit to projectdata.component

    private modalElement: any;
    public CloseResult:any;
    public ModalMessage: string;

    constructor(private _modalService: NgbModal){ }
    
    ngOnInit() {        
        this.modalElement = this.warningModal;
    }
     
    public showWarnModal(m: string): void {
        this.ModalMessage = m;
        this._modalService.open(this.modalElement).result.then((result) =>{
            // this is the solution for the first modal losing scrollability
            if (document.querySelector('body > .modal')) {
                document.body.classList.add('modal-open');
            }
        }, (reason) => {
            this.CloseResult = `Dismissed ${this.getDismissReason(reason)}`
        });
    }

    private getDismissReason(reason: any): string {
        if (reason === ModalDismissReasons.ESC) return 'by pressing ESC';
        else if (reason === ModalDismissReasons.BACKDROP_CLICK) return 'by clicking on a backdrop';
        else return  `with: ${reason}`;
    }

    ngOnDestroy() {
        this.modalElement = undefined;
    }
}