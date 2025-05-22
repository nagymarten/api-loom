import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  inject,
  Input,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormGroup } from '@angular/forms';
import { DividerModule } from 'primeng/divider';
import { SplitButtonModule } from 'primeng/splitbutton';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { TreeTableModule } from 'primeng/treetable';
import { TooltipModule } from 'primeng/tooltip';
import { ToastModule } from 'primeng/toast';
import { MenuModule } from 'primeng/menu';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { SchemaTabsComponent } from '../../components/schema-tabs/schema-tabs.component';
import { ApiDataService } from '../../../services/api-data.service';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { TabsModule } from 'primeng/tabs';
import { ButtonModule } from 'primeng/button';
import { TextareaModule } from 'primeng/textarea';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MessageModule } from 'primeng/message';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
  selector: 'app-path-request-page',
  imports: [
    CommonModule,
    FormsModule,
    DividerModule,
    SplitButtonModule,
    ToastModule,
    TooltipModule,
    TreeTableModule,
    OverlayPanelModule,
    MenuModule,
    FloatLabelModule,
    InputTextModule,
    SchemaTabsComponent,
    TabsModule,
    ButtonModule,
    TextareaModule,
    TranslateModule,
    MessageModule,
    ConfirmDialogModule,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './path-request-page.component.html',
  styleUrls: ['./path-request-page.component.css'],
})
export class PathRequestPageComponent implements OnInit {
  @Input() methodDetails!: FormGroup;
  @Input() apiPath!: string;
  @Input() method!: string;
  @Input() swaggerSpec!: any;

  requestBodyValue!: string;
  menuItems: MenuItem[] = [];
  filteredMenuItems: MenuItem[] = [];
  activeTab: string = 'schema';
  selectedSchema: any;
  filterText: string = '';
  description: string = '';
  requestBodyContent: { [key: string]: any } = {};
  selectedContentType: string = '';
  requestBodyContentAsArray: any[] = [];
  nameOfId: string = 'myappika';
  menuItemsMap: { [key: string]: MenuItem[] } = {};
  private debounceTimer: any;
  requestBodyContentKeys: string[] = [];
  updateableSwaggerSpec: any;

  @ViewChild('buttonContainer', { static: true }) buttonContainer!: ElementRef;
  @ViewChildren('buttonRef') buttonRefs!: QueryList<ElementRef>;

  private translate = inject(TranslateService);
  private apiDataService = inject(ApiDataService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  constructor() {}

  ngOnInit(): void {
    this.initializeRequestPage();
    this.initializeMenuItemsMap();
  }

  private initializeRequestPage(): void {
    this.initializeRequestBody();
    this.initializeMenuItems();

    this.refreshRequestBodyContentKeys();
    const contentKeys = this.requestBodyContentKeys;
    if (contentKeys.length > 0) {
      setTimeout(() => {
        const firstButton =
          this.buttonContainer.nativeElement.querySelector('.p-splitbutton');
        if (firstButton) {
          this.selectContentType(contentKeys[0]);
        }
      });
    }
  }

  private initializeMenuItems(): void {
    this.menuItems = [
      {
        label: 'application/xml',
        command: () => this.onSelect('application/xml'),
      },
      {
        label: 'multipart/form-data',
        command: () => this.onSelect('multipart/form-data'),
      },
      {
        label: 'text/html',
        command: () => this.onSelect('text/html'),
      },
      {
        label: 'text/plain',
        command: () => this.onSelect('text/plain'),
      },
      {
        label: 'application/EDI-X12',
        command: () => this.onSelect('application/EDI-X12'),
      },
      {
        label: 'application/EDIFACT',
        command: () => this.onSelect('application/EDIFACT'),
      },
      {
        label: 'application/atom+xml',
        command: () => this.onSelect('application/atom+xml'),
      },
      {
        label: 'application/font-woff',
        command: () => this.onSelect('application/font-woff'),
      },
      {
        label: 'application/gzip',
        command: () => this.onSelect('application/gzip'),
      },
      {
        label: 'application/javascript',
        command: () => this.onSelect('application/javascript'),
      },
      {
        label: 'application/octet-stream',
        command: () => this.onSelect('application/octet-stream'),
      },
      {
        label: 'application/ogg',
        command: () => this.onSelect('application/ogg'),
      },
      {
        label: 'application/pdf',
        command: () => this.onSelect('application/pdf'),
      },
      {
        label: 'application/postscript',
        command: () => this.onSelect('application/postscript'),
      },
      {
        label: 'application/soap+xml',
        command: () => this.onSelect('application/soap+xml'),
      },
      {
        label: 'application/x-bittorrent',
        command: () => this.onSelect('application/x-bittorrent'),
      },
      {
        label: 'application/x-tex',
        command: () => this.onSelect('application/x-tex'),
      },
      {
        label: 'application/xhtml+xml',
        command: () => this.onSelect('application/xhtml+xml'),
      },
      {
        label: 'application/xml-dtd',
        command: () => this.onSelect('application/xml-dtd'),
      },
      {
        label: 'application/xop+xml',
        command: () => this.onSelect('application/xop+xml'),
      },
      {
        label: 'application/zip',
        command: () => this.onSelect('application/zip'),
      },
      {
        label: 'application/x-www-form-urlencoded',
        command: () => this.onSelect('application/x-www-form-urlencoded'),
      },
    ];
    this.initializeFilteredMenuItems();
  }

  getMenuItems(contentType: string): MenuItem[] {
    return [
      {
        label: 'Delete',
        icon: 'pi pi-trash',
        command: () => {
          this.deleteContentType(contentType);
        },
      },
    ];
  }

  initializeMenuItemsMap(): void {
    this.menuItemsMap = {};

    this.refreshRequestBodyContentKeys();
    this.requestBodyContentKeys.forEach((contentType) => {
      this.menuItemsMap[contentType] = this.getMenuItems(contentType);
    });
  }

  filterMenuItems() {
    if (this.filterText.trim() === '') {
      this.filteredMenuItems = [...this.menuItems];
    } else {
      this.filteredMenuItems = this.menuItems.filter((item) =>
        item.label?.toLowerCase().includes(this.filterText.toLowerCase())
      );
    }
  }

  onSelect(type: string): void {
    if (this.requestBodyContent[type]) {
      console.warn(`Content type '${type}' already exists.`);
      return;
    }

    const newSchema = {
      type: 'object',
      properties: {
        newField: {
          type: 'string',
          description: 'Newly added field',
        },
      },
    };

    this.requestBodyContent[type] = { schema: newSchema };
    this.requestBodyContentAsArray.push({
      contentType: type,
      schema: newSchema,
    });

    this.selectedContentType = type;
    this.selectedSchema = newSchema;

    this.initializeFilteredMenuItems();
    this.updateSwaggerSpec();
    this.initializeMenuItemsMap();

    setTimeout(() => {
      this.selectContentType(type);
    }, 50);
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  onChildDelete() {
    this.updateSwaggerSpec();
  }

  initializeRequestBody(): void {
    if (!this.methodDetails || !this.methodDetails.get('requestBody')) {
      console.warn(
        '⚠️ Warning: methodDetails or requestBody control is not defined. Skipping request body initialization.'
      );
      return;
    }

    let requestBody = this.methodDetails.get('requestBody')?.value;

    if (
      !requestBody ||
      (typeof requestBody === 'string' && requestBody.trim() === '')
    ) {
      this.description = '';
      this.requestBodyContent = {};
      this.requestBodyContentAsArray = [];
      this.filteredMenuItems = [...this.menuItems];
      return;
    }

    try {
      if (typeof requestBody === 'string') {
        requestBody = JSON.parse(requestBody);
      }

      if (requestBody && typeof requestBody === 'object') {
        this.description = requestBody.description || '';

        this.requestBodyContent = Object.assign({}, requestBody.content) || {};

        this.requestBodyContentAsArray = Object.entries(
          this.requestBodyContent
        ).map(([key, value]) => ({
          contentType: key,
          schema: value?.schema || null,
        }));

        this.refreshRequestBodyContentKeys();
        const contentKeys = this.requestBodyContentKeys;
        if (contentKeys.length > 0) {
          this.selectedContentType = contentKeys[0];

          this.selectedSchema =
            this.requestBodyContent[this.selectedContentType]?.schema || null;
        }

        this.initializeFilteredMenuItems();
      } else {
        console.warn(
          'Warning: requestBody is empty or invalid. Resetting content.'
        );
        this.description = '';
        this.requestBodyContent = {};
        this.requestBodyContentAsArray = [];
        this.filteredMenuItems = [...this.menuItems];
      }
    } catch (error) {
      console.error('Error parsing requestBody:', error);
      this.description = '';
      this.requestBodyContent = {};
      this.requestBodyContentAsArray = [];
      this.filteredMenuItems = [...this.menuItems];
    }
  }

  deleteContentType(contentType: string): void {
    this.confirmationService.confirm({
      message: this.translate.instant(
        'SIDEBAR.PATHS.CONFIRM_DELETE_CONTENT_TYPE.MESSAGE',
        { contentType }
      ),
      header: this.translate.instant(
        'SIDEBAR.PATHS.CONFIRM_DELETE_CONTENT_TYPE.HEADER'
      ),
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: this.translate.instant(
        'SIDEBAR.PATHS.CONFIRM_DELETE_CONTENT_TYPE.ACCEPT'
      ),
      rejectLabel: this.translate.instant(
        'SIDEBAR.PATHS.CONFIRM_DELETE_CONTENT_TYPE.REJECT'
      ),
      accept: () => {
        const wasSelected = this.selectedContentType === contentType;

        delete this.requestBodyContent[contentType];
        this.requestBodyContentAsArray = this.requestBodyContentAsArray.filter(
          (item) => item.contentType !== contentType
        );

        this.initializeFilteredMenuItems();
        this.initializeMenuItemsMap();
        this.refreshRequestBodyContentKeys();

        if (wasSelected) {
          const first = this.requestBodyContentKeys[0];
          if (first) {
            this.selectContentType(first);
          } else {
            this.selectedContentType = '';
            this.selectedSchema = null;
          }
        }

        this.updateSwaggerSpec();

        this.messageService.add({
          severity: 'success',
          summary: this.translate.instant(
            'SIDEBAR.PATHS.CONFIRM_DELETE_CONTENT_TYPE.SUCCESS_SUMMARY'
          ),
          detail: this.translate.instant(
            'SIDEBAR.PATHS.CONFIRM_DELETE_CONTENT_TYPE.SUCCESS_DETAIL',
            { contentType }
          ),
          life: 3000,
        });
      },
    });
  }

  get getApiDataService(): ApiDataService {
    return this.apiDataService;
  }

  private refreshRequestBodyContentKeys(): void {
    this.requestBodyContentKeys = Object.keys(this.requestBodyContent || {});
  }

  getNativeButton(index: number): HTMLElement | null {
    const buttons =
      this.buttonContainer.nativeElement.querySelectorAll('.p-splitbutton');
    return buttons[index]?.querySelector('button') || null;
  }

  selectContentType(contentType: string): void {
    this.selectedContentType = contentType;

    this.selectedSchema =
      this.requestBodyContent?.[contentType]?.schema || null;
  }

  initializeFilteredMenuItems(): void {
    if (!this.menuItems || this.menuItems.length === 0) {
      return;
    }

    const existingContentTypes = Object.keys(this.requestBodyContent || {});

    this.filteredMenuItems = this.menuItems.filter((item) => {
      if (!item.label) return false;
      return !existingContentTypes.includes(item.label.trim());
    });
  }

  updateRequestBody(): void {
    if (this.methodDetails) {
      this.methodDetails.get('requestBody')?.setValue(this.requestBodyValue);
    }
  }

  updateSwaggerSpec(): void {
    if (!this.selectedSchema || !this.selectedContentType) {
      console.warn('No selected schema or content type to update.');
      return;
    }

    let swaggerSpec = this.apiDataService.getSelectedSwaggerSpecValue();

    if (!swaggerSpec) {
      console.error('Error: Swagger spec is null. Creating a new one.');
      swaggerSpec = { paths: {} };
    }

    if (!swaggerSpec.paths) {
      console.error('Error: Swagger paths are null. Initializing.');
      swaggerSpec.paths = {};
    }

    if (!swaggerSpec.paths[this.apiPath]) {
      console.warn(`API path '${this.apiPath}' not found. Creating it.`);
      swaggerSpec.paths[this.apiPath] = {};
    }

    if (!swaggerSpec.paths[this.apiPath][this.method]) {
      console.warn(`Method '${this.method}' not found. Creating it.`);
      swaggerSpec.paths[this.apiPath][this.method] = {
        requestBody: { content: {} },
      };
    }

    if (!swaggerSpec.paths[this.apiPath][this.method].requestBody) {
      console.warn(
        `Request body for method '${this.method}' is missing. Creating it.`
      );
      swaggerSpec.paths[this.apiPath][this.method].requestBody = {
        content: {},
      };
    }

    if (!swaggerSpec.paths[this.apiPath][this.method].requestBody.content) {
      console.warn(`Request body content is missing. Creating it.`);
      swaggerSpec.paths[this.apiPath][this.method].requestBody.content = {};
    }

    if (
      !swaggerSpec.paths[this.apiPath][this.method].requestBody.content[
        this.selectedContentType
      ]
    ) {
      console.warn(
        `Content type '${this.selectedContentType}' is missing. Creating it.`
      );
      swaggerSpec.paths[this.apiPath][this.method].requestBody.content[
        this.selectedContentType
      ] = { schema: {} };
    }

    swaggerSpec.paths[this.apiPath][this.method].requestBody.description =
      this.selectedSchema.description;

    swaggerSpec.paths[this.apiPath][this.method].requestBody.content =
      this.requestBodyContent;

    this.apiDataService.updateSwaggerSpec(swaggerSpec);
    this.apiDataService.saveSwaggerSpecToStorage(swaggerSpec);
  }

  onSchemaUpdated(updatedSchema: any): void {
    this.selectedSchema = updatedSchema;

    let swaggerSpec = this.apiDataService.getSelectedSwaggerSpecValue();

    swaggerSpec.paths[this.apiPath][this.method].requestBody.content[
      this.selectedContentType
    ].schema = this.selectedSchema;

    this.apiDataService.updateSwaggerSpec(swaggerSpec);
    this.apiDataService.saveSwaggerSpecToStorage(swaggerSpec);
  }

  onDescriptionChange(): void {
    if (this.selectedSchema) {
      this.selectedSchema.description = this.description;
    }

    this.updateSwaggerSpec();
  }

  debouncedDescriptionUpdate(delay = 300) {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.onDescriptionChange();
    }, delay);
  }

  findDescription(obj: any): string {
    if (!obj || typeof obj !== 'object') return '';

    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (key === 'description' && typeof obj[key] === 'string') {
          return obj[key];
        } else if (typeof obj[key] === 'object') {
          const desc = this.findDescription(obj[key]);
          if (desc) return desc;
        }
      }
    }
    return '';
  }
}
