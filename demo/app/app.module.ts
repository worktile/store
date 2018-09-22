import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { NgxMiniStoreModule } from 'packages/store';
import { TaskListStore } from './tasks-list-store';
import { TasksComponent } from './tasks/tasks.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    AppComponent,
    TasksComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,
    FormsModule,
    NgxMiniStoreModule.forRoot([
      TaskListStore
    ])
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
