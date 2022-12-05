import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StoreFormDirective } from './form.directive';

@NgModule({
    declarations: [StoreFormDirective],
    imports: [CommonModule, FormsModule],
    exports: [StoreFormDirective],
    providers: []
})
export class StoreFormPluginModule {}
