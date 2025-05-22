import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { FloatLabelModule } from 'primeng/floatlabel';
import { TextareaModule } from 'primeng/textarea';
import { ButtonModule } from 'primeng/button';
import { TranslateModule } from '@ngx-translate/core';
import { DividerModule } from 'primeng/divider';
import { SelectModule } from 'primeng/select';
import { SchemaExtensionsComponent } from '../schemas/schema-extensions/schema-extensions.component';
import { ApiDataService } from '../../services/api-data.service';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { PopoverModule } from 'primeng/popover';
import { ChipModule } from 'primeng/chip';
import { MultiSelectModule } from 'primeng/multiselect';

@Component({
  selector: 'app-reference',
  imports: [
    CommonModule,
    InputTextModule,
    FormsModule,
    ToggleSwitchModule,
    FloatLabelModule,
    TextareaModule,
    ButtonModule,
    TranslateModule,
    DividerModule,
    SelectModule,
    SchemaExtensionsComponent,
    RouterModule,
    PopoverModule,
    ChipModule,
    MultiSelectModule,
  ],
  templateUrl: './reference.component.html',
  styleUrls: ['./reference.component.css'],
})
export class ReferenceComponent {
  version = '';
  title = '';
  checkedInternal = false;
  summary = '';
  description = '';
  contactName = '';
  contactUrl = '';
  contactEmail = '';
  termsOfService = '';
  licenseName = '';
  licenseOptions: { name: string }[] | undefined;
  selectedLicense: { name: string } | undefined;
  nameOfId: string = 'myappika';
  licenseUrl = '';
  selectedExtensions: any;
  servers: any[] = [];
  newEnumValue: string = '';
  newEnumValues: { [serverId: string]: { [varKey: string]: string } } = {};
  showVariablesMap: Map<number, boolean> = new Map();
  editableVariableKeys: {
    [serverIndex: number]: { [oldKey: string]: string };
  } = {};
  securitySchemes: Record<string, any> = {};
  types = [
    { label: 'API Key', value: 'apiKey' },
    { label: 'HTTP', value: 'http' },
    { label: 'OAuth2', value: 'oauth2' },
    { label: 'OpenID Connect', value: 'openIdConnect' },
  ];

  ins = [
    { label: 'Query', value: 'query' },
    { label: 'Header', value: 'header' },
    { label: 'Cookie', value: 'cookie' },
  ];

  https = [
    { label: 'basic', value: 'basic' },
    { label: 'bearer', value: 'bearer' },
    { label: 'digest', value: 'digest' },
    { label: 'hoba', value: 'hoba' },
    { label: 'mutual', value: 'mutual' },
    { label: 'negotiate', value: 'negotiate' },
    { label: 'oauth', value: 'oauth' },
    { label: 'scram-sha-1', value: 'scram-sha-1' },
    { label: 'scram-sha-256', value: 'scram-sha-256' },
    { label: 'vapid', value: 'vapid' },
  ];
  oauthFlowOptions = [
    { label: 'implicit', value: 'implicit' },
    { label: 'password', value: 'password' },
    { label: 'clientCredentials', value: 'clientCredentials' },
    { label: 'authorizationCode', value: 'authorizationCode' },
  ];
  selectedFlowsMap: { [key: string]: string[] } = {};
  editableScopes: {
    [key: string]: { [flow: string]: { [oldKey: string]: string } };
  } = {};
  selectedFlows: string[] = [];

  private apiDataService = inject(ApiDataService);
  private route = inject(ActivatedRoute);

  ngOnInit(): void {
    this.licenseOptions = [{ name: 'URL' }, { name: 'Identifier' }];

    this.route.paramMap.subscribe((params) => {
      const key = params.get('key');
      if (key) {
        this.apiDataService.setSelectedSwaggerSpec(key);
      }
      this.fetchReference();
    });
  }

  addServer(): void {
    const newServer = {
      url: '',
      description: '',
      variables: {},
    };

    this.servers.push(newServer);
    this.onReferenceChange(null);
  }

  addSecurityScheme(): void {
    if (!this.selectedExtensions.components) {
      this.selectedExtensions.components = {};
    }

    if (!this.selectedExtensions.components.securitySchemes) {
      this.selectedExtensions.components.securitySchemes = {};
    }

    const securitySchemes = this.selectedExtensions.components.securitySchemes;
    const baseKey = 'securityScheme';
    let index = 1;

    let newKey = `${baseKey}${index}`;
    while (securitySchemes[newKey]) {
      index++;
      newKey = `${baseKey}${index}`;
    }

    securitySchemes[newKey] = {
      type: 'oauth2',
      flows: {
        clientCredentials: {
          authorizationUrl: '',
          tokenUrl: '',
          scopes: {},
        },
      },
    };

    this.securitySchemes = securitySchemes;
    this.selectedFlowsMap[newKey] = ['clientCredentials'];
    this.initializeEditableScopes();
    this.onReferenceChange(null);
  }

  addExtension(): void {
    throw new Error('Method not implemented.');
  }

  toggleServerVariables(index: number): void {
    const current = this.showVariablesMap.get(index) || false;
    this.showVariablesMap.set(index, !current);
  }

  updateSwaggerSpec(): void {
    let swaggerSpec = this.apiDataService.getSelectedSwaggerSpecValue();


    swaggerSpec = this.selectedExtensions;

    this.apiDataService.updateSwaggerSpec(swaggerSpec);
    this.apiDataService.saveSwaggerSpecToStorage(swaggerSpec);

    this.fetchReference();
  }

  fetchReference(): void {
    const swaggerSpec = this.apiDataService.getSelectedSwaggerSpecValue();

    this.selectedExtensions = swaggerSpec;

    this.version = this.selectedExtensions.info?.version;
    this.title = this.selectedExtensions.info?.title || '';
    this.checkedInternal = this.selectedExtensions['x-internal'] || false;
    this.summary = this.selectedExtensions.info?.summary || '';
    this.description = this.selectedExtensions.info?.description || '';
    this.contactName = this.selectedExtensions.info?.contact?.name || '';
    this.contactUrl = this.selectedExtensions.info?.contact?.url || '';
    this.contactEmail = this.selectedExtensions.info?.contact?.email || '';
    this.termsOfService = this.selectedExtensions.info?.termsOfService || '';
    this.licenseName = this.selectedExtensions.info?.license?.name || '';
    this.licenseUrl = this.selectedExtensions.info?.license?.url || '';
    this.servers = this.selectedExtensions.servers || [];

    this.servers.forEach((server, index) => {
      this.editableVariableKeys[index] = {};
      Object.keys(server.variables || {}).forEach((key) => {
        this.editableVariableKeys[index][key] = key;
      });
    });

    this.securitySchemes = this.selectedExtensions.components.securitySchemes =
      this.selectedExtensions.components.securitySchemes || {};

    Object.keys(this.securitySchemes).forEach((key) => {
      const flows = this.securitySchemes[key]?.flows || {};
      this.selectedFlowsMap[key] = Object.keys(flows);
    });

    this.initializeEditableScopes();
    this.updateEditableScopes();
  }

  getFlowObject(key: string, flow: string): any {
    return this.securitySchemes[key]?.flows?.[flow] ?? {};
  }

  getScopeKeys(key: string, flow: string): string[] {
    const scopes = this.securitySchemes[key]?.flows?.[flow]?.scopes || {};
    return Object.keys(scopes);
  }

  addScopeToFlow(key: string, flow: string): void {
    const scopes = this.securitySchemes[key]?.flows?.[flow]?.scopes;
    if (scopes) {
      scopes[`scope_${Object.keys(scopes).length + 1}`] = '';
    } else {
      this.securitySchemes[key].flows[flow].scopes = {
        scope_1: '',
      };
    }
  }

  isEmptySecurity(entry: any): boolean {
    return Object.keys(entry || {}).length === 0;
  }

  getSecurityKeys(entry: any): string[] {
    return Object.keys(entry || {});
  }

  addGlobalSecurity(): void {
    if (!this.selectedExtensions.components) {
      this.selectedExtensions.components = {};
    }

    if (!this.selectedExtensions.components.securitySchemes) {
      this.selectedExtensions.components.securitySchemes = {};
    }

    const securitySchemes = this.selectedExtensions.components.securitySchemes;
    if (Object.keys(securitySchemes).length === 0) {
      securitySchemes['defaultScheme'] = {
        type: 'oauth2',
        flows: {
          clientCredentials: {
            authorizationUrl: '',
            tokenUrl: '',
            scopes: {
              scope_1: 'Default scope 1',
              scope_2: 'Default scope 2',
            },
          },
        },
      };
      this.securitySchemes = securitySchemes;
    }

    if (!this.selectedExtensions.security) {
      this.selectedExtensions.security = [];
    }

    const usedKeys = new Set(
      this.selectedExtensions.security.flatMap((s: any) => Object.keys(s))
    );

    const allKeys = Object.keys(securitySchemes || {});
    const availableKey = allKeys.find((key) => !usedKeys.has(key));
    if (!availableKey) return;

    const scheme = securitySchemes[availableKey];

    if (
      scheme?.type === 'oauth2' &&
      (!scheme.flows || Object.keys(scheme.flows).length === 0)
    ) {
      scheme.flows = {
        clientCredentials: {
          authorizationUrl: '',
          tokenUrl: '',
          scopes: {
            scope_1: 'Default scope 1',
            scope_2: 'Default scope 2',
          },
        },
      };
    }

    const newSecurityEntry = { [availableKey]: [] };
    this.selectedExtensions.security.push(newSecurityEntry);

    this.onReferenceChange(null);
  }

  removeGlobalSecurity(index: number): void {
    this.selectedExtensions.security.splice(index, 1);
    this.onReferenceChange(null);
  }

  addGlobalScope(index: number): void {
    const security = this.selectedExtensions.security[index];

    const schemeKey = this.getSecuritySchemeKeys()[0];
    if (!schemeKey) return;

    if (!security[schemeKey]) {
      security[schemeKey] = [];
    }

    const newScope = `scope_${security[schemeKey].length + 1}`;
    if (!security[schemeKey].includes(newScope)) {
      security[schemeKey].push(newScope);
      this.onReferenceChange(null);
    }
  }

  toggleEmptySecurity(): void {}

  get hasEmptySecurity(): boolean {
    return (
      Array.isArray(this.selectedExtensions?.security) &&
      this.selectedExtensions.security.length > 0 &&
      Object.keys(this.selectedExtensions.security[0] ?? {}).length === 0
    );
  }

  set hasEmptySecurity(value: boolean) {
    if (!Array.isArray(this.selectedExtensions.security)) {
      this.selectedExtensions.security = [];
    }

    if (value) {
      // Put {} at first position if not already there
      if (
        this.selectedExtensions.security.length === 0 ||
        Object.keys(this.selectedExtensions.security[0]).length !== 0
      ) {
        this.selectedExtensions.security.unshift({});
      }
    } else {
      // Remove the empty {} if it's the first element
      if (
        this.selectedExtensions.security.length > 0 &&
        Object.keys(this.selectedExtensions.security[0]).length === 0
      ) {
        this.selectedExtensions.security.shift();
      }
    }

    this.onReferenceChange(null);
  }

  AddSecuruty(index: number): void {
    const availableKeys = Object.keys(this.securitySchemes || {});
    if (availableKeys.length === 0) return;

    const newKey = availableKeys[0];

    const newSecurityEntry = { [newKey]: [] }; // Empty scopes
    this.selectedExtensions.security.splice(index + 1, 0, newSecurityEntry);
    this.onReferenceChange(null);
  }

  deleteSecurity(security: any, key: string): void {
    delete security[key];

    if (Object.keys(security).length === 0) {
      const index = this.selectedExtensions.security.indexOf(security);

      if (
        index > -1 &&
        !(
          index === 0 &&
          this.hasEmptySecurity &&
          Object.keys(this.selectedExtensions.security[0]).length === 0
        )
      ) {
        this.selectedExtensions.security.splice(index, 1);
      }
    }

    this.onReferenceChange(null);
  }

  AddSecurity(i: number): void {
    const security = this.selectedExtensions.security[i];
    const unused = this.getUnusedSecuritySchemes(security, '');
    if (unused.length === 0) return;

    const newKey = unused[0].value;
    security[newKey] = []; // empty scopes by default
    this.onReferenceChange(null);
  }

  getUnusedSecuritySchemes(
    security: any,
    currentKey: string
  ): { label: string; value: string }[] {
    const allKeys = Object.keys(this.securitySchemes || {});
    const usedKeys = new Set(Object.keys(security || {}));
    usedKeys.delete(currentKey); // allow current key to still show
    return allKeys
      .filter((k) => !usedKeys.has(k))
      .map((k) => ({ label: k, value: k }));
  }

  renameSecurityKey(security: any, oldKey: string, newKey: string): void {
    if (!newKey || oldKey === newKey || security[newKey]) return;

    security[newKey] = security[oldKey];
    delete security[oldKey];

    this.onReferenceChange(null);
  }

  getAvailableSchemeOptions(security: any): { label: string; value: string }[] {
    const used = new Set(Object.keys(security));
    return Object.keys(this.securitySchemes || {})
      .filter((key) => !used.has(key))
      .map((key) => ({ label: key, value: key }));
  }

  getOauthScopes(key: string): { label: string; value: string }[] {
    const flows = this.securitySchemes[key]?.flows ?? {};
    const scopesSet = new Set<string>();

    for (const flow of Object.values(flows)) {
      const scopes =
        (flow as { scopes?: Record<string, string> })?.scopes ?? {};
      Object.keys(scopes).forEach((scope) => scopesSet.add(scope));
    }

    return Array.from(scopesSet).map((scope) => ({
      label: scope,
      value: scope,
    }));
  }

  removeGlobalScope(index: number, scheme: string, scope: string): void {
    const security = this.selectedExtensions.security[index];
    const scopes = security[scheme];
    if (Array.isArray(scopes)) {
      const idx = scopes.indexOf(scope);
      if (idx > -1) {
        scopes.splice(idx, 1);
        this.onReferenceChange(null);
      }
    }
  }

  removeScope(key: string, flow: string, scopeKey: string): void {
    delete this.securitySchemes[key].flows[flow].scopes[scopeKey];
  }

  renameScopeKey(
    secKey: string,
    flow: string,
    oldKey: string,
    newKey?: string
  ): void {
    if (!newKey || oldKey === newKey) {
      return;
    }

    const scopes = this.securitySchemes[secKey]?.flows?.[flow]?.scopes;
    console.log('Before rename - scopes:', JSON.stringify(scopes, null, 2));
    console.log(scopes);

    if (!scopes || !(oldKey in scopes)) {
      return;
    }

    if (newKey in scopes) {
      return;
    }

    scopes[newKey] = scopes[oldKey];
    delete scopes[oldKey];

    if (!this.editableScopes[secKey]) this.editableScopes[secKey] = {};
    if (!this.editableScopes[secKey][flow])
      this.editableScopes[secKey][flow] = {};

    const editable = this.editableScopes[secKey][flow];
    editable[newKey] = newKey;
    delete editable[oldKey];

    this.selectedExtensions.components.securitySchemes = this.securitySchemes;

    this.onReferenceChange(null);
  }

  updateEditableScopes(): void {
    for (const schemeKey of Object.keys(this.securitySchemes)) {
      const flows = this.securitySchemes[schemeKey]?.flows ?? {};
      if (!this.editableScopes[schemeKey]) {
        this.editableScopes[schemeKey] = {};
      }

      for (const flowKey of Object.keys(flows)) {
        const scopes = flows[flowKey]?.scopes ?? {};
        if (!this.editableScopes[schemeKey][flowKey]) {
          this.editableScopes[schemeKey][flowKey] = {};
        }

        for (const scopeKey of Object.keys(scopes)) {
          if (!this.editableScopes[schemeKey][flowKey][scopeKey]) {
            this.editableScopes[schemeKey][flowKey][scopeKey] = scopeKey;
          }
        }
      }
    }
  }

  initializeEditableScopes(): void {
    this.editableScopes = {};

    for (const key of Object.keys(this.securitySchemes)) {
      const scheme = this.securitySchemes[key];
      if (!scheme.flows) continue;

      this.editableScopes[key] = {};

      for (const flow of Object.keys(scheme.flows)) {
        const scopes = scheme.flows[flow].scopes || {};
        this.editableScopes[key][flow] = {};

        for (const scopeKey of Object.keys(scopes)) {
          this.editableScopes[key][flow][scopeKey] = scopeKey;
        }
      }
    }
  }

  renameSecuritySchemeKeyFromEvent(event: Event, oldKey: string): void {
    const input = event.target as HTMLInputElement;
    const newKey = input.value.trim();

    if (!newKey || newKey === oldKey) return;

    const securitySchemes =
      this.selectedExtensions.components?.securitySchemes || {};
    const entries = Object.entries(securitySchemes);
    const newEntries: [string, any][] = [];

    for (const [key, value] of entries) {
      if (key === oldKey) {
        newEntries.push([newKey, value]);
      } else {
        newEntries.push([key, value]);
      }
    }

    this.selectedExtensions.components.securitySchemes =
      Object.fromEntries(newEntries);
    this.onReferenceChange(null);
  }

  setSecuritySchemeType(key: string, value: string): void {
    if (this.securitySchemes[key]) {
      this.securitySchemes[key].type = value;
      this.onReferenceChange(null);
    }
  }

  getSecuritySchemeType(key: string): string {
    return this.securitySchemes?.[key]?.type ?? '';
  }

  setSecuritySchemeIn(key: string, value: string): void {
    if (this.securitySchemes[key]) {
      this.securitySchemes[key].in = value;
      this.onReferenceChange(null);
    }
  }

  setSecuritySchemeHttps(key: string, value: string): void {
    if (this.securitySchemes[key]) {
      this.securitySchemes[key].scheme = value;
      this.onReferenceChange(null);
    }
  }

  deleteSecurityScheme(key: string): void {
    delete this.securitySchemes[key];
    this.onReferenceChange(null);
  }

  getSelectedFlows(key: string): string[] {
    const flows = this.securitySchemes?.[key]?.flows;
    return flows ? Object.keys(flows) : [];
  }

  setSecuritySchemeFlows(key: string, selectedFlows: string[]): void {
    const scheme = this.securitySchemes?.[key];
    if (!scheme) return;

    scheme.flows = {};
    selectedFlows.forEach((flow) => {
      scheme.flows[flow] = {
        authorizationUrl: '',
        tokenUrl: '',
        scopes: {},
      };
    });

    this.onReferenceChange(null);
  }

  onReferenceChange(_event: any): void {
    if (!this.selectedExtensions.info) {
      this.selectedExtensions.info = {};
    }

    this.selectedExtensions.info.version = this.version;
    this.selectedExtensions.info.title = this.title;
    this.selectedExtensions.info.summary = this.summary;
    this.selectedExtensions['x-internal'] = this.checkedInternal;
    this.selectedExtensions.info.description = this.description;

    if (!this.selectedExtensions.info.contact) {
      this.selectedExtensions.info.contact = {};
    }

    this.selectedExtensions.info.contact.name = this.contactName;
    this.selectedExtensions.info.contact.url = this.contactUrl;
    this.selectedExtensions.info.contact.email = this.contactEmail;

    this.selectedExtensions.info.termsOfService = this.termsOfService;

    if (!this.selectedExtensions.info.license) {
      this.selectedExtensions.info.license = {};
    }

    this.selectedExtensions.info.license.name = this.licenseName;
    this.selectedExtensions.info.license.url = this.licenseUrl;

    this.updateSwaggerSpec();
  }

  getVariableKeys(server: any): string[] {
    return server.variables ? Object.keys(server.variables) : [];
  }

  addVariable(server: any): void {
    if (!server.variables) {
      server.variables = {};
    }

    const newVarKey = this.getNextVariableKey(server);
    server.variables[newVarKey] = {
      description: '',
      default: '',
      enum: [],
    };

    this.servers.forEach((server, index) => {
      this.editableVariableKeys[index] = {};
      Object.keys(server.variables || {}).forEach((key) => {
        this.editableVariableKeys[index][key] = key;
      });
    });

    this.onReferenceChange(null);
  }

  deleteVariable(server: any, key: string): void {
    delete server.variables[key];
    this.onReferenceChange(null);
  }

  getNextVariableKey(server: any): string {
    let i = 1;
    while (server.variables[`var${i}`]) i++;
    return `var${i}`;
  }

  getEnumOptions(enumArr: string[]): { label: string; value: string }[] {
    return enumArr.map((e) => ({ label: this.formatLabel(e), value: e }));
  }

  formatLabel(value: string): string {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  getVariableDefault(server: any, key: string): string {
    return server.variables?.[key]?.default ?? '';
  }

  getSecuritySchemeKeys(): string[] {
    return Object.keys(this.securitySchemes || {});
  }

  setVariableDefault(server: any, key: string, value: string): void {
    if (server.variables?.[key]) {
      server.variables[key].default = value;
      this.onReferenceChange(null);
    }
  }

  addEnumValue(server: any, key: string): void {
    if (!server.variables[key].enum) {
      server.variables[key].enum = [];
    }
    server.variables[key].enum.push('');
  }

  getNewEnumValue(server: any, key: string): string {
    const serverId = server.url || server.description || 'server';
    return this.newEnumValues[serverId]?.[key] || '';
  }

  setEnumValue(server: any, key: string): void {
    const value = this.getNewEnumValue(server, key).trim();
    if (!value) return;

    if (!server.variables[key].enum) {
      server.variables[key].enum = [];
    }

    if (!server.variables[key].enum.includes(value)) {
      server.variables[key].enum.push(value);
      this.setNewEnumValue(server, key, ''); // clear input
      this.onReferenceChange(null);
    }
  }

  setNewEnumValue(server: any, key: string, value: string): void {
    const serverId = server.url || server.description || 'server';
    if (!this.newEnumValues[serverId]) {
      this.newEnumValues[serverId] = {};
    }
    this.newEnumValues[serverId][key] = value;
  }

  trackByIndex(index: number): number {
    return index;
  }

  renameVariableKey(
    server: any,
    oldKey: string,
    newKey: string,
    serverIndex: number
  ): void {
    if (!newKey || newKey === oldKey || server.variables[newKey]) return;

    server.variables[newKey] = { ...server.variables[oldKey] };
    delete server.variables[oldKey];

    const keys = this.editableVariableKeys[serverIndex];
    keys[newKey] = newKey;
    delete keys[oldKey];

    this.onReferenceChange(null);
  }
}
