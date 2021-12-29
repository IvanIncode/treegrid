import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ButtonModule, CheckBoxAllModule } from '@syncfusion/ej2-angular-buttons';
import { DialogModule } from '@syncfusion/ej2-angular-popups';
import { DropDownListAllModule } from '@syncfusion/ej2-angular-dropdowns';
import { ContextMenuService, FilterService, PageService, SortService, TreeGridModule, EditService, ToolbarService } from '@syncfusion/ej2-angular-treegrid';

import { AppComponent } from './app.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NumericTextBoxAllModule } from '@syncfusion/ej2-angular-inputs';
import { DatePickerAllModule } from '@syncfusion/ej2-angular-calendars';
import { ContextMenuModule } from '@syncfusion/ej2-angular-navigations';
import { DropDownButtonModule } from '@syncfusion/ej2-angular-splitbuttons';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    TreeGridModule,
    DialogModule,
    ButtonModule,
    DropDownListAllModule,
    DropDownButtonModule,
    ReactiveFormsModule,
    FormsModule,
    NumericTextBoxAllModule,
    CheckBoxAllModule,
    DatePickerAllModule,
    ContextMenuModule
  ],
  bootstrap: [AppComponent],
  providers: [PageService,
              SortService,
              FilterService,
              ContextMenuService,
              EditService,
              ToolbarService]
})
export class AppModule { }
