import { Component, OnInit } from '@angular/core';
import { IDatatableConfig } from 'projects/ngx-toolkit/datatable/src/lib/types/config';
import { map } from 'rxjs/operators';
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
    this.users = this.firebase.colWithIds$<any>('users')
      .pipe(
        map(users =>
          users.map(user => ({
            'Display Name': user.displayName,
            'Email': user.email,
            'Photo': `<img class="rounded-circle img-thumbnail" src="${user.photoURL}">`
          })
        )
      ));
    this.config = {
      // properties: ['id', 'Display Name', 'Email', 'Photo'],
      allowSelection: true,
      classes: ['table-stripped', 'table-lg'],
      headerClasses: [],
      pagination: {
        maxPageSize: 10,
        startPage: 0
      },
      actions: [
        {
          event: ()=> {},
          text: '<i class="fa fa-eye mx-2"></i>'
        },
        {
          event: ()=> {},
          text: '<i class="fa fa-edit mx-2"></i>'
        },
        {
          event: ()=> {},
          text: '<i class="fa fa-trash mx-2"></i>'
        }
      ]
    };
  }

}
