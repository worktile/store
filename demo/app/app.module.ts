import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { NgxMiniStoreModule } from '../../projects/ngx-min-store/src/public_api';
import { TaskListStore } from './tasks-list-store';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    NgxMiniStoreModule.forRoot([
      TaskListStore
    ])
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
