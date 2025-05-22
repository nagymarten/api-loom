import { Component, inject, ViewChild } from '@angular/core';
import { TabsModule } from 'primeng/tabs';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { Popover, PopoverModule } from 'primeng/popover';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { AvatarModule } from 'primeng/avatar';
import { Drawer, DrawerModule } from 'primeng/drawer';
import { StyleClassModule } from 'primeng/styleclass';
import { ImportsModule } from '../../../imports';
import Keycloak from 'keycloak-js';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { ContextMenu, ContextMenuModule } from 'primeng/contextmenu';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { ApiDataService } from '../../../services/api-data.service';
import { filter, firstValueFrom, Subscription } from 'rxjs';
import * as yaml from 'js-yaml';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { RadioButtonModule } from 'primeng/radiobutton';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MatIconModule } from '@angular/material/icon';
import { TooltipModule } from 'primeng/tooltip';
import { ExtendedSwaggerSpec } from '../../../models/swagger.types';

@Component({
  selector: 'app-drawer-menu',
  imports: [
    TabsModule,
    PopoverModule,
    OverlayPanelModule,
    ButtonModule,
    ToolbarModule,
    AvatarModule,
    DrawerModule,
    ImportsModule,
    StyleClassModule,
    TranslateModule,
    RouterModule,
    ContextMenuModule,
    DialogModule,
    ToastModule,
    RadioButtonModule,
    ConfirmDialogModule,
    MatIconModule,
    TooltipModule,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './drawer-menu.component.html',
  styleUrl: './drawer-menu.component.css',
})
export class DrawerMenuComponent {
  [x: string]: any;
  @ViewChild('drawerRef') drawerRef!: Drawer;
  @ViewChild('logOutPop') logOutPop!: Popover;
  @ViewChild('referencesContextMenu') referencesContextMenu!: ContextMenu;
  @ViewChild('contextMenu') contextMenu!: ContextMenu;
  @ViewChild('pathMethodContextMenu') pathMethodContextMenu!: ContextMenu;

  visible = false;
  avatarLabel: string | undefined;
  username: string | undefined;
  isReferencesExpanded = false;
  languages = [
    { name: 'English', code: 'en' },
    { name: 'Magyar', code: 'hu' },
    { name: 'Deutsch', code: 'de' },
  ];
  validHttpMethods = [
    'get',
    'post',
    'put',
    'delete',
    'patch',
    'head',
    'options',
    'trace',
  ];
  swaggerKeys: string[] = [];
  newPathName: string = '';
  renameEndpointDialogVisible: boolean = false;
  modelContextMenuItems: MenuItem[] = [];
  newMethodKey: string = '';
  renameModelDialogVisible: boolean = false;
  newModelNameInput: string = '';
  selectedPath: any = null;
  selectedMethod: any = null;
  pathEndpointItems: MenuItem[] = [];
  contextMenuItems: MenuItem[] = [];
  visibleAddPath: boolean = false;
  isDarkMode = false;
  selectedFormat: 'json' | 'yaml' = 'json';
  selectedLanguage: any;
  visibleAddModel: boolean = false;
  referencesHeaderMenuItems: MenuItem[] | undefined;
  referencesMenuItems: MenuItem[] = [];
  isModelsExpanded: boolean = true;
  selectedModel: any = null;
  currentMenu: any = null;
  isAddNewRefDialogVisible: boolean = false;
  paths: { [key: string]: any } = {};
  models: any[] = [];
  selectedModelName: string = '';
  swaggerSubscription!: Subscription;
  newOpenApiTitle: string = '';
  selectedFileType: 'yaml' | 'json' = 'json';
  selectedVersion: 'v3.1' | 'v3.0' | 'v2.0' = 'v3.1';
  selectedSwaggerKey: string | null = null;
  swaggerSpec: any = null;
  selectedItem: any;
  isExportDialogVisible: boolean = false;
  editingPath: string | null = null;
  newModelName: string = '';
  selectedPathName: string = '';
  newPathNameInput: string = '';
  renamePathDialogVisible: boolean = false;
  referenceContextMenuItems: MenuItem[] = [];
  renameReferenceDialogVisible: boolean = false;
  newReferenceNameInput: string = '';
  selectedSection:
    | 'home'
    | 'reference'
    | 'overview'
    | 'method'
    | 'model'
    | null = null;
  isPathsExpanded: boolean = true;
  isMobile = false;
  id: string = '';
  swaggerSpecFromApi: ExtendedSwaggerSpec | null = null;

  private keycloak = inject(Keycloak);
  private translate = inject(TranslateService);
  private apiDataService = inject(ApiDataService);
  private router = inject(Router);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  async ngOnInit(): Promise<void> {
    this.initLanguage();
    this.initUserProfile();

    const saved = localStorage.getItem('theme');
    this.isDarkMode = saved === 'dark';

    if (this.isDarkMode) {
      document.documentElement.classList.add('my-app-dark');
    }

    await firstValueFrom(this.apiDataService.getAllSwaggerSpecsFromApi());

    this.initializeComponentState();

    this.syncSelectedStateFromRoute();

    this.isMobile = window.innerWidth < 768;
    this.visible = !this.isMobile;

    window.addEventListener('resize', () => {
      this.isMobile = window.innerWidth < 768;
      this.visible = !this.isMobile;
    });

    this.setupContextMenuItems();
  }

  toggleReferences() {
    this.isReferencesExpanded = !this.isReferencesExpanded;
  }

  openDrawer() {
    this.visible = true;
  }

  syncSelectedStateFromRoute(): void {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event) => {
        const navEnd = event as NavigationEnd;
        const url = navEnd.urlAfterRedirects;

        if (url.startsWith('/reference/')) {
          this.selectedSection = 'overview';
        } else if (url.startsWith('/path/')) {
          const segments = url.split('/');
          const pathKey = decodeURIComponent(segments[2] || '');
          const method = segments[3] || '';
          this.selectedSection = 'method';
          this.selectedPath = { key: pathKey };
          this.selectedMethod = { method };
        } else if (url.startsWith('/schemas/')) {
          const modelName = url.split('/')[2] || '';
          this.selectedSection = 'model';
          this.selectedModel = { name: modelName };
        } else {
          this.selectedSection = null;
        }

        if (navEnd.url === '/') {
          this.selectedSwaggerKey = null;
          this.apiDataService.clearSelectedSwaggerSpec();
          this.apiDataService.clearCurrentSpec();
          this.paths = {};
          this.models = [];
          this.apiDataService.updateSetInIndex(true);
        } else {
          const selectedKey = this.apiDataService.getSelectedSwaggerKey();
          const allSpecs = this.apiDataService.getAllSwaggerSpecs();

          if (selectedKey && allSpecs[selectedKey]) {
            this.swaggerKeys = Object.keys(allSpecs);

            this.selectedSwaggerKey = selectedKey;
            this.swaggerSpec = allSpecs[selectedKey];

            this.paths = this.getPaths(this.swaggerSpec);
            this.models = this.getModels(this.swaggerSpec);
          }
        }
      });
  }

  onMethodSelect(pathKey: string, methodName: string): void {
    this.selectedPath = { key: pathKey };
    this.selectedMethod = { method: methodName };
    this.selectedSection = 'method';
    this.apiDataService.updateSetInIndex(false);
    this.router.navigate(['/path', pathKey, methodName]);
  }

  private async initUserProfile(): Promise<void> {
    try {
      const profile = await this.keycloak.loadUserProfile();
      this.username = profile.username;
      this.id = profile.id || '';

      const parts = this.username ? this.username.trim().split(' ') : [];
      if (parts.length >= 2) {
        this.avatarLabel = (parts[0][0] + parts[1][0]).toUpperCase();
      } else {
        this.avatarLabel = this.username
          ? this.username.slice(0, 2).toUpperCase()
          : '';
      }
    } catch (error) {
      console.error('Failed to load Keycloak user profile:', error);
    }
  }

  private initLanguage(): void {
    const savedLang = localStorage.getItem('language') || 'en';
    this.selectedLanguage = this.languages.find(
      (lang) => lang.code === savedLang
    );
    this.translate.setDefaultLang(savedLang);
    this.translate.use(savedLang);
  }

  hasPaths(): boolean {
    return this.paths && Object.keys(this.paths).length > 0;
  }

  hasModels(): boolean {
    return this.models && this.models.length > 0;
  }

  private setupContextMenuItems(): void {
    this.translate
      .get([
        'SIDEBAR.REFERENCES.RIGHTMENU.ADDOPENAPI',
        'SIDEBAR.REFERENCES.RIGHTMENU.NEWMODEL',
        'SIDEBAR.REFERENCES.RIGHTMENU.IMPORT',
        'SIDEBAR.REFERENCES.RIGHTMENU.COPY_PATH',
        'SIDEBAR.REFERENCES.RIGHTMENU.COPY_RELATIVE_PATH',
        'SIDEBAR.REFERENCES.RIGHTMENU.RENAME',
        'SIDEBAR.REFERENCES.RIGHTMENU.DELETE',
        'SIDEBAR.PATHS.RIGHTMENU.NEW_PATH',
        'SIDEBAR.PATHS.RIGHTMENU.COPY_PATH',
        'SIDEBAR.PATHS.RIGHTMENU.COPY_RELATIVE_PATH',
        'SIDEBAR.MODELS.RIGHTMENU.NEW_MODEL',
        'SIDEBAR.MODELS.RIGHTMENU.COPY_PATH',
        'SIDEBAR.MODELS.RIGHTMENU.COPY_RELATIVE_PATH',
        'SIDEBAR.MODELS.RIGHTMENU.RENAME_MODEL',
        'SIDEBAR.MODELS.RIGHTMENU.DELETE_MODEL',
      ])
      .subscribe((translations) => {
        this.modelContextMenuItems = [
          {
            label: translations['SIDEBAR.REFERENCES.RIGHTMENU.RENAME'],
            icon: 'pi pi-pencil',
            command: () => this.openRenameModelDialog(this.selectedModelName),
          },
          {
            label: translations['SIDEBAR.REFERENCES.RIGHTMENU.DELETE'],
            icon: 'pi pi-trash',
            command: () => this.deleteModel(),
          },
        ];

        this.referencesHeaderMenuItems = [
          {
            label: translations['SIDEBAR.REFERENCES.RIGHTMENU.ADDOPENAPI'],
            icon: 'pi pi-plus',
            items: [
              {
                label: 'YAML',
                items: [
                  {
                    label: 'v3.1',
                    command: () => this.openAddNewRefDialog('yaml', 'v3.1'),
                  },
                  {
                    label: 'v3.0',
                    command: () => this.openAddNewRefDialog('yaml', 'v3.0'),
                  },
                  {
                    label: 'v2.0',
                    command: () => this.openAddNewRefDialog('yaml', 'v2.0'),
                  },
                ],
              },
              {
                label: 'JSON',
                items: [
                  {
                    label: 'v3.1',
                    command: () => this.openAddNewRefDialog('json', 'v3.1'),
                  },
                  {
                    label: 'v3.0',
                    command: () => this.openAddNewRefDialog('json', 'v3.0'),
                  },
                  {
                    label: 'v2.0',
                    command: () => this.openAddNewRefDialog('json', 'v2.0'),
                  },
                ],
              },
            ],
          },
          {
            label: translations['SIDEBAR.REFERENCES.RIGHTMENU.IMPORT'],
            icon: 'pi pi-download',
            items: [
              {
                label: 'YAML',
                icon: 'pi pi-file',
                command: () => this.triggerFileUpload('yaml'),
              },
              {
                label: 'JSON',
                icon: 'pi pi-file',
                command: () => this.triggerFileUpload('json'),
              },
            ],
          },
        ];
      });
  }

  createNewModel(): void {
    this.visibleAddModel = true;
  }

  onNavigateHome(): void {
    this.selectedSwaggerKey = null;
    this.apiDataService.clearSelectedSwaggerSpec();
    this.apiDataService.clearCurrentSpec();
    this.paths = {};
    this.models = [];
    this.apiDataService.updateSetInIndex(true);
  }

  getMethodColor(method: string): string {
    switch (method.toLowerCase()) {
      case 'get':
        return 'bg-green-500';
      case 'post':
        return 'bg-blue-500';
      case 'put':
        return 'bg-indigo-500';
      case 'patch':
        return 'bg-orange-400';
      case 'delete':
        return 'bg-red-500';
      case 'head':
      case 'options':
      case 'trace':
        return 'bg-gray-500';
      default:
        return 'bg-gray-400';
    }
  }

  saveAndNavigate(): void {
    this.saveNewModel();

    this.router.navigate(['/schemas', this.newModelName.trim()]);
    this.newModelName = '';
  }

  selectModel(model: any): void {
    this.selectedModel = model;
    this.selectedModelName = model.name;
    this.selectedSection = 'model';
    this.apiDataService.updateSetInIndex(false);
    this.router.navigate(['/schemas', model.name]);
  }

  onNavigateToReferenceOverview(): void {
    if (!this.selectedSwaggerKey) return;

    this.apiDataService.updateSetInIndex(false);
    this.selectedSection = 'overview';
    this.router.navigate(['/reference', this.selectedSwaggerKey]);
  }

  deleteReference(key: string): void {
    try {
      const isDeletedSelected = this.selectedSwaggerKey === key;

      this.apiDataService.deleteSwaggerSpecFromStorage(key);

      const chosenRef = this.apiDataService.getSwaggerSpecIdByKeyFromApi(key);
      if (chosenRef) {
        this.apiDataService.deleteSwaggerSpecFromDatabase(chosenRef);
      }

      const allSpecs = this.apiDataService.getAllSwaggerSpecs();
      this.swaggerKeys = Object.keys(allSpecs);

      if (this.swaggerKeys.length === 0) {
        this.paths = {};
        this.models = [];
        this.selectedSwaggerKey = null;

        this.apiDataService.clearSelectedSwaggerSpec();
        this.apiDataService.clearCurrentSpec();

        this.router.navigate(['/']);
      } else if (isDeletedSelected) {
        this.selectedSwaggerKey = this.swaggerKeys[0];
        this.apiDataService.setSelectedSwaggerSpec(this.selectedSwaggerKey);
        this.router.navigate(['/reference', this.selectedSwaggerKey]);
      }

      this.initializeComponentState();
    } catch (error) {
      console.error(`Error deleting Swagger spec with key "${key}":`, error);
    }
  }

  exportReference(): void {
    this.isExportDialogVisible = true;
  }

  getFlagUrl(code: string): string {
    if (code === 'en') return 'https://flagcdn.com/gb.svg'; // UK flag for English
    if (code === 'hu') return 'https://flagcdn.com/hu.svg'; // Hungary
    if (code === 'de') return 'https://flagcdn.com/de.svg'; // Germany
    return 'https://flagcdn.com/unknown.svg'; // fallback
  }

  onLanguageChange(event: any, selectRef: any) {
    const langCode = event.value.code;
    this.translate.use(langCode);
    localStorage.setItem('language', langCode);

    if (selectRef?.el?.nativeElement) {
      selectRef.el.nativeElement.blur();

      selectRef.el.nativeElement.classList.remove('p-focus');
    }
  }

  closeCallback(e: Event): void {
    this.drawerRef.close(e);
  }

  logOut(): void {
    this.apiDataService.clearSelectedSwaggerSpec();
    this.apiDataService.clearSwaggerSpecMemory();

    this.keycloak.logout({
      redirectUri: window.location.origin,
    });
  }
  toggleLogOutPop(event: any) {
    this.logOutPop.toggle(event);
  }

  openAddNewRefDialog(
    fileType: 'yaml' | 'json',
    version: 'v3.1' | 'v3.0' | 'v2.0'
  ): void {
    this.isAddNewRefDialogVisible = true;
    this.newOpenApiTitle = '';
    this.selectedFileType = fileType;
    this.selectedVersion = version;
  }

  triggerFileUpload(fileType: string): void {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = fileType === 'yaml' ? '.yaml,.yml' : '.json';
    fileInput.style.display = 'none';

    fileInput.addEventListener('change', (event: any) =>
      this.handleFileUpload(event, fileType)
    );

    fileInput.click();
  }

  handleFileUpload(event: any, fileType?: string): void {
    const files = event?.target?.files || [];
    if (files.length > 0) {
      (Array.from(files) as File[]).forEach((file: File) => {
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const fileContent = reader.result as string;
            let parsedContent;
            let normalizedFileName = file.name.replace(
              /\.(json|yaml|yml)$/i,
              ''
            );

            if (
              (!fileType || fileType === 'json') &&
              file.name.endsWith('.json')
            ) {
              parsedContent = JSON.parse(fileContent);
            } else if (
              (!fileType || fileType === 'yaml') &&
              (file.name.endsWith('.yaml') || file.name.endsWith('.yml'))
            ) {
              parsedContent = yaml.load(fileContent);
            } else {
              return;
            }

            if (
              !parsedContent ||
              (!parsedContent.swagger && !parsedContent.openapi) ||
              !parsedContent.info ||
              !parsedContent.paths
            ) {
              throw new Error(
                `Invalid Swagger/OpenAPI file: Missing required fields in ${file.name}.`
              );
            }

            this.apiDataService.storeSwaggerSpec(
              normalizedFileName,
              parsedContent
            );

            this.apiDataService.saveSwaggerToDatabase(
              normalizedFileName,
              parsedContent
            );

            this.initializeComponentState();
          } catch (error) {
            console.error(`Error processing file ${file.name}:`, error);
          }
        };

        reader.readAsText(file);
      });

      event.target.value = '';
    }
  }

  createNewPath(): void {
    this.visibleAddPath = true;
  }

  createNewRefModel(_arg0: string): void {
    throw new Error('Method not implemented.');
  }

  initializeComponentState(): void {
    const allSpecs = this.apiDataService.getAllSwaggerSpecs();

    this.swaggerKeys = Object.keys(allSpecs);

    this.paths = {};
    this.models = [];
    this.selectedSwaggerKey = null;

    const currentKey = this.apiDataService.getSelectedSwaggerKey();
    if (currentKey && allSpecs[currentKey]) {
      this.selectedSwaggerKey = currentKey;
      this.loadSwaggerSpec();
      this.paths = this.getPaths(this.swaggerSpec);
      this.models = this.getModels(this.swaggerSpec);
    }
  }

  onReferenceSelect(key: string): void {
    this.selectedSwaggerKey = key;
    this.apiDataService.setSelectedSwaggerSpec(key);
    this.apiDataService.updateSetInIndex(false);
    this.router.navigate(['/reference', key]);
  }

  getModels(swaggerSpec: any): any[] {
    if (!swaggerSpec.components || !swaggerSpec.components.schemas) {
      return [];
    }

    return Object.keys(swaggerSpec.components.schemas)
      .sort()
      .map((key) => ({
        name: key,
      }));
  }

  private downloadFile(
    content: string,
    fileName: string,
    fileType: string
  ): void {
    const blob = new Blob([content], { type: fileType });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
  }

  exportFile(): void {
    this.apiDataService.getSelectedSwaggerSpec().subscribe((swaggerSpec) => {
      if (swaggerSpec) {
        let fileContent: string;
        let fileType: string;
        let fileExtension: string;

        if (this.selectedFormat === 'json') {
          fileContent = JSON.stringify(swaggerSpec, null, 2);
          fileType = 'application/json';
          fileExtension = 'json';
        } else {
          fileContent = yaml.dump(swaggerSpec);
          fileType = 'text/yaml';
          fileExtension = 'yaml';
        }

        const fileName = `${
          swaggerSpec.info?.title || 'openapi'
        }.${fileExtension}`;
        this.downloadFile(fileContent, fileName, fileType);
      } else {
        console.error('No Swagger specification is currently selected.');
      }

      this.isExportDialogVisible = false;
    });
  }

  loadAvailableSwaggerSpecs(): void {
    const allSpecs = this.apiDataService.getAllSwaggerSpecs();
    this.swaggerKeys = Object.keys(allSpecs);

    if (this.swaggerKeys.length > 0) {
      const currentSelected = this.apiDataService.getSelectedSwaggerKey();

      if (!currentSelected || !allSpecs[currentSelected]) {
        this.selectedSwaggerKey = this.swaggerKeys[0];
        this.apiDataService.setSelectedSwaggerSpec(this.selectedSwaggerKey);
        this.router.navigate(['/reference', this.selectedSwaggerKey]);
      } else {
        this.selectedSwaggerKey = currentSelected;
      }

      this.loadSwaggerSpec();
    } else {
      this.selectedSwaggerKey = null;
      this.router.navigate(['/']);
    }
  }

  getPaths(swaggerSpec: any): { [key: string]: any } {
    if (!swaggerSpec || !swaggerSpec.paths) {
      console.warn('Swagger spec or paths is null.');
      return {};
    }

    const apiPaths: { [key: string]: any } = {};

    Object.keys(swaggerSpec.paths).forEach((pathKey) => {
      const methods = Object.keys(swaggerSpec.paths[pathKey])
        .sort()
        .filter((methodKey) => this.validHttpMethods.includes(methodKey))
        .map((methodKey) => {
          const methodDetails = swaggerSpec.paths[pathKey][methodKey];
          return {
            method: methodKey,
            summary: methodDetails.summary,
            description: methodDetails.description,
            responses: JSON.stringify(methodDetails.responses, null, 2),
          };
        });

      apiPaths[pathKey] = methods;
    });

    return apiPaths;
  }

  loadSwaggerSpec(): void {
    if (this.selectedSwaggerKey) {
      this.swaggerSpec = this.apiDataService.getSwaggerSpecByKey(
        this.selectedSwaggerKey
      );
    }
  }

  saveNewPath(): void {
    const newPathKey = this.newPathName.trim();

    if (!newPathKey) {
      this.translate.get('TOAST.PATH_EMPTY').subscribe((translatedMessage) => {
        this.messageService.add({
          severity: 'warn',
          summary: this.translate.instant('TOAST.WARNING'),
          detail: translatedMessage,
          life: 4000,
        });
      });
      return;
    }

    if (!this.paths) {
      this.paths = {};
    }

    this.paths[newPathKey] = [
      {
        method: 'get',
        summary: `Default GET operation for ${newPathKey}`,
        description: `Auto-generated GET operation for ${newPathKey}.`,
        responses: {
          200: {
            description: 'Successful response',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string', example: 'Success' },
                  },
                },
              },
            },
          },
        },
      },
    ];

    const swaggerSpec = this.apiDataService.getSelectedSwaggerSpecValue();
    if (swaggerSpec?.paths) {
      if (swaggerSpec.paths[newPathKey]) {
        this.translate
          .get('TOAST.PATH_EXISTS')
          .subscribe((translatedMessage) => {
            this.messageService.add({
              severity: 'warn',
              summary: this.translate.instant('TOAST.WARNING'),
              detail: `${translatedMessage}: ${newPathKey}`,
              life: 4000,
            });
          });
      } else {
        swaggerSpec.paths[newPathKey] = {
          get: {
            summary: `Default GET operation for ${newPathKey}`,
            description: `Auto-generated GET operation for ${newPathKey}.`,
            responses: {},
          },
        };

        this.apiDataService.updateSwaggerSpec(swaggerSpec);
        this.apiDataService.saveSwaggerSpecToStorage(swaggerSpec);
        this.newPathName = '';
        this.visibleAddPath = false;
        this.paths = { ...this.paths };
      }

      this.messageService.add({
        severity: 'success',
        summary: this.translate.instant('TOAST.SUCCESS'),
        detail: this.translate.instant('TOAST.PATH_ADDED'),
        life: 3000,
      });
    } else {
      console.error('No schemas found in Swagger spec.');
    }
  }

  saveNewModel(): void {
    const newModelKey = this.newModelName.trim();

    if (!newModelKey) {
      this.translate.get('TOAST.MODEL_EMPTY').subscribe((translatedMessage) => {
        this.messageService.add({
          severity: 'warn',
          summary: this.translate.instant('TOAST.WARNING'),
          detail: translatedMessage,
          life: 4000,
        });
      });
      return;
    }

    const swaggerSpec = this.apiDataService.getSelectedSwaggerSpecValue();
    if (!swaggerSpec) {
      console.error('No Swagger spec found.');
      return;
    }

    if (!swaggerSpec.components) {
      swaggerSpec.components = { schemas: {} };
    }
    if (!swaggerSpec.components.schemas) {
      swaggerSpec.components.schemas = {};
    }

    if (swaggerSpec.components.schemas[newModelKey]) {
      this.translate
        .get('TOAST.MODEL_EXISTS')
        .subscribe((translatedMessage) => {
          this.messageService.add({
            severity: 'warn',
            summary: this.translate.instant('TOAST.WARNING'),
            detail: `${translatedMessage}: ${newModelKey}`,
            life: 4000,
          });
        });
      return;
    }

    swaggerSpec.components.schemas[newModelKey] = {
      title: newModelKey,
      type: 'object',
      properties: {
        exampleField: { type: 'string', example: 'Example value' },
      },
      description: `Auto-generated model`,
    };

    this.apiDataService.updateSwaggerSpec(swaggerSpec);
    this.apiDataService.saveSwaggerSpecToStorage(swaggerSpec);

    this.newModelName = '';
    this.visibleAddModel = false;
    this.initializeComponentState();

    this.messageService.add({
      severity: 'success',
      summary: this.translate.instant('TOAST.SUCCESS'),
      detail: this.translate.instant('TOAST.MODEL_ADDED'),
      life: 3000,
    });
  }

  onModelRightClick(event: MouseEvent, model: any): void {
    event.preventDefault();

    if (this.currentMenu) {
      this.currentMenu.hide();
      this.currentMenu = null;
    }

    this.selectedModelName = model.name;
    this.currentMenu = this.contextMenu;
    this.selectedItem = model;
    this.contextMenu.model = [...this.modelContextMenuItems];
    this.contextMenu.show(event);
  }

  isTitleExisting(title: string): boolean {
    const allSpecs = this.apiDataService.getAllSwaggerSpecs();
    return Object.keys(allSpecs).some(
      (key) => key.toLowerCase() === title.toLowerCase()
    );
  }

  confirmCreateNewOpenApi(): void {
    if (!this.newOpenApiTitle.trim()) {
      console.warn('Title is required!');
      this.messageService.add({
        severity: 'warn',
        summary: 'Missing Title',
        detail: 'Please enter a title to create a new OpenAPI reference.',
        life: 3000,
      });
      return;
    }

    if (this.isTitleExisting(this.newOpenApiTitle.trim())) {
      console.warn('A reference with this title already exists!');
      this.messageService.add({
        severity: 'warn',
        summary: 'Duplicate Title',
        detail: 'An OpenAPI reference with this title already exists.',
        life: 3000,
      });
      return;
    }

    this.createNewOpenApi(this.selectedVersion);
    this.isAddNewRefDialogVisible = false;

    this.messageService.add({
      severity: 'success',
      summary: 'Created',
      detail: `New OpenAPI '${this.newOpenApiTitle}' has been created.`,
      life: 3000,
    });
  }

  onPathRightClick(event: MouseEvent, path: any): void {
    event.preventDefault();

    if (this.currentMenu) {
      this.currentMenu.hide();
      this.currentMenu = null;
    }
    this.currentMenu = this.pathMethodContextMenu;

    const existingMethods = path.value.map((methods: any) =>
      methods.method.toLowerCase()
    );

    const allMethods = [
      'get',
      'post',
      'put',
      'delete',
      'patch',
      'head',
      'options',
      'trace',
    ];

    const availableMethods = allMethods.filter(
      (method) => !existingMethods.includes(method)
    );

    this.translate
      .get([
        'SIDEBAR.PATHS.RIGHTMENU.NEW_OPERATION',
        'SIDEBAR.PATHS.RIGHTMENU.COPY_PATH',
        'SIDEBAR.PATHS.RIGHTMENU.RENAME_PATH',
        'SIDEBAR.PATHS.RIGHTMENU.DELETE_PATH',
      ])
      .subscribe((translations) => {
        this.pathMethodContextMenu.model = [
          {
            label: translations['SIDEBAR.PATHS.RIGHTMENU.NEW_OPERATION'],
            items: availableMethods.map((method: string) => ({
              label: method.toUpperCase(),
              command: () => this.addOperation(method, path.key),
            })),
          },
          { separator: true },
          {
            label: translations['SIDEBAR.PATHS.RIGHTMENU.RENAME_PATH'],
            command: () => {
              this.editingPath = path.key;
              setTimeout(() => this.openRenamePathDialog(path.key));
            },
          },
          {
            label: translations['SIDEBAR.PATHS.RIGHTMENU.DELETE_PATH'],
            command: () => {
              this.deletePath(path);
            },
          },
        ];
      });

    this.pathMethodContextMenu.show(event);
  }

  openRenamePathDialog(pathName: string): void {
    this.selectedPathName = pathName;
    this.newPathNameInput = pathName;
    this.renamePathDialogVisible = true;
  }

  renamedPath(): void {
    if (!this.selectedPathName || !this.newPathNameInput.trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: this.translate.instant('SIDEBAR.PATHS.TOAST.MISSING'),
      });
      return;
    }

    const swaggerSpec = this.apiDataService.getSelectedSwaggerSpecValue();

    if (!swaggerSpec.paths?.[this.selectedPathName]) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: this.translate.instant('SIDEBAR.PATHS.TOAST.NOT_FOUND'),
      });
      return;
    }

    if (swaggerSpec.paths?.[this.newPathNameInput]) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: this.translate.instant('SIDEBAR.PATHS.TOAST.EXISTS'),
      });
      return;
    }

    swaggerSpec.paths[this.newPathNameInput] =
      swaggerSpec.paths[this.selectedPathName];
    delete swaggerSpec.paths[this.selectedPathName];

    this.apiDataService.updateSwaggerSpec(swaggerSpec);
    this.apiDataService.saveSwaggerSpecToStorage(swaggerSpec);

    this.initializeComponentState();

    this.renamePathDialogVisible = false;

    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: this.translate.instant('SIDEBAR.PATHS.TOAST.SUCCESS'),
    });
  }

  addOperation(method: string, pathKey: string): void {
    const swaggerSpec = this.apiDataService.getSelectedSwaggerSpecValue();

    if (swaggerSpec.paths[pathKey][method]) {
      this.translate
        .get('TOAST.METHOD_ALREADY_EXISTS', { method, pathKey })
        .subscribe((message) => {
          this.messageService.add({
            severity: 'warn',
            summary: this.translate.instant('TOAST.WARNING'),
            detail: message,
            life: 4000,
          });
        });
      return;
    }

    swaggerSpec.paths[pathKey][method] = {
      summary: `Default ${method.toUpperCase()} operation for ${pathKey}`,
      description: `This is an auto-generated ${method.toUpperCase()} operation.`,
      responses: {
        200: {
          description: 'Successful response',
        },
      },
    };

    this.apiDataService.updateSwaggerSpec(swaggerSpec);
    this.apiDataService.saveSwaggerSpecToStorage(swaggerSpec);

    this.initializeComponentState();

    this.renameModelDialogVisible = false;

    this.messageService.add({
      severity: 'success',
      summary: this.translate.instant('TOAST.SUCCESS'),
      detail: this.translate.instant('TOAST.METHOD_ADDED'),
      life: 3000,
    });
  }

  openRenameModelDialog(modelName: string): void {
    this.selectedModelName = modelName;
    this.newModelNameInput = modelName;
    this.renameModelDialogVisible = true;
  }

  createNewOpenApi(version: 'v3.1' | 'v3.0' | 'v2.0'): void {
    try {
      let newSpec: any;

      if (version === 'v3.1') {
        newSpec = {
          openapi: '3.1.0',
          info: {
            title: this.newOpenApiTitle,
            version: '1.0',
          },
          servers: [
            {
              url: 'http://localhost:3000',
            },
          ],
          paths: {
            '/users/{userId}': {
              parameters: [
                {
                  schema: {
                    type: 'integer',
                  },
                  name: 'userId',
                  in: 'path',
                  required: true,
                  description: 'Id of an existing user.',
                },
              ],
              get: {
                summary: 'Get User Info by User ID',
                operationId: 'get-users-userId',
                responses: {
                  '200': {
                    description: 'User Found',
                  },
                },
              },
            },
          },
          components: {
            schemas: {
              User: {
                type: 'object',
                properties: {
                  id: { type: 'integer' },
                  firstName: { type: 'string' },
                  lastName: { type: 'string' },
                  email: { type: 'string', format: 'email' },
                },
                required: ['id', 'firstName', 'lastName', 'email'],
              },
            },
          },
        };
      } else if (version === 'v3.0') {
        newSpec = {
          openapi: '3.0.0',
          info: {
            title: this.newOpenApiTitle,
            version: '1.0',
          },
          servers: [
            {
              url: 'http://localhost:3000',
            },
          ],
          paths: {
            '/users/{userId}': {
              parameters: [
                {
                  schema: {
                    type: 'integer',
                  },
                  name: 'userId',
                  in: 'path',
                  required: true,
                  description: 'Id of an existing user.',
                },
              ],
              get: {
                summary: 'Get User Info by User ID',
                operationId: 'get-users-userId',
                responses: {
                  '200': {
                    description: 'User Found',
                  },
                },
              },
            },
          },
          components: {
            schemas: {
              User: {
                type: 'object',
                properties: {
                  id: { type: 'integer' },
                  firstName: { type: 'string' },
                  lastName: { type: 'string' },
                  email: { type: 'string', format: 'email' },
                },
                required: ['id', 'firstName', 'lastName', 'email'],
              },
            },
          },
        };
      }

      this.apiDataService.storeSwaggerSpec(this.newOpenApiTitle, newSpec);

      this.apiDataService.saveSwaggerToDatabase(this.newOpenApiTitle, newSpec);

      this.initializeComponentState();
    } catch (error) {
      console.error('Error creating new OpenAPI/Swagger document:', error);
    }
  }

  onReferenceRightClick(event: MouseEvent, key: string): void {
    event.preventDefault();

    if (this.currentMenu) {
      this.currentMenu.hide();
      this.currentMenu = null;
    }

    this.currentMenu = this.contextMenu;
    this.selectedItem = key;

    this.translate
      .get([
        'SIDEBAR.REFERENCES.RIGHTMENU.EXPORT',
        'SIDEBAR.REFERENCES.RIGHTMENU.COPY_PATH',
        'SIDEBAR.REFERENCES.RIGHTMENU.COPY_RELATIVE_PATH',
        'SIDEBAR.REFERENCES.RIGHTMENU.RENAME',
        'SIDEBAR.REFERENCES.RIGHTMENU.DELETE',
        'SIDEBAR.REFERENCES.RIGHTMENU.DUPLICATE',
      ])
      .subscribe((translations) => {
        this.referenceContextMenuItems = [
          {
            label: translations['SIDEBAR.REFERENCES.RIGHTMENU.EXPORT'],
            icon: 'pi pi-download',
            command: () => this.exportReference(),
          },
          {
            label: translations['SIDEBAR.REFERENCES.RIGHTMENU.RENAME'],
            icon: 'pi pi-pencil',
            command: () => {
              this.newReferenceNameInput = this.selectedItem;
              this.renameReferenceDialogVisible = true;
            },
          },

          {
            label: translations['SIDEBAR.REFERENCES.RIGHTMENU.DELETE'],
            icon: 'pi pi-trash',
            command: () => this.deleteReference(key),
          },
        ];

        this.contextMenu.model = [...this.referenceContextMenuItems];
        this.contextMenu.show(event);
      });
  }

  renameReference(oldKey: string, newKey: string): void {
    try {
      const allSpecs = this.apiDataService.getAllSwaggerSpecs();

      if (!oldKey || !newKey || !newKey.trim()) {
        this.translate.get('TOAST.RENAME.INVALID_KEYS').subscribe((message) => {
          this.messageService.add({
            severity: 'warn',
            summary: 'Warning',
            detail: message,
          });
        });
        return;
      }

      if (!allSpecs[oldKey]) {
        this.translate
          .get('TOAST.RENAME.OLD_KEY_NOT_FOUND', { key: oldKey })
          .subscribe((message) => {
            this.messageService.add({
              severity: 'warn',
              summary: 'Warning',
              detail: message,
            });
          });
        return;
      }

      if (allSpecs[newKey]) {
        this.translate
          .get('TOAST.RENAME.NEW_KEY_EXISTS', { key: newKey })
          .subscribe((message) => {
            this.messageService.add({
              severity: 'warn',
              summary: 'Warning',
              detail: message,
            });
          });
        return;
      }

      const specContent = allSpecs[oldKey];

      this.apiDataService.storeSwaggerSpec(newKey, specContent);

      this.apiDataService.deleteSwaggerSpecFromStorage(oldKey);

      const id = this.apiDataService.getSwaggerSpecIdByKeyFromApi(oldKey);

      if (id) {
        this.apiDataService.renameSwaggerSpecInDatabase(id, newKey);
      }

      if (this.apiDataService.getSelectedSwaggerKey() === oldKey) {
        this.apiDataService.setSelectedSwaggerSpec(newKey);
      }

      this.initializeComponentState();

      this.translate
        .get('TOAST.RENAME.SUCCESS', { oldKey, newKey })
        .subscribe((message) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: message,
          });
        });
    } catch (error) {
      console.error(
        `Error renaming Swagger spec from "${oldKey}" to "${newKey}":`,
        error
      );
    }
  }

  confirmRenameReference(): void {
    const trimmedNewName = this.newReferenceNameInput.trim();

    if (trimmedNewName && trimmedNewName !== this.selectedItem) {
      this.renameReference(this.selectedItem, trimmedNewName);
      this.renameReferenceDialogVisible = false;
    }
  }

  deletePath(selectedPath: any): void {
    this.confirmationService.confirm({
      message: this.translate.instant('SIDEBAR.PATHS.CONFIRM_DELETE.MESSAGE', {
        path: selectedPath.key,
      }),
      header: this.translate.instant('SIDEBAR.PATHS.CONFIRM_DELETE.HEADER'),
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: this.translate.instant(
        'SIDEBAR.PATHS.CONFIRM_DELETE.ACCEPT'
      ),
      rejectLabel: this.translate.instant(
        'SIDEBAR.PATHS.CONFIRM_DELETE.REJECT'
      ),
      accept: () => {
        const swaggerSpec = this.apiDataService.getSelectedSwaggerSpecValue();

        if (swaggerSpec.paths?.[selectedPath.key]) {
          delete swaggerSpec.paths[selectedPath.key];
        }

        this.apiDataService.updateSwaggerSpec(swaggerSpec);
        this.apiDataService.saveSwaggerSpecToStorage(swaggerSpec);
        this.initializeComponentState();

        this.messageService.add({
          severity: 'success',
          summary: this.translate.instant(
            'SIDEBAR.PATHS.CONFIRM_DELETE.SUCCESS_SUMMARY'
          ),
          detail: this.translate.instant(
            'SIDEBAR.PATHS.CONFIRM_DELETE.SUCCESS_DETAIL'
          ),
        });
        this.router.navigate(['/reference', this.selectedSwaggerKey]);
      },
    });
  }

  onPathEndpointRightClick(event: MouseEvent, path: any, method: any): void {
    event.preventDefault();

    if (this.currentMenu) {
      this.currentMenu.hide();
      this.currentMenu = null;
    }

    this.currentMenu = this.contextMenu;

    this.selectedItem = path;
    this.contextMenuItems = [
      {
        label: 'Rename Endpoint',
        icon: 'pi pi-pencil',
        command: () => this.openRenameEndpointDialog(path, method),
      },
      {
        label: 'Delete Endpoint',
        icon: 'pi pi-trash',
        command: () => this.deleteEndpoint(path, method),
      },
    ];
    this.contextMenu.show(event);
  }
  openRenameEndpointDialog(path: any, method: any): void {
    this.selectedPath = path;
    this.selectedMethod = method;
    this.newMethodKey = '';
    this.renameEndpointDialogVisible = true;
  }

  saveRenamedEndpoint(): void {
    if (!this.newMethodKey.trim()) {
      console.warn('New method name cannot be empty.');
      return;
    }

    this.renameEndpoint(
      this.selectedPath,
      this.selectedMethod,
      this.newMethodKey
    );
    this.renameEndpointDialogVisible = false;
    this.selectedPath = null;
    this.selectedMethod = null;
  }

  renameEndpoint(pathKey: any, methodKey: any, newSummary: string): void {
    if (!pathKey || !methodKey || !newSummary.trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: this.translate.instant(
          'SIDEBAR.PATHS.TOAST_RENAME_ENDPOINT.INVALID_INPUT'
        ),
      });
      return;
    }

    this.apiDataService.getSwaggerSpec().subscribe((swaggerSpec: any) => {
      if (swaggerSpec && swaggerSpec.paths) {
        const path = swaggerSpec.paths[pathKey.key];

        if (!path || !path[methodKey.method]) {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: this.translate.instant(
              'SIDEBAR.PATHS.TOAST_RENAME_ENDPOINT.METHOD_NOT_FOUND'
            ),
          });
          return;
        }

        path[methodKey.method].summary = newSummary;

        const endpointIndex = this.paths[pathKey.key]?.findIndex(
          (endpoint: any) => endpoint.method === methodKey.method
        );
        if (endpointIndex !== -1) {
          this.paths[pathKey.key][endpointIndex].summary = newSummary;
        }

        this.apiDataService.saveSwaggerSpecToStorage(swaggerSpec);

        this.paths = { ...this.paths };

        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: this.translate.instant(
            'SIDEBAR.PATHS.TOAST_RENAME_ENDPOINT.SUCCESS'
          ),
        });
      } else {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: this.translate.instant(
            'SIDEBAR.PATHS.TOAST_RENAME_ENDPOINT.SWAGGER_FETCH_FAILED'
          ),
        });
      }
    });
  }

  renamedModel(): void {
    if (!this.selectedModelName || !this.newModelNameInput.trim()) {
      console.warn(
        'Model name missing or new input is empty. Aborting rename.'
      );
      return;
    }
    //TODO: Add toasts
    const swaggerSpec = this.apiDataService.getSelectedSwaggerSpecValue();
    const version = swaggerSpec?.openapi ?? swaggerSpec?.swagger;

    if (version.startsWith('2.0')) {
      if (swaggerSpec.definitions?.[this.selectedModelName]) {
        swaggerSpec.definitions[this.newModelNameInput] =
          swaggerSpec.definitions[this.selectedModelName];
        delete swaggerSpec.definitions[this.selectedModelName];
      } else {
        console.error('Model not found in definitions.');
      }
    } else {
      if (swaggerSpec.components?.schemas?.[this.selectedModelName]) {
        swaggerSpec.components.schemas[this.newModelNameInput] =
          swaggerSpec.components.schemas[this.selectedModelName];
        delete swaggerSpec.components.schemas[this.selectedModelName];
      } else {
        console.error('Model not found in components.schemas.');
      }
    }

    this.apiDataService.updateSwaggerSpec(swaggerSpec);
    this.apiDataService.saveSwaggerSpecToStorage(swaggerSpec);

    this.initializeComponentState();

    this.renameModelDialogVisible = false;
  }

  deleteModel(event?: Event): void {
    if (!this.selectedModelName) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: this.translate.instant(
          'SIDEBAR.MODELS.CONFIRM_DELETE.NO_MODEL_SELECTED'
        ),
      });
      return;
    }

    this.confirmationService.confirm({
      target: event?.target || undefined,
      message: this.translate.instant('SIDEBAR.MODELS.CONFIRM_DELETE.MESSAGE', {
        model: this.selectedModelName,
      }),
      header: this.translate.instant('SIDEBAR.MODELS.CONFIRM_DELETE.HEADER'),
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      acceptLabel: this.translate.instant(
        'SIDEBAR.MODELS.CONFIRM_DELETE.ACCEPT'
      ),
      rejectLabel: this.translate.instant(
        'SIDEBAR.MODELS.CONFIRM_DELETE.REJECT'
      ),
      accept: () => {
        const swaggerSpec = this.apiDataService.getSelectedSwaggerSpecValue();
        const version = swaggerSpec?.openapi ?? swaggerSpec?.swagger;

        if (version.startsWith('2.0')) {
          if (swaggerSpec.definitions?.[this.selectedModelName]) {
            delete swaggerSpec.definitions[this.selectedModelName];
          }
        } else {
          if (swaggerSpec.components?.schemas?.[this.selectedModelName]) {
            delete swaggerSpec.components.schemas[this.selectedModelName];
          }
        }

        this.apiDataService.updateSwaggerSpec(swaggerSpec);
        this.apiDataService.saveSwaggerSpecToStorage(swaggerSpec);
        this.initializeComponentState();

        this.messageService.add({
          severity: 'success',
          summary: this.translate.instant(
            'SIDEBAR.MODELS.CONFIRM_DELETE.SUCCESS_SUMMARY'
          ),
          detail: this.translate.instant(
            'SIDEBAR.MODELS.CONFIRM_DELETE.SUCCESS_DETAIL'
          ),
        });
      },
    });
  }

  deleteEndpoint(pathKey: any, methodKey: any): void {
    this.confirmationService.confirm({
      message: this.translate.instant(
        'SIDEBAR.PATHS.CONFIRM_DELETE_ENDPOINT.MESSAGE',
        {
          method: methodKey.method.toUpperCase(),
          path: pathKey.key,
        }
      ),
      header: this.translate.instant(
        'SIDEBAR.PATHS.CONFIRM_DELETE_ENDPOINT.HEADER'
      ),
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: this.translate.instant(
        'SIDEBAR.PATHS.CONFIRM_DELETE_ENDPOINT.ACCEPT'
      ),
      rejectLabel: this.translate.instant(
        'SIDEBAR.PATHS.CONFIRM_DELETE_ENDPOINT.REJECT'
      ),
      accept: () => {
        const swaggerSpec = this.apiDataService.getSelectedSwaggerSpecValue();

        if (swaggerSpec.paths[pathKey.key][methodKey.method]) {
          delete swaggerSpec.paths[pathKey.key][methodKey.method];
        }

        this.apiDataService.updateSwaggerSpec(swaggerSpec);
        this.apiDataService.saveSwaggerSpecToStorage(swaggerSpec);
        this.initializeComponentState();

        this.messageService.add({
          severity: 'success',
          summary: this.translate.instant(
            'SIDEBAR.PATHS.CONFIRM_DELETE_ENDPOINT.SUCCESS_SUMMARY'
          ),
          detail: this.translate.instant(
            'SIDEBAR.PATHS.CONFIRM_DELETE_ENDPOINT.SUCCESS_DETAIL'
          ),
        });
      },
    });
  }

  toggleDarkMode(): void {
    this.isDarkMode = !this.isDarkMode;

    const root = document.documentElement;
    if (this.isDarkMode) {
      root.classList.add('my-app-dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('my-app-dark');
      localStorage.setItem('theme', 'light');
    }
  }
}
