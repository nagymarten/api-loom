import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  ViewChild,
  OnInit,
  Output,
  EventEmitter,
  ElementRef,
} from '@angular/core';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { ChipModule } from 'primeng/chip';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { TabMenuModule } from 'primeng/tabmenu';
import { MenuItem } from 'primeng/api';
import { SelectModule } from 'primeng/select';
import { FormsModule } from '@angular/forms';
import { TooltipModule } from 'primeng/tooltip';
import { DividerModule } from 'primeng/divider';
import { ScrollerModule } from 'primeng/scroller';
import { InputSwitchModule } from 'primeng/inputswitch';
import { PanelModule } from 'primeng/panel';
import { EnumOverlayPanelComponent } from '../enum-overlay-panel/enum-overlay-panel.component';
import { ApiDataService } from '../../../services/api-data.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TabsModule } from 'primeng/tabs';
import { MultiSelectModule } from 'primeng/multiselect';

interface Type {
  name: string;
}

@Component({
  selector: 'app-sub-scheme-type',
  imports: [
    CommonModule,
    OverlayPanelModule,
    InputGroupModule,
    InputGroupAddonModule,
    ChipModule,
    InputTextModule,
    ButtonModule,
    TabMenuModule,
    SelectModule,
    FormsModule,
    TooltipModule,
    DividerModule,
    ScrollerModule,
    InputSwitchModule,
    PanelModule,
    EnumOverlayPanelComponent,
    SubSchemeTypeComponent,
    TranslateModule,
    TabsModule,
    MultiSelectModule,
  ],
  templateUrl: './sub-scheme-type.component.html',
  styleUrl: './sub-scheme-type.component.css',
})
export class SubSchemeTypeComponent implements OnInit {
  @Input() rowData: any;
  @Input() selectedCol: any;
  @Input() apiSchemas: any;
  @Input() selectedSchema: any;
  @Input() selectedSchemaName: any;
  @Input() selectedArrayItems: any;

  @ViewChild('scroller') scroller!: ElementRef;

  @Output() updateRow = new EventEmitter<string>();
  @Output() schemaUpdated: EventEmitter<any> = new EventEmitter<any>();

  responseExamples: MenuItem[] = [
    { label: 'Type', icon: 'pi pi-fw pi-tag' },
    { label: 'Components', icon: 'pi pi-fw pi-cog' },
    { label: 'Combine Schemas', icon: 'pi pi-fw pi-th-large' },
  ];
  activeItem!: MenuItem;
  types: Type[] = [
    { name: 'object' },
    { name: 'array' },
    { name: 'integer' },
    { name: 'number' },
    { name: 'string' },
    { name: 'boolean' },
    { name: 'enum' },
    { name: 'dictionary' },
  ];
  selectedType: Type | undefined;
  intFormats: Type[] = [{ name: 'int32' }, { name: 'int64' }];
  selectedIntType: any;
  combineTypes: Type[] = [{ name: 'AND' }, { name: 'XOR' }, { name: 'OR' }];
  showAddPropertyForm: boolean = false;
  scrollHeight: string = '250px';
  selectedCombineType: Type | undefined;
  selectedRefSchema: string = '';
  selectedBehavior: any;
  default: string = '';
  example: string = '';
  minimum: number | null = null;
  maximum: number | null = null;
  multipleOf: number | null = null;
  exclusiveMin: boolean = false;
  exclusiveMax: boolean = false;
  deprecated: boolean = false;
  allow_additional_properties: boolean = false;
  apiSchemasS = Array.from({ length: 50 }, (_, i) => ({
    name: `Item ${i + 1}`,
  }));

  //Object
  minProperties: number | null = null;
  maxProperties: number | null = null;
  allowAdditionalProperties: boolean = false;
  deprecatedObject: boolean = false;
  isNullableObject: boolean = false;

  //String
  selectedStringFormat: Type | undefined;
  selectedStringBehavior: Type | undefined;
  defaultString: string = '';
  exampleString: string = '';
  stringPattern: string = '';
  stringMinLength: number | null = null;
  stringMaxLength: number | null = null;
  isStringDeprecated: boolean = false;
  isNullableString: boolean = false;

  //Integer
  selectedIntegerFormat: Type | undefined;
  selectedIntegerBehavior: Type | undefined;
  defaultInteger: string = '';
  exampleInteger: string = '';
  minimumInteger: number | null = null;
  maximumInteger: number | null = null;
  multipleOfInteger: number | null = null;
  exclusiveMinInteger: boolean = false;
  exclusiveMaxInteger: boolean = false;
  deprecatedInteger: boolean = false;
  isNullableInteger: boolean = false;

  //Number
  selectedNumberFormat: Type | undefined;
  selectedNumberBehavior: Type | undefined;
  defaultNumber: string = '';
  exampleNumber: string = '';
  minimumNumber: number | null = null;
  maximumNumber: number | null = null;
  multipleOfNumber: number | null = null;
  exclusiveMinNumber: boolean = false;
  exclusiveMaxNumber: boolean = false;
  deprecatedNumber: boolean = false;
  isNullableNumber: boolean = false;

  //Boolean
  selectedBooleanBehavior: Type | undefined;
  defaultBoolean: Type | undefined;
  deprecatedBoolean: boolean = false;
  isNullableBoolean: boolean = false;

  //Enum
  selectedEnumBehavior: Type | undefined;
  deprecatedEnum: boolean = false;
  enumDefault: string | null = null;
  enumExample: string | null = null;
  enumValue: string = '';
  enumValues: string[] = [];
  showEnumInput: boolean = false;

  //Array
  selectedArrayBehavior: Type | undefined;
  minArrayItems: number | null = null;
  maxArrayItems: number | null = null;
  uniqueArrayItems: boolean = false;
  deprecatedArray: boolean = false;
  arrayItemsSub: any = null;
  isNullableArray: boolean = false;
  arrayItems: any = null;

  //Dictionary
  selectedDictionaryBehavior: Type | undefined;
  minDictionaryProperties: number | null = null;
  maxDictionaryProperties: number | null = null;
  deprecatedDictionary: boolean = false;
  additionalPropertiesDisc: any = null;

  minItems: number | null = null;
  maxItems: number | null = null;
  uniqueItems: boolean = false;

  stringFormats: Type[] = [
    { name: 'None' },
    { name: 'byte' },
    { name: 'binary' },
    { name: 'date' },
    { name: 'date-time' },
    { name: 'password' },
    { name: 'email' },
    { name: 'time' },
    { name: 'duration' },
    { name: 'idn-email' },
    { name: 'hostname' },
    { name: 'idn-hostname' },
    { name: 'ipv4' },
    { name: 'ipv6' },
    { name: 'uri' },
    { name: 'uri-reference' },
    { name: 'uuid' },
    { name: 'uri-template' },
    { name: 'json-pointer' },
    { name: 'relative-json-pointer' },
    { name: 'regex' },
  ];

  behaviorOptions: Type[] = [
    { name: 'Read/Write' },
    { name: 'ReadOnly' },
    { name: 'WriteOnly' },
  ];

  numberFormats = [{ name: 'float' }, { name: 'double' }];

  booleanDefaults = [{ name: 'true' }, { name: 'false' }];
  activeTabIndex: number = 0;
  isMultiselect: boolean = false;
  multiselectTypes: Type[] = [
    { name: 'object' },
    { name: 'array' },
    { name: 'integer' },
    { name: 'number' },
    { name: 'string' },
    { name: 'boolean' },
  ];
  selectedRef: any;
  filteredSchemas: any[] = [];
  searchQuery: string = '';
  selectedMultipleTypes: any[] = [];
  temporaryMultiSelectMenu: MenuItem[] = [];
  minimumMultiselect: number | null = null;
  maximumMultiselect: number | null = null;
  exclusiveMinMultiselect: boolean = false;
  exclusiveMaxMultiselect: boolean = false;
  deprecatedMultiselect: boolean = false;
  stringMultiselectPattern: string = '';
  stringMultiselectMinLength: number | null = null;
  stringMultiselectMaxLength: number | null = null;
  selectedMultiselectBehavior: Type | undefined;
  minMultiselectArrayItems: number | null = null;
  maxMultiselectArrayItems: number | null = null;
  uniqueMultiselectArrayItems: boolean = false;
  minMultiselectProperties: number | null = null;
  maxMultiselectProperties: number | null = null;
  allowMultiselectAdditionalProperties: boolean = false;
  multipleOfMultiselect: number | null = null;
  exampleMultiselect: string = '';
  defaultMultiselect: string = '';
  isNullableMultiselect: boolean = false;
  multipleFormats: Type[] = [];
  selectedMultipleFormat: Type | undefined;
  isMultiselectAndMoreThanOne: boolean = true;
  multiselectMenu: MenuItem[] = [
    { label: 'Object' },
    { label: 'Array' },
    { label: 'Integer' },
    { label: 'Number' },
    { label: 'String' },
    { label: 'Boolean' },
    { label: 'Common' },
  ];
  activeMultiselectTabIndex: any;

  //TODO: Fix to work

  constructor(private apiDataService: ApiDataService) {}

  ngOnInit() {
    if (Object.keys(this.selectedArrayItems || {}).length === 0) {
    } else {
      const cleanString = (value: string) =>
        value
          .replace(/\{\d+\}/g, '')
          .replace(/\s*or\s+null\s*$/i, '')
          .replace(/<[^>]*>/g, '')
          .trim();

      const extractRootType = (value: string): string => {
        const match = value.match(/^(\w+)\[/);
        if (match) {
          return match[1].trim();
        }
        return value.split(' or ')[0].trim();
      };

      const cleanedValue = cleanString(this.selectedArrayItems.type);
      const rootType = extractRootType(cleanedValue);

      const originalType = { name: rootType };
      this.selectedType = originalType;

      if (this.selectedArrayItems.properties) {
        this.minProperties = this.selectedArrayItems.minProperties || null;
        this.maxProperties = this.selectedArrayItems.maxProperties || null;
        this.allowAdditionalProperties =
          this.selectedArrayItems.allowAdditionalProperties || false;
        this.deprecated = this.selectedArrayItems.deprecated || false;
        this.isNullableObject = false;
      } else if (
        Array.isArray(this.selectedArrayItems.type) &&
        this.selectedArrayItems.type.includes('object') &&
        this.selectedArrayItems.type.includes('null')
      ) {
        this.minProperties = this.selectedArrayItems.minProperties || null;
        this.maxProperties = this.selectedArrayItems.maxProperties || null;
        this.allowAdditionalProperties =
          this.selectedArrayItems.allowAdditionalProperties || false;
        this.deprecated = this.selectedArrayItems.deprecated || false;
        this.isNullableObject = true;
      }
      if (this.selectedArrayItems.type === 'string') {
        this.selectedStringFormat = {
          name: this.selectedArrayItems.format || null,
        };
        if (this.selectedArrayItems.writeOnly) {
          this.selectedStringBehavior = { name: 'WriteOnly' };
        } else if (this.selectedArrayItems.readOnly) {
          this.selectedStringBehavior = { name: 'ReadOnly' };
        } else {
          this.selectedStringBehavior = { name: 'Read/Write' };
        }
        this.defaultString = this.selectedArrayItems.default || '';
        this.exampleString = this.selectedArrayItems.example || '';
        this.stringPattern = this.selectedArrayItems.pattern || '';
        this.stringMinLength = this.selectedArrayItems.minLength || null;
        this.stringMaxLength = this.selectedArrayItems.maxLength || null;
        this.isStringDeprecated = this.selectedArrayItems.deprecated || false;
        this.isNullableString = false;
      } else if (
        Array.isArray(this.selectedArrayItems.type) &&
        this.selectedArrayItems.type.includes('string') &&
        this.selectedArrayItems.type.includes('null')
      ) {
        this.selectedStringFormat = {
          name: this.selectedArrayItems.format || null,
        };
        if (this.selectedArrayItems.writeOnly) {
          this.selectedStringBehavior = { name: 'WriteOnly' };
        } else if (this.selectedArrayItems.readOnly) {
          this.selectedStringBehavior = { name: 'ReadOnly' };
        } else {
          this.selectedStringBehavior = { name: 'Read/Write' };
        }
        this.defaultString = this.selectedArrayItems.default || '';
        this.exampleString = this.selectedArrayItems.example || '';
        this.stringPattern = this.selectedArrayItems.pattern || '';
        this.stringMinLength = this.selectedArrayItems.minLength || null;
        this.stringMaxLength = this.selectedArrayItems.maxLength || null;
        this.isStringDeprecated = this.selectedArrayItems.deprecated || false;
        this.isNullableString = true;
      }

      if (this.selectedArrayItems.type === 'integer') {
        this.selectedIntegerFormat = {
          name: this.selectedArrayItems.format || null,
        };
        if (this.selectedArrayItems.writeOnly) {
          this.selectedIntegerBehavior = { name: 'WriteOnly' };
        } else if (this.selectedArrayItems.readOnly) {
          this.selectedIntegerBehavior = { name: 'ReadOnly' };
        } else {
          this.selectedIntegerBehavior = { name: 'Read/Write' };
        }
        this.defaultInteger = this.selectedArrayItems.default || '';
        this.exampleInteger = this.selectedArrayItems.example || '';
        this.minimumInteger =
          this.selectedArrayItems.minimum ||
          this.selectedArrayItems.exclusiveMinimum ||
          null;
        this.maximumInteger =
          this.selectedArrayItems.maximum ||
          this.selectedArrayItems.exclusiveMaximum ||
          null;
        this.multipleOfInteger = this.selectedArrayItems.multipleOf || null;
        this.exclusiveMinInteger =
          !!this.selectedArrayItems.exclusiveMinimum || false;
        this.exclusiveMaxInteger =
          !!this.selectedArrayItems.exclusiveMaximum || false;
        this.deprecatedInteger = this.selectedArrayItems.deprecated || false;
        this.isNullableInteger = false;
      } else if (
        Array.isArray(this.selectedArrayItems.type) &&
        this.selectedArrayItems.type.includes('integer') &&
        this.selectedArrayItems.type.includes('null')
      ) {
        this.selectedIntegerFormat = {
          name: this.selectedArrayItems.format || null,
        };
        if (this.selectedArrayItems.writeOnly) {
          this.selectedIntegerBehavior = { name: 'WriteOnly' };
        } else if (this.selectedArrayItems.readOnly) {
          this.selectedIntegerBehavior = { name: 'ReadOnly' };
        } else {
          this.selectedIntegerBehavior = { name: 'Read/Write' };
        }
        this.defaultInteger = this.selectedArrayItems.default || '';
        this.exampleInteger = this.selectedArrayItems.example || '';
        this.minimumInteger =
          this.selectedArrayItems.exclusiveMinimum ||
          this.selectedArrayItems.minimum ||
          null;
        this.maximumInteger =
          this.selectedArrayItems.exclusiveMaximum ||
          this.selectedArrayItems.maximum ||
          null;
        this.multipleOfInteger = this.selectedArrayItems.multipleOf || null;
        this.deprecatedInteger = this.selectedArrayItems.deprecated || false;
        this.exclusiveMinInteger =
          !!this.selectedArrayItems.exclusiveMinimum || false;
        this.exclusiveMaxInteger =
          !!this.selectedArrayItems.exclusiveMaximum || false;
        this.isNullableInteger = true;
      }

      if (this.selectedArrayItems.type === 'array') {
        const arrayValue = this.selectedArrayItems;

        if (arrayValue.writeOnly) {
          this.selectedArrayBehavior = { name: 'WriteOnly' };
        } else if (arrayValue.readOnly) {
          this.selectedArrayBehavior = { name: 'ReadOnly' };
        } else {
          this.selectedArrayBehavior = { name: 'Read/Write' };
        }

        this.minArrayItems = arrayValue.minItems || null;
        this.maxArrayItems = arrayValue.maxItems || null;
        this.uniqueArrayItems = arrayValue.uniqueItems || false;
        this.deprecatedArray = arrayValue.deprecated || false;
        this.arrayItemsSub = arrayValue.items || false;
        this.isNullableArray = false;
      }

      if (this.selectedArrayItems.additionalProperties) {
        const dictionaryValue = this.selectedArrayItems;

        if (dictionaryValue.writeOnly) {
          this.selectedDictionaryBehavior = { name: 'WriteOnly' };
        } else if (dictionaryValue.readOnly) {
          this.selectedDictionaryBehavior = { name: 'ReadOnly' };
        } else {
          this.selectedDictionaryBehavior = { name: 'Read/Write' };
        }
        this.minDictionaryProperties = dictionaryValue.minProperties || null;
        this.maxDictionaryProperties = dictionaryValue.maxProperties || null;
        this.deprecatedDictionary = dictionaryValue.deprecated || false;
        this.additionalPropertiesDisc = dictionaryValue.additionalProperties;
      }
    }
    this.checkAndInitializeSelectedType();

    setTimeout(() => {
      this.scrollToSelected();
    }, 0);
  }

  onSelectedMultipleTypesChange(
    selectedMultipleTypes: { name: string }[]
  ): void {
    this.selectedMultipleTypes = [];
    this.multipleFormats = [];

    selectedMultipleTypes.forEach((type) => {
      this.selectedMultipleTypes.push({ name: type.name.toLowerCase() });
    });

    if (this.selectedMultipleTypes.length >= 2) {
      this.isMultiselectAndMoreThanOne = true;
      this.selectedType = undefined;

      this.temporaryMultiSelectMenu = this.multiselectMenu.filter(
        (menuItem) =>
          menuItem.label !== 'Boolean' &&
          this.selectedMultipleTypes.some(
            (selectedType) =>
              menuItem.label &&
              selectedType.name === menuItem.label.toLowerCase()
          )
      );

      if (
        !this.temporaryMultiSelectMenu.some(
          (menuItem) => menuItem.label === 'Common'
        )
      ) {
        this.temporaryMultiSelectMenu.push({ label: 'Common' });
      }

      if (
        this.selectedMultipleTypes.some(
          (selectedType) => selectedType.name === 'integer'
        )
      ) {
        this.multipleFormats.push(...this.intFormats);
      }

      if (
        this.selectedMultipleTypes.some(
          (selectedType) => selectedType.name === 'number'
        )
      ) {
        this.multipleFormats.push(...this.numberFormats);
      }

      if (
        this.selectedMultipleTypes.some(
          (selectedType) => selectedType.name === 'string'
        )
      ) {
        this.multipleFormats.push(...this.stringFormats);
      }
    } else if (this.selectedMultipleTypes.length === 1) {
      this.isMultiselectAndMoreThanOne = false;
      this.selectedType = { name: this.selectedMultipleTypes[0].name };
    } else {
      this.isMultiselectAndMoreThanOne = false;
      this.selectedType = undefined;
    }

    this.updateRowData(this.selectedMultipleTypes.map((type) => type.name));
  }

  getTabIndex(label: string): number {
    const index = this.temporaryMultiSelectMenu.findIndex(
      (tab) => tab.label === label
    );
    return index === -1 ? 9999 : index;
  }

  onMultipleFieldBlur(field: string, event: any): void {
    const value = event.target?.value || event;
    this.onMultipleFieldChange(field, value);
  }

  onMultipleFieldChange(field: string, value: any): void {
    if (this.selectedSchema) {
      const multiple = this.selectedCol;

      if (!multiple) {
        console.warn('Property not found in selected schema.');
        return;
      }

      switch (field) {
        case 'selectedMultiselectBehavior':
          if (value === 'WriteOnly') {
            multiple.writeOnly = true;
            delete multiple.readOnly;
          } else if (value === 'ReadOnly') {
            multiple.readOnly = true;
            delete multiple.writeOnly;
          } else {
            delete multiple.readOnly;
            delete multiple.writeOnly;
          }
          break;
        case 'selectedMultipleFormat':
          multiple.format = value.name || null;
          break;
        case 'stringMultiselectMinLength':
          multiple.minLength = value ? Number(value) : null;
          break;
        case 'stringMultiselectMaxLength':
          multiple.maxLength = value ? Number(value) : null;
          break;
        case 'stringMultiselectPattern':
          multiple.pattern = value || '';
          break;
        case 'exampleMultiselect':
          multiple.example = value || '';
          break;
        case 'defaultMultiselect':
          multiple.default = value || '';
          break;
        case 'multipleOfMultiselect':
          multiple.multipleOf = value ? Number(value) : null;
          break;
        case 'minimumMultiselect':
          if (multiple.minimum) {
            multiple.minimum = value ? Number(value) : null;
          } else if (multiple.exclusiveMinimum) {
            multiple.exclusiveMinimum = value ? Number(value) : null;
          }
          break;
        case 'maximumMultiselect':
          if (multiple.maximum) {
            multiple.minimum = value ? Number(value) : null;
          } else if (multiple.exclusiveMaximum) {
            multiple.exclusiveMaximum = value ? Number(value) : null;
          }
          break;
        case 'exclusiveMinMultiselect':
          if (!!value === true && multiple.minimum) {
            multiple.exclusiveMinimum = multiple.minimum;
            delete multiple.minimum;
          } else if (!!value === false && multiple.exclusiveMinimum) {
            multiple.minimum = multiple.exclusiveMinimum;
            delete multiple.exclusiveMinimum;
          }
          break;

        case 'exclusiveMaxMultiselect':
          if (!!value === true && multiple.maximum) {
            multiple.exclusiveMaximum = multiple.maximum;
            delete multiple.maximum;
          } else if (!!value === false && multiple.exclusiveMaximum) {
            multiple.maximum = multiple.exclusiveMaximum;
            delete multiple.exclusiveMaximum;
          }
          break;
        case 'deprecatedMultiselect':
          multiple.deprecated = !!value;
          break;
        case 'minMultiselectArrayItems':
          multiple.minItems = value ? Number(value) : null;
          break;
        case 'maxMultiselectArrayItems':
          multiple.maxItems = value ? Number(value) : null;
          break;
        case 'uniqueMultiselectArrayItems':
          multiple.uniqueItems = !!value;
          break;
        case 'minMultiselectProperties':
          multiple.minProperties = value;
          break;
        case 'maxMultiselectProperties':
          multiple.maxProperties = value;
          break;
        case 'allowMultiselectAdditionalProperties':
          multiple.allowAdditionalProperties = value;
          break;
        case 'isNullableMultiselect':
          if (value) {
            if (Array.isArray(multiple.type)) {
              if (!multiple.type.includes('null')) {
                multiple.type.push('null');
              }
            } else if (typeof multiple.type === 'string') {
              multiple.type = [multiple.type, 'null'];
            } else {
              multiple.type = ['string', 'null'];
            }
          } else {
            if (Array.isArray(multiple.type)) {
              multiple.type = multiple.type.filter((t: string) => t !== 'null');
              if (multiple.type.length === 1) {
                multiple.type = multiple.type[0];
              }
            } else if (typeof multiple.type === 'string') {
            } else {
              multiple.type = 'string';
            }
          }
          break;

        default:
          console.warn(`Unhandled field: ${field}`);
      }

      this.updateSwaggerSpec();
    }
  }

  onMultislectChange(value: boolean) {
    this.isMultiselect = value;

    this.selectedMultipleTypes = [];

    if (this.isMultiselect && this.selectedMultipleTypes.length === 1) {
      this.selectedType = this.selectedMultipleTypes[0];
    } else if (this.selectedType) {
      this.selectedMultipleTypes.push(this.selectedType);
    }
  }

  toggleEnumInput() {
    this.showEnumInput = !this.showEnumInput;
  }

  addEnumValue() {
    this.enumValues.push('');
  }

  removeEnumValue(index: number) {
    this.enumValues.splice(index, 1);
  }

  clearEnumValues() {
    this.enumValues = [];
    this.showEnumInput = false;
  }

  checkAndInitializeSelectedType() {
    if (!this.selectedType) {
      console.warn('No type selected.');
      this.activeItem = this.responseExamples[0];
      return;
    }

    const selectedTypeName = this.selectedType.name;

    const isInCombineTypes = ['allOf', 'anyOf', 'oneOf'].includes(
      selectedTypeName
    );

    const isSpecialType = [
      'array',
      'boolean',
      'integer',
      'dictionary',
      'number',
      'string',
      'enum',
      'object',
    ].includes(selectedTypeName);

    const isInReferences = this.apiSchemas.some(
      (schema: any) => schema.name === selectedTypeName
    );

    if (isInCombineTypes) {
      this.activeItem = this.responseExamples[2];
      this.handleSpecialType(selectedTypeName);
    } else if (isSpecialType) {
      this.activeItem = this.responseExamples[0];
      this.selectedType.name = selectedTypeName;
    } else if (isInReferences) {
      const matchedSchema = this.apiSchemas.find(
        (schema: any) => schema.name === selectedTypeName
      );
      if (matchedSchema) {
        this.selectedRefSchema = selectedTypeName;
        this.initializeFromSchema(matchedSchema);
        this.activeItem = this.responseExamples[1];
        this.scrollToSelected();
      }
    } else {
      console.warn(
        `${selectedTypeName} is neither in combineTypes, references, nor a special type.`
      );
    }
  }

  scrollToSelected(): void {
    if (this.selectedRefSchema) {
      const selectedElement = document.getElementById(
        `item-${this.selectedRefSchema}`
      );
      if (selectedElement) {
        selectedElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }

  handleSpecialType(type: string) {
    switch (type) {
      case 'allOf':
        this.selectedCombineType = { name: 'AND' };

        break;
      case 'anyOf':
        this.selectedCombineType = { name: 'OR' };
        break;
      case 'oneOf':
        this.selectedCombineType = { name: 'XOR' };
        break;
      default:
        console.warn(`Unhandled special type: ${type}`);
        this.selectedCombineType = { name: '' };
    }
  }

  initializeFromSchema(schema: any) {
    this.minProperties = schema.minProperties || null;
    this.maxProperties = schema.maxProperties || null;
    this.allowAdditionalProperties = schema.allowAdditionalProperties || false;
    this.deprecated = schema.deprecated || false;
  }

  onFieldBlur(field: string, event: any): void {
    const value = event.target?.value || event;
    this.onFieldChange(field, value);
  }

  onFieldChange(field: string, value: any) {
    if (this.selectedSchema) {
      switch (field) {
        case 'minProperties':
          this.selectedSchema.minProperties = value;
          break;
        case 'maxProperties':
          this.selectedSchema.maxProperties = value;
          break;
        case 'allowAdditionalProperties':
          this.selectedSchema.allowAdditionalProperties = value;
          break;
        case 'deprecated':
          this.selectedSchema.deprecated = value;
          break;
        case 'isNullableObject':
          if (value) {
            if (Array.isArray(this.selectedSchema.type)) {
              if (!this.selectedSchema.type.includes('null')) {
                this.selectedSchema.type.push('null');
              }
            } else if (typeof this.selectedSchema.type === 'string') {
              this.selectedSchema.type = [this.selectedSchema.type, 'null'];
            }
          } else {
            if (Array.isArray(this.selectedSchema.type)) {
              this.selectedSchema.type = this.selectedSchema.type.filter(
                (t: string) => t !== 'null'
              );
              if (this.selectedSchema.type.length === 1) {
                this.selectedSchema.type = this.selectedSchema.type[0];
              }
            }
          }
          break;
        default:
          console.warn(`Unhandled field: ${field}`);
      }
    }

    this.updateSwaggerSpec();
  }

  filterSchemas(): void {
    if (this.searchQuery.trim() === '') {
      this.filteredSchemas = [...this.apiSchemas];
    } else {
      const query = this.searchQuery.toLowerCase();

      this.filteredSchemas = this.apiSchemas.filter(
        (schema: { name: string }) => schema.name.toLowerCase().includes(query)
      );
    }

    if (this.selectedRefSchema) {
      const selectedRefIndex = this.filteredSchemas.findIndex(
        (schema) => schema.name === this.selectedRefSchema
      );

      if (selectedRefIndex === -1) {
        const selectedSchemaObject = this.apiSchemas.find(
          (schema: { name: string }) => schema.name === this.selectedRefSchema
        );
        if (selectedSchemaObject) {
          this.filteredSchemas.unshift(selectedSchemaObject);
        }
      } else {
        const [selectedRef] = this.filteredSchemas.splice(selectedRefIndex, 1);
        this.filteredSchemas.unshift(selectedRef);
      }
    }
  }

  onStringFieldBlur(field: string, event: any): void {
    const value = event.target?.value || event;
    this.onStringFieldChange(field, value);
  }

  onDictionaryFieldBlur(field: string, event: any): void {
    const value = event.target?.value || event;
    this.onDictionaryFieldChange(field, value);
  }

  onIntegerFieldBlur(field: string, event: any): void {
    const value = event.target?.value || event;
    this.onIntegerFieldChange(field, value);
  }

  onStringFormatSelect(field: string, event: any) {
    const value = event.target?.value || event;
    this.onStringFieldChange(field, value.name);
  }

  onBehaviorOptionsSelect(field: string, event: any) {
    const value = event.target?.value || event;
    this.onStringFieldChange(field, value.name);
  }
  //TODO: make good if i change fiels
  onStringFieldChange(field: string, value: any): void {
    if (this.selectedSchema) {
      const string = this.selectedCol;

      if (!string) {
        console.warn('Property not found in selected schema.');
        return;
      }

      switch (field) {
        case 'selectedStringFormat':
          string.format = value.name || null;
          break;
        case 'selectedStringBehavior':
          if (value === 'WriteOnly') {
            string.writeOnly = true;
            delete string.readOnly;
          } else if (value === 'ReadOnly') {
            string.readOnly = true;
            delete string.writeOnly;
          } else {
            delete string.readOnly;
            delete string.writeOnly;
          }
          break;
        case 'defaultString':
          string.default = value || '';
          break;
        case 'exampleString':
          string.example = value || '';
          break;
        case 'stringPattern':
          string.pattern = value || '';
          break;
        case 'stringMinLength':
          string.minLength = value ? Number(value) : null;
          break;
        case 'stringMaxLength':
          string.maxLength = value ? Number(value) : null;
          break;
        case 'isStringDeprecated':
          string.deprecated = !!value;
          break;
        case 'isNullableString':
          if (value) {
            if (Array.isArray(string.type)) {
              if (!string.type.includes('null')) {
                string.type.push('null');
              }
            } else if (typeof string.type === 'string') {
              string.type = [string.type, 'null'];
            } else {
              console.warn('Unexpected type, resetting to ["string", "null"]');
              string.type = ['string', 'null'];
            }
          } else {
            if (Array.isArray(string.type)) {
              string.type = string.type.filter((t: string) => t !== 'null');
              if (string.type.length === 1) {
                string.type = string.type[0];
              }
            } else if (typeof string.type === 'string') {
            } else {
              console.warn('Unexpected type, resetting to "string"');
              string.type = 'string';
            }
          }

          break;

        default:
          console.warn(`Unhandled field: ${field}`);
      }

      this.updateSwaggerSpec();
    }
  }

  onIntegerFieldChange(field: string, value: any): void {
    if (this.selectedSchema) {
      const integer = this.selectedArrayItems;

      if (!integer) {
        console.warn('Property not found in selected schema.');
        return;
      }

      switch (field) {
        case 'selectedIntegerFormat':
          integer.format = value.name || null;
          break;
        case 'selectedIntegerBehavior':
          if (value.name === 'WriteOnly') {
            integer.writeOnly = true;
            delete integer.readOnly;
          } else if (value.name === 'ReadOnly') {
            integer.readOnly = true;
            delete integer.writeOnly;
          } else {
            delete integer.readOnly;
            delete integer.writeOnly;
          }
          break;
        case 'defaultInteger':
          integer.default = value || '';
          break;
        case 'exampleInteger':
          integer.example = value || '';
          break;
        case 'minimumInteger':
          if (integer.minimum) {
            integer.minimum = value ? Number(value) : null;
          } else if (integer.exclusiveMinimum) {
            integer.exclusiveMinimum = value ? Number(value) : null;
          }
          break;
        case 'maximumInteger':
          if (integer.maximum) {
            integer.minimum = value ? Number(value) : null;
          } else if (integer.exclusiveMaximum) {
            integer.exclusiveMaximum = value ? Number(value) : null;
          }
          break;
        case 'multipleOfInteger':
          integer.multipleOf = value ? Number(value) : null;
          break;
        case 'exclusiveMinInteger':
          if (!!value === true && integer.minimum) {
            integer.exclusiveMinimum = integer.minimum;
            delete integer.minimum;
          } else if (!!value === false && integer.exclusiveMinimum) {
            integer.minimum = integer.exclusiveMinimum;
            delete integer.exclusiveMinimum;
          }
          break;

        case 'exclusiveMaxInteger':
          if (!!value === true && integer.maximum) {
            integer.exclusiveMaximum = integer.maximum;
            delete integer.maximum;
          } else if (!!value === false && integer.exclusiveMaximum) {
            integer.maximum = integer.exclusiveMaximum;
            delete integer.exclusiveMaximum;
          }
          break;

        case 'deprecatedInteger':
          integer.deprecated = !!value;
          break;
        case 'isNullableInteger':
          if (value) {
            if (Array.isArray(integer.type)) {
              if (!integer.type.includes('null')) {
                integer.type.push('null');
              }
            } else if (typeof integer.type === 'string') {
              integer.type = [integer.type, 'null'];
            } else {
              console.warn('Unexpected type, resetting to ["string", "null"]');
              integer.type = ['string', 'null'];
            }
          } else {
            if (Array.isArray(integer.type)) {
              integer.type = integer.type.filter((t: string) => t !== 'null');
              if (integer.type.length === 1) {
                integer.type = integer.type[0];
              }
            } else if (typeof integer.type === 'string') {
            } else {
              console.warn('Unexpected type, resetting to "string"');
              integer.type = 'string';
            }
          }

          break;

        default:
          console.warn(`Unhandled field: ${field}`);
      }

      this.updateSwaggerSpec();
    }
  }

  onBooleanFieldChange(field: string, value: any): void {
    if (this.selectedSchema) {
      const boolean = this.selectedCol;

      if (!boolean) {
        console.warn('Property not found in selected schema.');
        return;
      }

      switch (field) {
        case 'selectedBooleanBehavior':
          if (value.name === 'WriteOnly') {
            boolean.writeOnly = true;
            delete boolean.readOnly;
          } else if (value.name === 'ReadOnly') {
            boolean.readOnly = true;
            delete boolean.writeOnly;
          } else {
            delete boolean.readOnly;
            delete boolean.writeOnly;
          }
          break;
        case 'defaultBoolean':
          if (typeof value.name === 'string') {
            if (value.name.toLowerCase() === 'true') {
              boolean.default = true;
            } else if (value.name.toLowerCase() === 'false') {
              boolean.default = false;
            } else {
              console.warn('Unexpected value for defaultBoolean:', value.name);
              boolean.default = null;
            }
          } else {
            boolean.default = !!value.name;
          }
          break;
        case 'isNullableBoolean':
          if (value) {
            if (Array.isArray(boolean.type)) {
              if (!boolean.type.includes('null')) {
                boolean.type.push('null');
              }
            } else if (typeof boolean.type === 'string') {
              boolean.type = [boolean.type, 'null'];
            } else {
              console.warn('Unexpected type, resetting to ["string", "null"]');
              boolean.type = ['string', 'null'];
            }
          } else {
            if (Array.isArray(boolean.type)) {
              boolean.type = boolean.type.filter((t: string) => t !== 'null');
              if (boolean.type.length === 1) {
                boolean.type = boolean.type[0];
              }
            } else if (typeof boolean.type === 'string') {
            } else {
              console.warn('Unexpected type, resetting to "string"');
              boolean.type = 'string';
            }
          }

          break;
        case 'deprecatedBoolean':
          boolean.deprecated = !!value;
          break;

        default:
          console.warn(`Unhandled field: ${field}`);
      }

      this.updateSwaggerSpec();
    }
  }

  onEnumFieldChange(field: string, value: any): void {
    if (this.selectedSchema) {
      const enumValue = this.selectedCol;

      if (!enumValue) {
        console.warn('Property not found in selected schema.');
        return;
      }

      switch (field) {
        case 'selectedEnumBehavior':
          if (value.name === 'WriteOnly') {
            enumValue.writeOnly = true;
            delete enumValue.readOnly;
          } else if (value.name === 'ReadOnly') {
            enumValue.readOnly = true;
            delete enumValue.writeOnly;
          } else {
            delete enumValue.readOnly;
            delete enumValue.writeOnly;
          }
          break;
        case 'enumExample':
          if (value !== null) {
            enumValue.example = value;
            break;
          } else {
            delete enumValue.example;
            break;
          }
        case 'enumDefault':
          if (value !== null) {
            enumValue.default = value;
            break;
          } else {
            delete enumValue.default;
            break;
          }
        case 'deprecatedEnum':
          enumValue.deprecated = !!value;
          break;
        default:
          console.warn(`Unhandled field: ${field}`);
      }

      this.updateSwaggerSpec();
    }
  }

  onNumberFieldBlur(field: string, event: any): void {
    const value = event.target?.value || event;
    this.onNumberFieldChange(field, value);
  }

  onNumberFieldChange(field: string, value: any): void {
    if (this.selectedSchema) {
      const number = this.selectedCol;

      if (!number) {
        console.warn('Property not found in selected schema.');
        return;
      }

      switch (field) {
        case 'selectedNumberFormat':
          number.format = value.name || null;
          break;
        case 'selectedNumberBehavior':
          if (value.name === 'WriteOnly') {
            number.writeOnly = true;
            delete number.readOnly;
          } else if (value.name === 'ReadOnly') {
            number.readOnly = true;
            delete number.writeOnly;
          } else {
            delete number.readOnly;
            delete number.writeOnly;
          }
          break;
        case 'defaultNumber':
          number.default = value || '';
          break;
        case 'exampleNumber':
          number.example = value || '';
          break;
        case 'minimumNumber':
          if (number.minimum) {
            number.minimum = value ? Number(value) : null;
          } else if (number.exclusiveMinimum) {
            number.exclusiveMinimum = value ? Number(value) : null;
          }
          break;
        case 'maximumNumber':
          if (number.maximum) {
            number.minimum = value ? Number(value) : null;
          } else if (number.exclusiveMaximum) {
            number.exclusiveMaximum = value ? Number(value) : null;
          }
          break;
        case 'multipleOfNumber':
          number.multipleOf = value ? Number(value) : null;
          break;
        case 'exclusiveMinNumber':
          if (!!value === true && number.minimum) {
            number.exclusiveMinimum = number.minimum;
            delete number.minimum;
          } else if (!!value === false && number.exclusiveMinimum) {
            number.minimum = number.exclusiveMinimum;
            delete number.exclusiveMinimum;
          }
          break;

        case 'exclusiveMaxNumber':
          if (!!value === true && number.maximum) {
            number.exclusiveMaximum = number.maximum;
            delete number.maximum;
          } else if (!!value === false && number.exclusiveMaximum) {
            number.maximum = number.exclusiveMaximum;
            delete number.exclusiveMaximum;
          }
          break;

        case 'deprecatedNumber':
          number.deprecated = !!value;
          break;
        case 'isNullableNumber':
          if (value) {
            if (Array.isArray(number.type)) {
              if (!number.type.includes('null')) {
                number.type.push('null');
              }
            } else if (typeof number.type === 'string') {
              number.type = [number.type, 'null'];
            } else {
              console.warn('Unexpected type, resetting to ["string", "null"]');
              number.type = ['string', 'null'];
            }
          } else {
            if (Array.isArray(number.type)) {
              number.type = number.type.filter((t: string) => t !== 'null');
              if (number.type.length === 1) {
                number.type = number.type[0];
              }
            } else if (typeof number.type === 'string') {
            } else {
              console.warn('Unexpected type, resetting to "string"');
              number.type = 'string';
            }
          }

          break;

        default:
          console.warn(`Unhandled field: ${field}`);
      }

      this.updateSwaggerSpec();
    }
  }

  onDictionaryFieldChange(field: string, value: any): void {
    if (this.selectedSchema) {
      const disc = this.selectedCol;

      if (!disc) {
        console.warn('Property not found in selected schema.');
        return;
      }

      switch (field) {
        case 'selectedDictionaryBehavior':
          if (value.name === 'WriteOnly') {
            disc.writeOnly = true;
            delete disc.readOnly;
          } else if (value.name === 'ReadOnly') {
            disc.readOnly = true;
            delete disc.writeOnly;
          } else {
            delete disc.readOnly;
            delete disc.writeOnly;
          }
          break;
        case 'minDictionaryProperties':
          if (disc.minimum) {
            disc.minimum = value ? Number(value) : null;
          } else if (disc.exclusiveMinimum) {
            disc.exclusiveMinimum = value ? Number(value) : null;
          }
          break;
        case 'maxDictionaryProperties':
          if (disc.maximum) {
            disc.minimum = value ? Number(value) : null;
          } else if (disc.exclusiveMaximum) {
            disc.exclusiveMaximum = value ? Number(value) : null;
          }
          break;
        case 'deprecatedDictionary':
          disc.deprecated = !!value;
          break;

        default:
          console.warn(`Unhandled field: ${field}`);
      }

      this.updateSwaggerSpec();
    }
  }

  onArrayFieldBlur(field: string, event: any): void {
    const value = event.target?.value || event;
    this.onArrayFieldChange(field, value);
  }

  onArrayFieldChange(field: string, value: any): void {
    if (this.selectedSchema) {
      const array = this.selectedCol;

      if (!array) {
        console.warn('Property not found in selected schema.');
        return;
      }

      switch (field) {
        case 'selectedArrayBehavior':
          if (value.name === 'WriteOnly') {
            array.writeOnly = true;
            delete array.readOnly;
          } else if (value.name === 'ReadOnly') {
            array.readOnly = true;
            delete array.writeOnly;
          } else {
            delete array.readOnly;
            delete array.writeOnly;
          }
          break;
        case 'minArrayItems':
          array.minItems = value ? Number(value) : null;
          break;
        case 'maxArrayItems':
          array.maxItems = value ? Number(value) : null;
          break;
        case 'uniqueArrayItems':
          array.deprecated = !!value;
          break;
        case 'deprecatedArray':
          array.deprecated = !!value;
          break;

        default:
          console.warn(`Unhandled field: ${field}`);
      }

      this.updateSwaggerSpec();
    }
  }

  updateSwaggerSpec(): void {
    let swaggerSpec = this.apiDataService.getSelectedSwaggerSpecValue();

    swaggerSpec.components.schemas[this.selectedSchemaName] =
      this.selectedSchema;

    this.apiDataService.saveSwaggerSpecToStorage(swaggerSpec);
  }

  onOverlayHide(): void {
    if (this.selectedSchema) {
      this.schemaUpdated.emit(this.selectedSchema);
    }
  }

  onTypeSelect() {
    this.updateRowData(this.selectedType);
  }

  onSchemeSelect(scheme: any) {
    this.selectedRefSchema = scheme.name;
    this.scrollToSelected();
  }

  onCombineTypeChange() {}

  updateRowData(selectedType: any): void {
    this.resetFieldsForNewType(this.selectedCol, this.rowData);

    if (this.selectedCol?.type === 'array') {
      if (this.selectedCol.items) {
        if (Array.isArray(this.selectedCol.items)) {
          this.selectedCol.items.forEach(
            (item: any) => (item.type = selectedType.name)
          );
        } else if (typeof this.selectedCol.items === 'object') {
          this.selectedCol.items.type = selectedType.name;
        }
      } else {
        this.selectedCol.items = {
          type: selectedType.name,
        };
        if (selectedType.name === 'array') {
          this.selectedCol.items.items = {};
        } else if (selectedType.name === 'object') {
          this.selectedCol.items.properties = {};
        } else if (selectedType.name === 'dictionary') {
          this.selectedCol.items.additionalProperties = {};
        }
      }
    } else if (this.selectedCol?.type === 'dictionary') {
      if (this.selectedCol.additionalProperties) {
        if (typeof this.selectedCol.additionalProperties === 'object') {
          this.selectedCol.additionalProperties.type = selectedType.name;
        }
      } else {
        this.selectedCol.additionalProperties = {
          type: selectedType.name,
        };
      }
    } else {
      console.log(
        `Type '${this.selectedCol?.type}' is neither array nor dictionary, updating type directly.`
      );
      this.selectedCol.type = selectedType.name;
    }
  }

  onMarkAsExample(index: number) {
    const value = this.enumValues[index];
    this.enumExample = this.enumExample === value ? null : value;

    this.onEnumFieldChange('enumExample', this.enumExample || null);
  }

  onMarkAsDefault(index: number) {
    const value = this.enumValues[index];

    this.enumDefault = this.enumDefault === value ? null : value;
    this.onEnumFieldChange('enumDefault', this.enumDefault || null);
  }

  resetFieldsForNewType(selectedCol: any, rowData: any) {
    this.minProperties = null;
    this.maxProperties = null;
    this.allowAdditionalProperties = false;
    this.deprecatedObject = false;
    this.isNullableObject = false;

    this.selectedStringFormat = undefined;
    this.selectedStringBehavior = undefined;
    this.defaultString = '';
    this.exampleString = '';
    this.stringPattern = '';
    this.stringMinLength = null;
    this.stringMaxLength = null;
    this.isStringDeprecated = false;
    this.isNullableString = false;

    this.selectedIntegerFormat = undefined;
    this.selectedIntegerBehavior = undefined;
    this.defaultInteger = '';
    this.exampleInteger = '';
    this.minimumInteger = null;
    this.maximumInteger = null;
    this.multipleOfInteger = null;
    this.exclusiveMinInteger = false;
    this.exclusiveMaxInteger = false;
    this.deprecatedInteger = false;
    this.isNullableInteger = false;

    this.selectedNumberFormat = undefined;
    this.selectedNumberBehavior = undefined;
    this.defaultNumber = '';
    this.exampleNumber = '';
    this.minimumNumber = null;
    this.maximumNumber = null;
    this.multipleOfNumber = null;
    this.exclusiveMinNumber = false;
    this.exclusiveMaxNumber = false;
    this.deprecatedNumber = false;
    this.isNullableNumber = false;

    this.selectedBooleanBehavior = undefined;
    this.defaultBoolean = undefined;
    this.deprecatedBoolean = false;
    this.isNullableBoolean = false;

    this.selectedEnumBehavior = undefined;
    this.deprecatedEnum = false;
    this.enumDefault = null;
    this.enumExample = null;
    this.enumValue = '';
    this.enumValues = [];
    this.showEnumInput = false;

    this.selectedArrayBehavior = undefined;
    this.minArrayItems = null;
    this.maxArrayItems = null;
    this.uniqueArrayItems = false;
    this.deprecatedArray = false;
    this.arrayItemsSub = null;
    this.isNullableArray = false;

    this.selectedDictionaryBehavior = undefined;
    this.minDictionaryProperties = null;
    this.maxDictionaryProperties = null;
    this.deprecatedDictionary = false;
    this.additionalPropertiesDisc = null;

    this.minItems = null;
    this.maxItems = null;
    this.uniqueItems = false;
    this.selectedCol.format = undefined;

    ['properties', 'additionalProperties', 'items'].forEach((key) => {
      if (selectedCol && selectedCol[key]) {
        delete selectedCol[key];
      } else {
        rowData.showAddButton = false;
      }
    });

    //TODO: Only showAddButton when its object or item or dictionary has object
    if (selectedCol?.type === 'object') {
      selectedCol.properties = {};
      rowData.showAddButton = true;
    } else if (selectedCol?.type === 'array') {
      selectedCol.items = {};
      rowData.showAddButton = true;
    } else if (selectedCol?.type === 'dictionary') {
      selectedCol.additionalProperties = {};
      rowData.showAddButton = true;
    } else {
      rowData.showAddButton = false;
    }
    delete selectedCol.readOnly;
    delete selectedCol.writeOnly;
    delete selectedCol.example;
    delete selectedCol.default;
    delete selectedCol.format;
    delete selectedCol.multipleOf;
    delete selectedCol.maximum;
    delete selectedCol.minimum;
    delete selectedCol.maxItems;
    delete selectedCol.minItems;
    delete selectedCol.maxProperties;
    delete selectedCol.minProperties;
    delete selectedCol.deprecated;
    delete selectedCol.uniqueItems;
    delete selectedCol.exclusiveMinimum;
    delete selectedCol.exclusiveMaximum;
    delete selectedCol.items;
    delete selectedCol.additionalProperties;
    delete selectedCol.properties;

    selectedCol.description = '';
  }
}
