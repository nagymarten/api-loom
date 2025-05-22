import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiDataService } from '../../services/api-data.service';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { MatGridListModule } from '@angular/material/grid-list';
import { AgGridModule } from 'ag-grid-angular';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ExtendedSwaggerSpec } from '../../models/swagger.types';
import { MatIconModule } from '@angular/material/icon';
import { TreeTableModule } from 'primeng/treetable';
import { MenuItem, MessageService, TreeNode } from 'primeng/api';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { AddSchemeButtonComponent } from '../components/add-scheme-button/add-scheme-button.component';
import { SchemeTypeOverlayPanelComponent } from '../components/scheme-type-overlay-panel/scheme-type-overlay-panel.component';
import { InputTextModule } from 'primeng/inputtext';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { TooltipModule } from 'primeng/tooltip';
import { ToastModule } from 'primeng/toast';
import { SchemaTabsComponent } from '../components/schema-tabs/schema-tabs.component';
import { SchemaExamplesComponent } from '../schemas/schema-examples/schema-examples.component';
import { SchemaExtensionsComponent } from '../schemas/schema-extensions/schema-extensions.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TabsModule } from 'primeng/tabs';
import { FloatLabelModule } from 'primeng/floatlabel';
import { Router } from '@angular/router';

interface Column {
  field: string;
  header: string;
}

@Component({
  selector: 'app-models',
  imports: [
    CommonModule,
    FormsModule,
    AgGridModule,
    FloatLabelModule,
    MatGridListModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatIconModule,
    TreeTableModule,
    ButtonModule,
    InputTextModule,
    ToggleButtonModule,
    TooltipModule,
    ToastModule,
    SchemaTabsComponent,
    SchemaExamplesComponent,
    SchemaExtensionsComponent,
    TranslateModule,
    TabsModule,
  ],
  templateUrl: './schemas.component.html',
  styleUrls: ['./schemas.component.css'],
  providers: [MessageService],
})
export class SchemasComponent implements OnInit {
  @ViewChild(SchemeTypeOverlayPanelComponent)
  childComponent!: SchemeTypeOverlayPanelComponent;

  @ViewChild(AddSchemeButtonComponent)
  addSchemeButtonComponent!: AddSchemeButtonComponent;

  @ViewChild('newSchemaInput') newSchemaInput!: ElementRef;

  @ViewChild('myText') myTextInput!: ElementRef;

  @ViewChild('titleInput') titleInput!: ElementRef<HTMLInputElement>;

  @ViewChild(SchemaTabsComponent) schemaTabsComponent!: SchemaTabsComponent;

  VALID_TYPES = [
    'string',
    'number',
    'boolean',
    'object',
    'array',
    'integer',
    'null',
  ];
  schemas: string = '';
  schema: string = '';
  apiSchemas: any[] = [];
  swaggerSubscription!: Subscription;
  selectedSchema: any;
  selectedSchemaName: string = '';
  activeTab: string = 'schema';
  descriptionProperty: string | null = null;
  cols!: Column[];
  jsonTree: TreeNode[] = [];
  responseExamples: MenuItem[] = [];
  activeItem!: MenuItem;
  selectedRowData: any;
  selectedCol: any;
  nameOfId: string = 'myappika';
  examplesSubscheema: any;
  rowData: any;
  selectedSchemaTitle: string = '';
  isEditingTitle: boolean = false;
  selectedSchemaDescription: string = '';
  isEditingDescription: boolean = false;
  checked: boolean = false;
  specsVersion: '2.0' | '3.0' | '3.1.0' | '3.0.0' = '2.0';

  private messageService = inject(MessageService);
  private router = inject(Router);
  private translate = inject(TranslateService);

  constructor(
    private route: ActivatedRoute,
    private apiDataService: ApiDataService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.schemas = params['schemas'];
      this.schema = params['schema'];
      this.fetchModelDetails();
    });

    if (this.selectedSchema) {
      this.selectedSchemaTitle = this.selectedSchema.title || '';
      this.selectedSchemaDescription = this.selectedSchema.description || '';
    }
  }
  onSchemaTitelBlur(event: any): void {
    this.onSchemaPathNameUpdated(event.target.value);
    this.router.navigate(['/schemas', event.target.value]);

    this.messageService.add({
      severity: 'success',
      summary: this.translate.instant('SCHEMAS.TOAST.TITLE_UPDATED'),
      detail: '',
    });
  }

  onSchemaDescriptionBlur(event: any): void {
    this.selectedSchema.description = event.target.value;
    this.onSchemaUpdated(this.selectedSchema);
    this.fetchModelDetails();

    this.messageService.add({
      severity: 'success',
      summary: this.translate.instant('SCHEMAS.TOAST.DESCRIPTION_UPDATED'),
      detail: '',
    });
  }

  formatTypeWithCount(type: string, count: number): string {
    return `${type} {${count}}`;
  }

  get getApiDataService(): ApiDataService {
    return this.apiDataService;
  }

  getSchemaName(schema: any): string {
    if (Array.isArray(schema?.type)) {
      const nonNullTypes = schema.type.filter((t: string) => t !== 'null');
      const formattedType =
        nonNullTypes.join(' or ') +
        (schema.type.includes('null') ? ' or null' : '');
      return this.formatTypeWithCount(formattedType, schema.type.length);
    }

    return schema?.allOf
      ? this.formatTypeWithCount('allOf', Object.keys(schema.allOf).length)
      : schema?.oneOf
      ? this.formatTypeWithCount('oneOf', Object.keys(schema.oneOf).length)
      : schema?.anyOf
      ? this.formatTypeWithCount('anyOf', Object.keys(schema.anyOf).length)
      : schema?.properties
      ? this.formatTypeWithCount(
          'object',
          Object.keys(schema.properties).length
        )
      : schema?.enum
      ? this.formatTypeWithCount('enum', schema.enum.length)
      : schema?.type || 'unknown';
  }

  formatType = (type: any): string => {
    if (Array.isArray(type)) {
      return type.join(' | ');
    } else {
      return type;
    }
  };

  tabIndexMap: { [key: string]: number } = {
    schema: 0,
    examples: 1,
    extensions: 2,
  };

  shouldShowAddButton(schema: any): boolean {
    if (!schema) {
      return false;
    }

    if (schema.properties || schema.type === 'object') {
      return true;
    }

    if (schema.allOf) {
      return true;
    }

    if (schema.oneOf) {
      return true;
    }

    if (schema.anyOf) {
      return true;
    }

    const excludedTypes = [
      'string',
      'number',
      'boolean',
      'enum',
      'array',
      'dictionary',
    ];
    if (excludedTypes.includes(schema.type)) {
      return false;
    }

    if (schema.$ref) {
      return false;
    }

    return false;
  }

  generateUniqueId = (): string => {
    return Math.random().toString(36).substring(2, 15);
  };

  cleanSchemaName(value: string): string {
    value = value.split(':')[0];

    value = value.replace(/\{\d+\}/g, '');

    return value.trim();
  }

  onSchemaUpdated(updatedSchema: any): void {
    console.log('Schema updated in child:', updatedSchema);

    this.selectedSchema = updatedSchema;

    const swaggerSpec = this.apiDataService.getSelectedSwaggerSpecValue();

    if (!swaggerSpec.openapi) {
      this.specsVersion = swaggerSpec.swagger;
    } else {
      this.specsVersion = swaggerSpec.openapi;
    }

    if (this.specsVersion === '2.0') {
      if (swaggerSpec.definitions) {
        swaggerSpec.definitions[this.selectedSchemaName] = this.selectedSchema;
      } else {
        console.error('No definitions found in Swagger spec.');
        return;
      }
    } else {
      if (swaggerSpec.components?.schemas) {
        swaggerSpec.components.schemas[this.selectedSchemaName] =
          this.selectedSchema;
      } else {
        console.error('No schemas found in Swagger spec.');
        return;
      }
    }

    if (swaggerSpec?.components?.schemas) {
      swaggerSpec.components.schemas[this.selectedSchemaName] =
        this.selectedSchema;
      this.apiDataService.updateSwaggerSpec(swaggerSpec);
      this.apiDataService.saveSwaggerSpecToStorage(swaggerSpec);
      this.fetchModelDetails();
    } else {
      console.error('No schemas found in Swagger spec.');
    }
  }

  onSchemaPathNameUpdated(updatedSchemaName: any): void {
    const swaggerSpec = this.apiDataService.getSelectedSwaggerSpecValue();
    if (swaggerSpec?.components?.schemas) {
      delete swaggerSpec.components.schemas[this.selectedSchemaName];

      this.selectedSchemaName = updatedSchemaName;

      swaggerSpec.components.schemas[this.selectedSchemaName] =
        this.selectedSchema;
      this.apiDataService.updateSwaggerSpec(swaggerSpec);

      this.apiDataService.saveSwaggerSpecToStorage(swaggerSpec);
      this.fetchModelDetails();
    } else {
      console.error('No schemas found in Swagger spec.');
    }
  }

  findParentNode(tree: TreeNode[], uniqueId: string): TreeNode | null {
    for (const node of tree) {
      if (node.data.uniqueId === uniqueId) {
        return node;
      }
      if (node.children) {
        const foundNode = this.findParentNode(node.children, uniqueId);
        if (foundNode) {
          return foundNode;
        }
      }
    }
    return null;
  }

  updateSwaggerSpec(): void {
    if (this.selectedSchemaName && this.selectedSchema) {
      const swaggerSpec = this.apiDataService.getSelectedSwaggerSpecValue();
      if (swaggerSpec && swaggerSpec.components.schemas) {
        // console.log(swaggerSpec);
        // console.log(this.selectedSchema);
        swaggerSpec.components.schemas[this.selectedSchemaName] =
          this.selectedSchema;

        this.apiDataService.updateSwaggerSpec(swaggerSpec);

        this.apiDataService.saveSwaggerSpecToStorage(swaggerSpec);
      } else {
        console.error(
          'Error: Could not fetch the Swagger spec or schema components.'
        );
      }
    } else {
      console.warn('No selected schema or schema name to update.');
    }
  }

  onChildDelete() {
    this.updateSwaggerSpec();
  }

  extractSchemaNameFromRef(ref: string): string {
    const refParts = ref.split('/');
    return refParts[refParts.length - 1];
  }

  getSchemaByRef(ref: string): any {
    const schemaName = this.extractSchemaNameFromRef(ref);
    return this.apiSchemas.find((schema) => schema.name === schemaName)
      ?.details;
  }

  fetchModelDetails(): void {
    //TODO: Check the openapi ver cause if 2.0 scheamas are in definitions
    this.swaggerSubscription = this.apiDataService
      .getSelectedSwaggerSpec()
      .subscribe({
        next: (swaggerSpec: ExtendedSwaggerSpec | null) => {
          if (swaggerSpec?.components?.schemas) {
            const schemas = swaggerSpec.components.schemas;
            // console.log('Fetched schemas:', schemas);

            this.apiSchemas = Object.keys(schemas).map((schemaName) => ({
              name: schemaName,
              details: schemas[schemaName],
            }));

            if (this.schema) {
              this.onSelectSchema(this.schema);
              // console.log('Selected Schema nmae? :', this.schema);
              // console.log('Selected Schema:', this.selectedSchema);
            }
          }
        },
        error: (error) => {
          console.error('Error fetching Swagger spec:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to fetch Swagger specification.',
            life: 3000,
          });
        },
      });
    if (this.selectedSchema) {
      this.selectedSchemaTitle = this.selectedSchema.title || '';
      this.selectedSchemaDescription = this.selectedSchema.description || '';
    }
  }

  onSelectSchema(eventOrSchemaName: Event | string): void {
    let schemaName: string;

    if (typeof eventOrSchemaName === 'string') {
      schemaName = eventOrSchemaName;
    } else {
      const selectElement = eventOrSchemaName.target as HTMLSelectElement;
      schemaName = selectElement.value;
    }

    const selectedSchema = this.apiSchemas.find((s) => s.name === schemaName);

    if (selectedSchema) {
      this.selectedSchema = selectedSchema.details;
      this.selectedSchemaName = selectedSchema.name;
    }
  }

  startEditingTitle(): void {
    this.isEditingTitle = true;

    setTimeout(() => {
      if (this.titleInput) {
        const inputEl = this.titleInput.nativeElement;
        inputEl.focus();

        inputEl.setSelectionRange(inputEl.value.length, inputEl.value.length);
      }
    });
  }

  startEditingDescription(): void {
    this.isEditingDescription = true;
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  objectKeys(obj: any): string[] {
    return obj ? Object.keys(obj) : [];
  }

  ngOnDestroy(): void {
    if (this.swaggerSubscription) {
      this.swaggerSubscription.unsubscribe();
    }
  }
}
