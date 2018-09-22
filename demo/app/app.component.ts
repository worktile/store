import { Component, OnInit } from '@angular/core';
import { TaskListStore } from './tasks-list-store';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {


  constructor(public store: TaskListStore) {

  }

  ngOnInit(): void {
    this.store.fetchTasks();
  }
}
