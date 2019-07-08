// ------------------------------------------------------------------------------
// ----- info.modal.ts ----------------------------------------------------
// ------------------------------------------------------------------------------

// copyright:   2017 WiM - USGS
// authors:  Tonia Roddick - USGS Wisconsin Internet Mapping
// purpose: modal used to provide information through a provided message

import { Component, ViewChild, Output, EventEmitter, Input } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
// import { DialogService } from "app/shared/services/dialog.service";

@Component({
  selector: 'infoModal',
  template: `  
    <ng-template #info  id="infoModal" let-c="close" let-d="dismiss">  
        <div class="modal-header">
            <h4 class="modal-title">Info</h4>            
        </div>
        <div class="modal-body">
            <p>{{modalMessage}}</p>
        </div>
        <div class="modal-footer">
            <button type="button" class="sigl-btn btn-orange" (click)="c('Cancel')">Cancel</button>
        </div>
    </ng-template>
    `
})

export class InfoModal {    
    @ViewChild('info') public infoModal;    
    @Output() modalResponseEvent = new EventEmitter<boolean>(); // when they hit save, emit to projectdata.component
    public modalMessage: string;
    private modalElement: any;
    public CloseResult:any;

    constructor(private _modalService: NgbModal){ }
    
    ngOnInit() {        
        this.modalElement = this.infoModal;
    }
     
    public showInfoModal(mes: string): void {
        this.modalMessage = mes;
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