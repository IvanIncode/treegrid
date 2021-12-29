import { Component, ElementRef, OnInit, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { dataSource, virtualData, textWrapData } from './datasource';
import { VirtualScrollService, TreeGridComponent, ColumnMenuService, EditSettingsModel, ResizeService, EditService, ContextMenuService, Column } from '@syncfusion/ej2-angular-treegrid';
import { DialogComponent } from '@syncfusion/ej2-angular-popups';
import { EmitType } from '@syncfusion/ej2-base';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ItemModel, MenuItemModel } from '@syncfusion/ej2-navigations';
import { CancelEventArgs } from '@syncfusion/ej2-angular-inputs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  encapsulation: ViewEncapsulation.None,
  providers: [VirtualScrollService, ColumnMenuService, ResizeService, EditService, ContextMenuService]
})

export class AppComponent implements OnInit {
  title = 'Angular-TreeGrid';

  @ViewChild('treegrid') treegrid!: TreeGridComponent;
  @ViewChild('ejDialog') ejDialog!: DialogComponent;
  @ViewChild('container', { read: ElementRef, static: true }) container!: ElementRef;
  @ViewChild('newColumn') columnTemplate: Column;
  public data!: Object[];
  public contextMenuItems!: MenuItemModel[];
  public editing!: EditSettingsModel;
  public editparams!: Object;
  public targetElement!: HTMLElement;
  public hideDialog: EmitType<object> = () => {
    this.isConfirm = true;
    this.ejDialog.hide();
  }

  public cancelDialog: EmitType<object> = () => {
    this.isConfirm = false;
    this.ejDialog.hide();
  }

  public buttons: Object = [
    {
      'click': this.hideDialog.bind(this),
        buttonModel:{
        content: 'OK',
        isPrimary: true,
      }
    },
    {
      'click': this.cancelDialog.bind(this),
      buttonModel: {
        content: 'Cancel'
      }
    }
  ];
  public items: ItemModel[] = [
    { text: 'string' },
    { text: 'boolean' },
    { text: 'number' },
    { text: 'date' },
    { text: 'datetime' }
  ];

  public dialogHeaderText: string = 'Header';
  public dialogContentText: string = 'Content';
  public headerTextByDefault: string = 'Header text';
  public columnNameForManipulations!: string;
  public actionToDo!: string;
  public columnId!: string;
  public whatNeedToDo!: string;
  public editingColumnName!: boolean;
  public editingColumnDataType!: boolean;
  public editingColumnDefaultValue!: boolean;
  public editingColumnMinWidth!: boolean;
  public isConfirm!: boolean;
  public addOrEditForm: FormGroup;
  public editTypeFIELD1: string = 'stringedit';
  public editTypeFIELD2: string = 'dropdownedit';
  public editTypeFIELD3: string = 'stringedit';
  public editTypeFIELD4: string = 'stringedit';
  public choosedDataType: string = 'string';
  public allowFiltering: boolean = false;
  public taskIDheaderText: string = 'Column 1';
  public column2headerText: string = 'Column 2';
  public column3headerText: string = 'Column 3';
  public column4headerText: string = 'Column 4';
  public column5headerText: string = 'Column 5';

  public customAttributes: Object;

  public newStyles: string;


  constructor(private fb: FormBuilder){
    this.addOrEditForm= this.fb.group({
      columnName:['', Validators.required],
      columnDataType: [''],
      columnDefaultValue: [''],
      columnMinWidth: [''],
      columnFontSize: [''],
      columnFontColor: [''],
      columnBackgroundColor: [''],
      columnTextAligh: [''],
      columnTextWrap: [''],
    })
  }
  ngOnInit(): void {
    this.initilaizeTarget();
    dataSource();
    this.data = virtualData;
    this.contextMenuItems  = [
      { text: 'Edit Column', id: 'EditCol' },
      { text: 'New Column', id: 'NewCol' },
      { text: 'Delete Column', id: 'DeleteCol' },
      { text: 'Choose Colomn', id: 'ChooseCol' },
      { text: 'Freez Column', id: 'FreezCol' },
      { text: 'Filter Column',  id: 'FilterCol' },
      { text: 'MultiSort',  id: 'MultiSort' }
    ];
    this.editing = { allowDeleting: true, showDeleteConfirmDialog: true, allowEditing: true, allowAdding: true, mode: 'Cell' };
    this.editparams = {params: { format: 'n' }};
    this.customAttributes = {class : 'customcss'};
  }

  public initilaizeTarget: EmitType<object> = () => {
    this.targetElement = this.container.nativeElement.parentElement;
  }

  contextMenuOpen(arg?: any) {
    this.clearAllInputs();
    if(!arg.parentItem) {
      this.columnNameForManipulations = arg.column.field;
    }
  }

  getColumn(columnName: string) {
    return this.treegrid.getColumnByField(columnName);
  }

  contextMenuClick(arg?: any) {
    if(arg) {
      this.actionToDo = arg.item.properties.id;
      console.log(this.actionToDo)
    }

    this.onOpenDialog(arg)
  }

  checkAreInputsPristine(form: FormGroup) {
    if(form.pristine) return;
    const dirtyControls = new Map();
    const controls = form.controls;
    for(let control in controls) {
      if(!controls[control].pristine) dirtyControls.set(control, controls[control].value);
    }

    return dirtyControls;
  }

  checkInputs(event: any) {
    const inputs = this.checkAreInputsPristine(this.addOrEditForm);
    if(inputs && inputs.size > 0 && this.addOrEditForm.status === 'VALID' && this.isConfirm) {
      this.whatNeedToDoAndDoIt(inputs);
      event.cancel = false;
    } else if(this.addOrEditForm.status !== 'VALID' && this.isConfirm) {
      alert('some fields are invalid or there is no changes, please check the data')
      event.cancel = true;
    }
  }

  onOpenDialog = (event: any): void => {
    const column = this.getColumn(this.columnNameForManipulations)
    this.prepareInputsForAddingOrEditing(column)

    this.ejDialog.show();
  }

  prepareInputsForAddingOrEditing(column: any) {
    const colIndex = column.uid;
    const colHeader = document.querySelector<HTMLElement>(`[e-mappinguid="${colIndex}"]`);
    const allStyles = window.getComputedStyle(colHeader!);
    this.addOrEditForm.patchValue({
      columnName: column.headerText && this.actionToDo === 'EditCol' ? column.headerText : this.headerTextByDefault,
      columnDataType: column.type ? column.type : 'string',
      columnDefaultValue: column.defaultValue ? column.defaultValue : 'Default value' || 1 || true || null,
      columnMinWidth: column.minWidth ? column.minWidth : '50',
      columnFontSize: column.customAttributes &&  column.customAttributes['style']['font-size'] ? column.customAttributes['style']['font-size'].replace('px', '') : '12',
      columnFontColor: column.customAttributes && column.customAttributes['style']['color'] ? column.customAttributes['style']['color'] : '#000000',
      columnBackgroundColor: column.customAttributes && column.customAttributes['style']['background-color'] ? column.customAttributes['style']['background-color'] : '#ffffff',
      columnTextAligh: column.textAlign ? column.textAlign : 'Center',
      columnTextWrap: column.textWrapData ? column.textWrapData : 'Wrap',
    })
  }

  closeDialog(arg?: any) {
    this.addOrEditForm.updateValueAndValidity();
    if (this.isConfirm && this.addOrEditForm.status === 'VALID') {
      this.whatNeedToDoAndDoIt(this.columnNameForManipulations);
    } else if(this.isConfirm && this.addOrEditForm.status !== 'VALID') {
      alert('wrong form values, please check data!')
    }
  }

  getValueOfInput(name: string) {
    return this.addOrEditForm.get(name)!.value;
  }

  whatNeedToDoAndDoIt(fieldValuesPairs: any) {
    const whatNeed = this.actionToDo;
    console.log(whatNeed)
    const column = this.getColumn(this.columnNameForManipulations);
    if(!column.customAttributes) column.customAttributes = {style: {}};
    switch (whatNeed) {
      case 'EditCol':
        this.manipulationsWithInputs(fieldValuesPairs, column);
        break;
      case 'NewCol':
        const colIndex = column.uid;
        const colHeader = document.querySelector<HTMLElement>('#_gridcontrolcolgroup');
        colHeader?.appendChild(colHeader?.firstChild as Node)
        this.treegrid.refreshColumns
        //console.log(colHeader);
        break;
    }
    this.treegrid.refreshColumns();
  }

  manipulationsWithInputs(fieldValuesPairs: any, column: Column) {
    for(let [input, value] of fieldValuesPairs) {
      switch(input) {
        case 'columnName':
          column.headerText = value;
          break;
        case 'columnDataType':
          column.type = value;
          break;
        case 'columnDefaultValue':
          column.defaultValue = value;
          break;
        case 'columnMinWidth':
          column.minWidth = value;
          break;
        case 'columnFontSize':
          column.customAttributes = {style: {...(column.customAttributes['style']), 'font-size': `${value}px`, }}
          break;
        case 'columnFontColor':
          column.customAttributes = {style: {...(column.customAttributes['style']), 'color': value, }}
          break;
        case 'columnBackgroundColor':
          column.customAttributes = {style: {...(column.customAttributes['style']), 'background-color': value, }}
          break;
        case 'columnTextAligh':
          column.textAlign = value;
          break;
        case 'columnTextWrap':
          column.customAttributes = {style: {...(column.customAttributes['style']), 'white-space': value, }}
          break;
      }
    }
    this.treegrid.refreshColumns();
  }

  clearAllInputs() {
    this.editingColumnName = false;
    this.editingColumnDataType = false;
    this.editingColumnDefaultValue = false;
    this.dialogHeaderText = '';
    this.addOrEditForm.reset();
  }

  changeColName() {

  }

  itemRender(event: any) {

  }

  selectChanges(event: any) {
    this.choosedDataType = event.element.outerText;
  }

  onSubmit() {

  }

}
