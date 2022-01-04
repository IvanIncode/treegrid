import { ContextMenuModule } from '@syncfusion/ej2-angular-navigations';
import { Component, ElementRef, OnInit, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { dataSource, virtualData, textWrapData } from './datasource';
import { VirtualScrollService, TreeGridComponent, ColumnMenuService, EditSettingsModel, ResizeService, EditService, ContextMenuService, Column, SelectionSettingsModel } from '@syncfusion/ej2-angular-treegrid';
import { DialogComponent } from '@syncfusion/ej2-angular-popups';
import { EmitType } from '@syncfusion/ej2-base';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ItemModel, MenuItemModel } from '@syncfusion/ej2-navigations';

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
  @ViewChild('ejDialogDelete') ejDialogDelete!: DialogComponent;
  @ViewChild('container', { read: ElementRef, static: true }) container!: ElementRef;
  @ViewChild('newColumn') columnTemplate: Column;
  public data!: Object[];
  public contextMenuItems!: MenuItemModel[];
  public editing!: EditSettingsModel;
  public editparams!: Object;
  public targetElement!: HTMLElement;
  public isDeleteConfirm: boolean;
  public hideDialog: EmitType<object> = () => {
    this.isConfirm = true;
    this.ejDialog.hide();
  }
  public hideDeleteDialog: EmitType<object> = () => {
    this.isDeleteConfirm = true;
    this.ejDialogDelete.hide();
  }
  public cancelDeleteDialog: EmitType<object> = () => {
    this.isDeleteConfirm = false;
    this.ejDialogDelete.hide();
  }

  public cancelDialog: EmitType<object> = () => {
    this.isConfirm = false;
    this.ejDialog.hide();
  }

  public buttons: Object = [
    {
      'click': this.hideDialog.bind(this),
        buttonModel:{
        content: 'SAVE',
        isPrimary: true,
      }
    },
    {
      'click': this.cancelDialog.bind(this),
      buttonModel: {
        content: 'CANCEL'
      }
    }
  ];

  public deletionButtons: Object = [
    {
      'click': this.hideDeleteDialog.bind(this),
        buttonModel:{
        content: 'DELETE',
      }
    },
    {
      'click': this.cancelDeleteDialog.bind(this),
      buttonModel: {
        content: 'CANCEL',
        isPrimary: true,
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
  public isHeaderClick: boolean;
  public selectionOptions: SelectionSettingsModel = {type: 'Multiple'};
  public selectedColumn: Column | null;


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
      { text: 'Edit Column', id: 'EditCol'},
      { text: 'New Column', id: 'NewCol' },
      { text: 'Delete Column', id: 'DeleteCol' },
      //{ text: 'Choose Colomn', id: 'ChooseCol' },
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
    let isHeaderClick = false;
    console.log(this.contextMenuItems.filter(item => item.id === 'FreezCol')[0])
    document.querySelectorAll('div.e-headercelldiv').forEach((value, key) => {if(value === arg.rowInfo.target) isHeaderClick = true});
    document.querySelectorAll('span.e-headertext').forEach((value, key) => {if(value === arg.rowInfo.target) isHeaderClick = true});
    if(!isHeaderClick) {
      arg.cancel = true;
    } else {
      arg.cancel = false;
    };
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
      //console.log(this.actionToDo)
    }
    if(this.actionToDo === 'EditCol' || this.actionToDo === 'NewCol' || this.actionToDo === 'DeleteCol') {
      this.onOpenDialog(arg)
    } else {
      console.log(this.actionToDo, this.columnNameForManipulations)
      const column = this.getColumn(this.columnNameForManipulations);
      this.treegrid.openColumnChooser(0,0)
    }

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

    if(this.actionToDo === 'EditCol' || this.actionToDo === 'NewCol') {
      this.ejDialog.show();
    } else if(this.actionToDo === 'DeleteCol') {
      this.ejDialogDelete.show();
    }
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
      //this.whatNeedToDoAndDoIt(this.columnNameForManipulations);
    } else if(this.isConfirm && this.addOrEditForm.status !== 'VALID') {
      alert('wrong form values, please check data!')
    }
  }

  closeDeleteDialog(event: any) {
    if(this.isDeleteConfirm) {
      const column = this.getColumn(this.columnNameForManipulations);
      const oldColumns = this.treegrid.columns as Column[];
      let idx = -1;
      for(let i = 0; i < oldColumns.length; i++) {
        if(oldColumns[i] === column) idx = i;
      }
      oldColumns.splice(idx, 1);
      this.treegrid.refreshColumns();
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
        this.addNewColumn(column);
        break;
      case 'DeleteCol':
        break;
    }
    this.treegrid.refreshColumns();
  }

  manipulationsWithInputs(fieldValuesPairs: any, column: Column) {
    for(let [input, value] of fieldValuesPairs) {
      this.switcCaseInput(input, column, value);
      /* switch(input) {
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
      } */
    }
    this.treegrid.refreshColumns();
  }

  switcCaseInput(input: string, column: Column, value: any) {
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

  addNewColumn(column: Column) {
    const oldColumns = this.treegrid.columns as Column[];
    let idx = -1;
    for(let i = 0; i < oldColumns.length; i++) {
      if(oldColumns[i] === column) idx = i + 1;
    }
    const inputs = this.checkAreInputsPristine(this.addOrEditForm); // Map
    const newFieldIdx = +oldColumns[oldColumns.length - 1].field.replace('FIELD','') + 1;
    const newColumn = <Column> {
      field: 'FIELD' + newFieldIdx,
      headerText: inputs!.has('columnName') ? inputs!.get('columnName') : 'Column...',
      width: 150,
      type: inputs!.has('columnDataType') ? inputs!.get('columnDataType') : 'string',
      defaultValue: inputs!.has('columnDefaultValue') ? inputs!.get('columnDefaultValue') : 'value' || true || 0 || null,
      minWidth: inputs!.has('columnName') ? inputs!.get('columnName') : 150,
      textAlign: inputs!.has('columnTextAligh') ? inputs!.get('columnTextAligh') : 'Center',
    }
    if(!newColumn.customAttributes) newColumn.customAttributes = {style: {}};
    if(inputs!.has('columnFontSize')) newColumn.customAttributes = {style: {...(newColumn.customAttributes['style']), 'font-size': `${inputs!.get('columnFontSize')}px`, }};
    if(inputs!.has('columnFontColor')) newColumn.customAttributes = {style: {...(newColumn.customAttributes['style']), 'color': `${inputs!.get('columnFontColor')}`, }};
    if(inputs!.has('columnBackgroundColor')) newColumn.customAttributes = {style: {...(newColumn.customAttributes['style']), 'background-color': `${inputs!.get('columnBackgroundColor')}`, }};
    oldColumns.splice(idx, 0, newColumn);
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

/*   click(e: any) {
    let c = <Column[]>
        [
          { field: 'ShipCountry', headerText: 'Ship Country', width: 150 }
        ];
        for( let i: number = 0; i < c.length; i++ ) {
    (this.treegrid.columns as Column[]).push( c[ i ] );
    this.treegrid.refreshColumns();
    }
  } */

}
