import { Component, OnInit } from '@angular/core';

import { WateruseService } from "app/shared/services/wateruse.service";
import { IUser } from "app/shared/interfaces/User.interface";
import { IRegion } from "app/shared/interfaces/Region.interface";
import { ActivatedRoute } from "@angular/router";

@Component({
    moduleId: module.id,
    templateUrl: 'home.component.html'
})

export class HomeComponent implements OnInit {
    currentUser: string;
    regionList: Array<IRegion>;
    users: IUser[] = [];

    constructor(private userService: WateruseService, private _route: ActivatedRoute,) {
        this.currentUser = localStorage.getItem('currentUser');
    }

    ngOnInit() {
       this.regionList = this._route.snapshot.data['regions'];   
    }

    deleteUser(id: number) {
    //    this.userService.delete(id).subscribe(() => { this.loadAllUsers() });
    }

    private loadAllUsers() {
      //  this.userService.getAll().subscribe(users => { this.users = users; });
    }
}