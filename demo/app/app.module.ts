import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { NgxMiniStoreModule } from 'packages/store';
import { TasksStore } from './tasks-store';
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
      TasksStore
    ])
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
