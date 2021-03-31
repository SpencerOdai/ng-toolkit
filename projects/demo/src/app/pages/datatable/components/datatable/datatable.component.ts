import { Component, OnInit } from '@angular/core';
import { IDatatableConfig } from 'projects/ngx-toolkit/datatable/src/lib/types/config';
import { FirestoreService } from '../../../../shared/firestore/firestore.service';

@Component({
  selector: 'app-datatable',
  templateUrl: './datatable.component.html',
  styleUrls: ['./datatable.component.scss']
})
export class DatatableComponent implements OnInit {
  users: any;
  config: IDatatableConfig | null = null;

  constructor(
    private firebase: FirestoreService
  ) { }

  ngOnInit(): void {
    this.users = this.firebase.colWithIds$<any>('users');
    this.config = {
      properties: ['id', 'displayName', 'email', 'createdAt'],
      allowSelection: true,
      classes: ['table-stripped', 'table-lg'],
      headerClasses: [],
      pagination: {
        maxPageSize: 10,
        startPage: 0
      }
    };
  }

}
