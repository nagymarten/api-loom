import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  Output,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastModule } from 'primeng/toast';
import { TabsModule } from 'primeng/tabs';
import { ButtonModule } from 'primeng/button';
import { ChipModule } from 'primeng/chip';
import { SplitButtonModule } from 'primeng/splitbutton';
import { SelectModule } from 'primeng/select';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { TextareaModule } from 'primeng/textarea';
import { FloatLabelModule } from 'primeng/floatlabel';
import { FloatLabel } from 'primeng/floatlabel';
import { MessageModule } from 'primeng/message';
import { TooltipModule } from 'primeng/tooltip';
import { TypeDetailsPopcoverComponent } from '../parameters/type-details-popcover/type-details-popcover.component';
import { InputTextModule } from 'primeng/inputtext';
import { PopoverModule } from 'primeng/popover';
import { DividerModule } from 'primeng/divider';
import { SchemaTabsComponent } from '../../components/schema-tabs/schema-tabs.component';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { ApiDataService } from '../../../services/api-data.service';
import { MenuModule } from 'primeng/menu';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
  selector: 'app-responses',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    TranslateModule,
    ToastModule,
    TabsModule,
    ButtonModule,
    ChipModule,
    SplitButtonModule,
    SelectModule,
    DropdownModule,
    FormsModule,
    TranslateModule,
    ToastModule,
    TabsModule,
    ButtonModule,
    ChipModule,
    SplitButtonModule,
    SelectModule,
    TextareaModule,
    FloatLabelModule,
    FloatLabel,
    MessageModule,
    TooltipModule,
    TypeDetailsPopcoverComponent,
    InputTextModule,
    PopoverModule,
    DividerModule,
    SchemaTabsComponent,
    MenuModule,
    ConfirmDialogModule,
  ],
  templateUrl: './responses.component.html',
  styleUrls: ['./responses.component.css'],
  standalone: true,
  providers: [MessageService],
})
export class ResponsesComponent {
  private _responses: { [key: string]: any } = {};

  @Input() specVersion: '2.0' | '3.0' | '3.1.0' | '3.0.0' = '2.0';
  @Input()
  set responses(value: { [key: string]: any }) {
    if (value) {
      this._responses = value;
      this.fetchResponses(value);
    }
  }
  @Input() apiPath!: string;
  @Input() method!: string;
  @Input() swaggerSpec!: any;

  @Output() responsesChange = new EventEmitter<{ [status: string]: any }>();

  @ViewChild('buttonContainer', { static: true }) buttonContainer!: ElementRef;
  @ViewChild('underline', { static: true }) underline!: ElementRef;
  @ViewChildren('buttonRef') buttonRefs!: QueryList<ElementRef>;

  get responses(): { [key: string]: any } {
    return this._responses;
  }

  get getApiDataService(): ApiDataService {
    return this.apiDataService;
  }
  private debounceTimer: any;

  response: string = '';
  apiResponse: any[] = [];
  responseDetailsForm!: FormGroup;
  swaggerSubscription!: Subscription;
  selectedResponseData: any = null;
  responseKeys: string[] = [];
  selectedStatus: string | null = null;
  selectedStatusCode: string | null = null;
  headerParams: any[] = [];
  menuItemsMap: { [key: string]: MenuItem[] } = {};
  selectedContentType: string = '';
  requestBodyContent: { [key: string]: any } = {};
  requestBodyContentAsArray: any[] = [];
  nameOfId: string = 'myappika';
  selectedSchema: any;
  filteredMenuItems: MenuItem[] = [];
  filterText: string = '';
  menuItems: MenuItem[] = [];
  statusCodeMenuItems: MenuItem[] = [];
  filteredStatusCodeMenuItems: MenuItem[] = [];
  statusCodeFilterText: string = '';

  types = [
    { name: 'string' },
    { name: 'number' },
    { name: 'boolean' },
    { name: 'array' },
    { name: 'object' },
  ];
  statusCodeOptions = [
    { label: '100: Continue', value: '100' },
    { label: '101: Switching Protocols', value: '101' },
    { label: '102: Processing (WebDAV)', value: '102' },
    { label: '103: Early Hints', value: '103' },

    { label: '200: OK', value: '200' },
    { label: '201: Created', value: '201' },
    { label: '202: Accepted', value: '202' },
    { label: '203: Non-Authoritative Information', value: '203' },
    { label: '204: No Content', value: '204' },
    { label: '205: Reset Content', value: '205' },
    { label: '206: Partial Content', value: '206' },
    { label: '207: Multi-Status (WebDAV)', value: '207' },
    { label: '208: Already Reported (WebDAV)', value: '208' },
    { label: '226: IM Used', value: '226' },

    { label: '300: Multiple Choices', value: '300' },
    { label: '301: Moved Permanently', value: '301' },
    { label: '302: Found', value: '302' },
    { label: '303: See Other', value: '303' },
    { label: '304: Not Modified', value: '304' },
    { label: '305: Use Proxy', value: '305' },
    { label: '306: (Unused)', value: '306' },
    { label: '307: Temporary Redirect', value: '307' },
    { label: '308: Permanent Redirect', value: '308' },

    { label: '400: Bad Request', value: '400' },
    { label: '401: Unauthorized', value: '401' },
    { label: '402: Payment Required', value: '402' },
    { label: '403: Forbidden', value: '403' },
    { label: '404: Not Found', value: '404' },
    { label: '405: Method Not Allowed', value: '405' },
    { label: '406: Not Acceptable', value: '406' },
    { label: '407: Proxy Authentication Required', value: '407' },
    { label: '408: Request Timeout', value: '408' },
    { label: '409: Conflict', value: '409' },
    { label: '410: Gone', value: '410' },
    { label: '411: Length Required', value: '411' },
    { label: '412: Precondition Failed', value: '412' },
    { label: '413: Payload Too Large', value: '413' },
    { label: '414: URI Too Long', value: '414' },
    { label: '415: Unsupported Media Type', value: '415' },
    { label: '416: Range Not Satisfiable', value: '416' },
    { label: '417: Expectation Failed', value: '417' },
    { label: '418: I’m a teapot (RFC 2324)', value: '418' },
    { label: '420: Enhance Your Calm (Twitter)', value: '420' },
    { label: '421: Misdirected Request', value: '421' },
    { label: '422: Unprocessable Entity (WebDAV)', value: '422' },
    { label: '423: Locked (WebDAV)', value: '423' },
    { label: '424: Failed Dependency (WebDAV)', value: '424' },
    { label: '425: Too Early', value: '425' },
    { label: '426: Upgrade Required', value: '426' },
    { label: '428: Precondition Required', value: '428' },
    { label: '429: Too Many Requests', value: '429' },
    { label: '431: Request Header Fields Too Large', value: '431' },
    { label: '444: No Response (Nginx)', value: '444' },
    { label: '449: Retry With (Microsoft)', value: '449' },
    { label: '450: Blocked by Windows Parental Controls', value: '450' },
    { label: '451: Unavailable For Legal Reasons', value: '451' },
    { label: '499: Client Closed Request (Nginx)', value: '499' },

    { label: '500: Internal Server Error', value: '500' },
    { label: '501: Not Implemented', value: '501' },
    { label: '502: Bad Gateway', value: '502' },
    { label: '503: Service Unavailable', value: '503' },
    { label: '504: Gateway Timeout', value: '504' },
    { label: '505: HTTP Version Not Supported', value: '505' },
    { label: '506: Variant Also Negotiates (Experimental)', value: '506' },
    { label: '507: Insufficient Storage (WebDAV)', value: '507' },
    { label: '508: Loop Detected (WebDAV)', value: '508' },
    { label: '509: Bandwidth Limit Exceeded (Apache)', value: '509' },
    { label: '510: Not Extended', value: '510' },
    { label: '511: Network Authentication Required', value: '511' },
    { label: '598: Network Read Timeout Error', value: '598' },
    { label: '599: Network Connect Timeout Error', value: '599' },
  ];
  headers: any[] = [];

  refOptions = [
    { label: 'SwaggerHub', value: 'swaggerhub' },
    { label: 'External URL', value: 'url' },
    { label: 'This File', value: 'file' },
    { label: 'This Project', value: 'project' },
  ];

  selectedRefType = 'swaggerhub';
  refInput = '';

  private apiDataService = inject(ApiDataService);
  private messageService = inject(MessageService);
  private cdr = inject(ChangeDetectorRef);
  private translate = inject(TranslateService);
  private confirmationService = inject(ConfirmationService);

  ngOnInit(): void {
    this.initializeRequestPage();
    this.initializeMenuItemsMap();
    this.initializeStatusCodeMenu();
  }

  ngAfterViewInit(): void {
    this.initializeUnderline();
  }

  private initializeRequestPage(): void {
    this.initializeRequestBody();
    this.initializeMenuItems();

    const contentKeys = this.getRequestBodyContentKeys();
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

  onSchemaUpdated(updatedSchema: any): void {
    this.selectedSchema = updatedSchema;

    let swaggerSpec = this.apiDataService.getSelectedSwaggerSpecValue();

    if (this.selectedStatus) {
      swaggerSpec.paths[this.apiPath][this.method].responses[
        this.selectedStatus
      ].content = this.requestBodyContent;
    } else {
      console.warn('Selected status is null.');
    }

    this.apiDataService.updateSwaggerSpec(swaggerSpec);
    this.apiDataService.saveSwaggerSpecToStorage(swaggerSpec);
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
      accept: () => {
        delete this.requestBodyContent[contentType];
        this.requestBodyContentAsArray = this.requestBodyContentAsArray.filter(
          (item) => item.contentType !== contentType
        );

        this.initializeFilteredMenuItems();
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

  private setUnderlinePosition(button: HTMLElement): void {
    const buttonRect = button.getBoundingClientRect();
    const containerRect =
      this.buttonContainer.nativeElement.getBoundingClientRect();

    this.underline.nativeElement.style.width = `${buttonRect.width}px`;
    this.underline.nativeElement.style.transform = `translateX(${
      buttonRect.left - containerRect.left
    }px)`;
  }

  initializeUnderline(): void {
    const firstButton = this.buttonRefs.first?.nativeElement;
    if (firstButton) {
      this.selectedContentType = firstButton.innerText.trim();
      this.setUnderlinePosition(firstButton);
    }
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

  initializeMenuItemsMap(): void {
    this.menuItemsMap = {};

    this.getRequestBodyContentKeys().forEach((contentType) => {
      this.menuItemsMap[contentType] = this.getMenuItems(contentType);
    });
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

    this.cdr.detectChanges();
    this.initializeMenuItemsMap();

    this.updateSwaggerSpec();
    setTimeout(() => {
      this.selectContentType(type);
    }, 50);
  }

  fetchResponses(responses: { [key: string]: any }) {
    this.responseKeys = Object.keys(responses);

    if (!this.selectedStatus && this.responseKeys.length > 0) {
      this.selectedStatus = this.responseKeys[0];
      this.selectedResponseData = responses[this.selectedStatus];
    }

    const current = responses[this.selectedStatus!];

    const headers = current?.headers;
    this.headerParams = Array.isArray(headers)
      ? [...headers]
      : headers && typeof headers === 'object'
      ? Object.entries(headers).map(([name, value]) => ({
          name,
          ...(typeof value === 'object' && value !== null ? value : {}),
        }))
      : [];

    if (current?.content) {
      this.requestBodyContent = Object.assign({}, current.content);

      this.requestBodyContentAsArray = Object.entries(
        this.requestBodyContent
      ).map(([key, value]) => ({
        contentType: key,
        schema: value?.schema || null,
      }));

      const contentKeys = this.getRequestBodyContentKeys();
      if (contentKeys.length > 0) {
        if (
          !this.selectedContentType ||
          !this.requestBodyContent[this.selectedContentType]
        ) {
          this.selectedContentType = contentKeys[0];
        }
        this.selectedSchema =
          this.requestBodyContent[this.selectedContentType]?.schema || null;
      }

      this.initializeFilteredMenuItems();
    } else {
      this.requestBodyContent = {};
      this.requestBodyContentAsArray = [];
      this.selectedContentType = '';
      this.selectedSchema = null;
      this.filteredMenuItems = [...this.menuItems];
    }
  }

  initializeRequestBody(): void {
    if (
      !this.requestBodyContent ||
      Object.keys(this.requestBodyContent).length === 0
    ) {
      this.requestBodyContent = {};
      this.requestBodyContentAsArray = [];
      this.selectedContentType = '';
      this.selectedSchema = null;
      this.filteredMenuItems = [...this.menuItems];
    }
  }

  emitUpdate() {
    this.fetchResponses(this.responses);
  }

  addHeader(): void {
    const newHeader =
      this.specVersion === '2.0'
        ? {
            name: '',
            description: '',
            required: false,
            type: 'string',
          }
        : {
            name: '',
            description: '',
            required: false,
            schema: { type: 'string' },
          };
    this.headerParams.push(newHeader);
    this.emitResponsesUpdate();
  }

  getRequestBodyContentKeys(): string[] {
    return Object.keys(this.requestBodyContent || {});
  }

  initializeStatusCodeMenu(): void {
    this.statusCodeMenuItems = this.statusCodeOptions.map((option) => ({
      label: option.label,
      command: () => this.onStatusAdd(option.value),
    }));
    this.filteredStatusCodeMenuItems = [...this.statusCodeMenuItems];
  }

  filterStatusCodeMenuItems(): void {
    if (!this.statusCodeFilterText.trim()) {
      this.filteredStatusCodeMenuItems = [...this.statusCodeMenuItems];
    } else {
      const filter = this.statusCodeFilterText.toLowerCase();
      this.filteredStatusCodeMenuItems = this.statusCodeMenuItems.filter(
        (item) => item.label?.toLowerCase().includes(filter)
      );
    }
  }

  updateSwaggerSpec(): void {
    if (!this.selectedSchema || !this.selectedContentType) {
      console.warn('❌ No selected schema or content type to update.');
      return;
    }

    let swaggerSpec = this.apiDataService.getSelectedSwaggerSpecValue();

    if (this.selectedStatus) {
      swaggerSpec.paths[this.apiPath][this.method].responses[
        this.selectedStatus
      ].content = this.requestBodyContent;
    } else {
      console.warn('Selected status is null.');
    }

    this.apiDataService.updateSwaggerSpec(swaggerSpec);
    this.apiDataService.saveSwaggerSpecToStorage(swaggerSpec);
  }

  onChildDelete() {
    this.updateSwaggerSpec();
  }

  addResponseHeader(): void {
    if (!this.selectedResponseData.headers) {
      this.selectedResponseData.headers = [];
    }

    this.selectedResponseData.headers.push({
      name: '',
      description: '',
      schema: { type: 'string' },
    });

    this.emitUpdate();
  }

  removeResponseHeader(index: number): void {
    this.selectedResponseData.headers.splice(index, 1);
    this.emitUpdate();
  }

  onStatusAdd(statusCode: string) {
    if (statusCode && !this.responses[statusCode]) {
      const newResponse =
        this.specVersion === '2.0'
          ? {
              description: '',
              headers: [],
            }
          : {
              description: '',
              content: {},
              headers: [],
            };

      this.responses[statusCode] = newResponse;

      this.selectedStatus = statusCode;
      this.selectedResponseData = this.responses[statusCode];

      if (!this.responseKeys.includes(statusCode)) {
        this.responseKeys.push(statusCode);
      }

      this.headerParams = [];

      this.emitResponsesUpdate();

      this.fetchResponses(this.responses);
    }
    this.selectedStatusCode = statusCode;
  }

  debouncedEmitUpdate(delay = 300) {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.emitResponsesUpdate();
    }, delay);
  }

  selectContentType(contentType: string): void {
    this.selectedContentType = contentType;

    this.selectedSchema =
      this.requestBodyContent?.[contentType]?.schema || null;
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

  emitResponsesUpdate(): void {
    if (this.selectedStatus && this.responses[this.selectedStatus]) {
      this.responses[this.selectedStatus].headers = [...this.headerParams];
      this.responses[this.selectedStatus].description =
        this.selectedResponseData.description;

      if (this.specVersion !== '2.0') {
        this.responses[this.selectedStatus].schema =
          this.selectedResponseData.schema;
      } else {
        delete this.responses[this.selectedStatus].schema;
      }
    }

    this.responsesChange.emit({ ...this.responses });
  }

  removeStatus(status: string): void {
    this.responseKeys = this.responseKeys.filter((s) => s !== status);
    delete this.responses[status];

    if (this.selectedStatus === status) {
      this.selectedStatus = this.responseKeys[0] || null;
      this.selectedResponseData = this.selectedStatus
        ? this.responses[this.selectedStatus]
        : null;
    }

    this.emitResponsesUpdate();
    this.fetchResponses(this.responses);
  }

  onResponseClick(status: string) {
    this.selectedStatus = status;
    this.selectedResponseData = this.responses[status];
    this.fetchResponses(this.responses);
  }

  getChipStyle(status: string): { [key: string]: string } {
    const code = status.toString();
    const firstDigit = code[0];

    const backgroundColors: { [key: string]: string } = {
      '2': '#22c55e', // green
      '3': '#0ea5e9', // blue
      '4': '#f97316', // orange
      '5': '#ef4444', // red
    };

    return {
      backgroundColor: backgroundColors[firstDigit] || '#d1d5db', // default gray
    };
  }
  requiredToggle(param: any) {
    param.required = !param.required;
    this.emitResponsesUpdate();
  }

  toggleChildOverlay(
    event: Event,
    popover: TypeDetailsPopcoverComponent
  ): void {
    popover.openPopover(event);
  }

  onPopoverClosed(updatedParam: any, index: number): void {
    this.headerParams[index] = updatedParam;

    this.debouncedEmitUpdate();
  }

  remove(param: any): void {
    const index = this.headerParams.indexOf(param);
    if (index > -1) {
      this.headerParams.splice(index, 1);
      this.emitResponsesUpdate();
    }
  }
}
