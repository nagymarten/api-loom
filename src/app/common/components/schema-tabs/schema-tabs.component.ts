import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  SimpleChanges,
  inject,
} from '@angular/core';
import { MessageService, TreeNode } from 'primeng/api';
import { Button, ButtonModule } from 'primeng/button';
import { TreeTableModule } from 'primeng/treetable';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { FormsModule } from '@angular/forms';

import { SchemeTypeOverlayPanelComponent } from '../scheme-type-overlay-panel/scheme-type-overlay-panel.component';
import { RefButtonComponent } from '../ref-button/ref-button.component';
import { AddSchemeButtonComponent } from '../add-scheme-button/add-scheme-button.component';
import { OverlayTextareaComponent } from '../overlay-textarea/overlay-textarea.component';
import { MatGridListModule } from '@angular/material/grid-list';
import { Subscription } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Popover, PopoverModule } from 'primeng/popover';
import { InputTextModule } from 'primeng/inputtext';
import { Router, RouterModule } from '@angular/router';
import { TooltipModule } from 'primeng/tooltip';
import { ToggleSwitchModule } from 'primeng/toggleswitch';

@Component({
  selector: 'app-schema-tabs',
  imports: [
    CommonModule,
    TreeTableModule,
    ButtonModule,
    ToggleButtonModule,
    FormsModule,
    RefButtonComponent,
    AddSchemeButtonComponent,
    OverlayTextareaComponent,
    MatGridListModule,
    SchemeTypeOverlayPanelComponent,
    RefButtonComponent,
    AddSchemeButtonComponent,
    OverlayTextareaComponent,
    MatGridListModule,
    PopoverModule,
    Button,
    InputTextModule,
    RouterModule,
    TooltipModule,
    TranslateModule,
    ToggleSwitchModule,
  ],
  templateUrl: './schema-tabs.component.html',
  styleUrls: ['./schema-tabs.component.css'],
})
export class SchemaTabsComponent {
  @Input() selectedSchema: any;
  @Input() nameOfId: string = '';
  @Input() selectedSchemaName: any;
  @Input() apiDataService: any;

  @Output() activeTabChange = new EventEmitter<string>();
  @Output() schemaUpdated = new EventEmitter<any>();
  @Output() deleteRow = new EventEmitter<any>();
  @Output() addScheme = new EventEmitter<{ event: Event; rowData: any }>();
  @Output() deleteRowEvent = new EventEmitter<void>();

  @ViewChild(SchemeTypeOverlayPanelComponent)
  childComponent!: SchemeTypeOverlayPanelComponent;

  @ViewChild(OverlayTextareaComponent)
  childComponentOverlayTextarea!: OverlayTextareaComponent;

  @ViewChild(AddSchemeButtonComponent)
  addSchemeButtonComponent!: AddSchemeButtonComponent;

  @ViewChild('popover') popover!: Popover;

  toggleChildPop(event: Event) {
    this.popover.toggle(event);
  }

  VALID_TYPES = [
    'string',
    'number',
    'boolean',
    'object',
    'array',
    'integer',
    'null',
  ];

  private isUpdating = false;
  selectedRowData: any;
  jsonTree: TreeNode[] = [];
  swaggerSubscription!: Subscription;
  schema: string = '';
  cols: { field: string; header: string }[] = [];
  selectedCol: any;
  apiSchemas: any[] = [];
  selectedLanguage = 'en';

  private router = inject(Router);

  constructor(
    private toastMessageService: MessageService,
    public translate: TranslateService
  ) {
    const savedLang = localStorage.getItem('language') || 'en';
    this.selectedLanguage = savedLang;
    this.translate.setDefaultLang(savedLang);
    this.translate.use(savedLang);
    this.translate.onLangChange.subscribe(() => {});
  }

  ngOnInit(): void {
    this.loadTranslations();
    this.fetchModelDetails();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedSchema'] && this.selectedSchema) {
      this.fetchModelDetails();
    }
  }

  async loadTranslations(): Promise<void> {
    this.cols = [
      {
        field: 'name',
        header: await this.translate.get('SCHEMA_TABS.NAME').toPromise(),
      },
      {
        field: 'type',
        header: await this.translate.get('SCHEMA_TABS.TYPE').toPromise(),
      },
    ];
  }

  onSchemaUpdated(updatedSchema: any): void {
    console.log('Schema updated in child:', updatedSchema);

    // this.selectedSchema = updatedSchema;

    // let swaggerSpec = this.apiDataService.getSelectedSwaggerSpecValue();

    // // swaggerSpec.components.schemas[this.selectedSchemaName] =
    // this.selectedSchema;

    // swaggerSpec[this.apiUpdatePath] = this.selectedSchema;

    // this.apiDataService.updateSwaggerSpec(swaggerSpec);
    // this.apiDataService.saveSwaggerSpecToStorage(swaggerSpec);

    this.schemaUpdated.emit(updatedSchema);

    this.fetchModelDetails();
  }

  handleRowDeletion(deletedRow: any): void {
    if (!this.jsonTree || !Array.isArray(this.jsonTree)) {
      console.error('Error: jsonTree is not properly initialized.');
      return;
    }

    const filterNodes = (nodes: TreeNode[]): TreeNode[] => {
      return nodes
        .filter((node) => node.data.uniqueId !== deletedRow.uniqueId)
        .map((node) => ({
          ...node,
          children: node.children ? filterNodes(node.children) : [],
        }));
    };

    this.jsonTree = filterNodes(this.jsonTree);

    this.deleteRow.emit(deletedRow);
  }

  handleArray(property: any): string {
    const resolveArrayType = (items: any): string => {
      if (!items || Object.keys(items).length === 0) {
        return '';
      }

      if (items.$ref) {
        const schemaName = this.extractSchemaNameFromRef(items.$ref);
        return schemaName.replace(/\s+/g, '');
      }

      if (
        items.type === 'array' ||
        (Array.isArray(items.type) && items.type.includes('array'))
      ) {
        const nestedType = resolveArrayType(items.items);
        return `array[${nestedType}]`;
      }

      const itemTypes = Array.isArray(items.type)
        ? items.type
        : [items.type || ''];
      const resolvedItemType = itemTypes.includes('null')
        ? itemTypes.filter((type: string) => type !== 'null').join(' or ') +
          ' or null'
        : itemTypes.join(' or ');

      return resolvedItemType;
    };

    const items = property.items;

    const resolvedItemType = resolveArrayType(items);

    const parentTypes = Array.isArray(property.type)
      ? property.type
      : [property.type || 'array'];
    const parentHasNull = parentTypes.includes('null');

    return parentHasNull
      ? resolvedItemType
        ? `array[${resolvedItemType}] or null`
        : `array or null`
      : resolvedItemType
      ? `array[${resolvedItemType}]`
      : `array`;
  }

  getSchemaName(schema: any): string {
    if (schema?.$ref) {
      const refSchemaName = this.extractSchemaNameFromRef(schema.$ref);
      return refSchemaName;
    }

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

  modifyExtensions = (schema: any): any => {
    if (!schema || typeof schema !== 'object') return schema;

    if (!schema[`x-${this.nameOfId}`]) {
      schema[`x-${this.nameOfId}`] = { id: this.generateUniqueId() };
    }

    return schema;
  };

  generateUniqueId = (): string => {
    return Math.random().toString(36).substring(2, 15);
  };

  handleSchemaUpdated(event: any) {
    this.updateFieldInSchemaById(event, this.selectedSchema);
    this.onSchemaUpdated(this.selectedSchema);
    this.fetchModelDetails();
  }

  updateFieldInSchemaById(
    event: any,
    schema: any,
    resolvedRefs: Set<string> = new Set()
  ): boolean {
    if (!schema || !event) {
      return false;
    }

    const targetId = event['x-myappika']?.id;
    if (!targetId) {
      console.error('No x-myappika.id found in event');
      return false;
    }

    if (schema['x-myappika']?.id === targetId) {
      Object.assign(schema, event);
      return true;
    }

    if (schema.properties) {
      for (const propertyKey in schema.properties) {
        const property = schema.properties[propertyKey];
        const updated = this.updateFieldInSchemaById(
          event,
          property,
          resolvedRefs
        );
        if (updated) {
          return true;
        }
      }
    }

    const compositeConstructs = ['allOf', 'anyOf', 'oneOf'];
    for (const construct of compositeConstructs) {
      if (schema[construct] && Array.isArray(schema[construct])) {
        for (const subSchema of schema[construct]) {
          const updated = this.updateFieldInSchemaById(
            event,
            subSchema,
            resolvedRefs
          );
          if (updated) {
            return true;
          }
        }
      }
    }

    if (schema.additionalProperties) {
      const updated = this.updateFieldInSchemaById(
        event,
        schema.additionalProperties,
        resolvedRefs
      );
      if (updated) {
        return true;
      }
    }

    if (schema.type === 'array' && schema.items) {
      const updated = this.updateFieldInSchemaById(
        event,
        schema.items,
        resolvedRefs
      );
      if (updated) {
        return true;
      }
    }

    if (schema.$ref) {
      const refSchemaName = this.extractSchemaNameFromRef(schema.$ref);

      if (!resolvedRefs.has(refSchemaName)) {
        resolvedRefs.add(refSchemaName);
        const referencedSchema = this.getSchemaByRef(schema.$ref);

        if (!referencedSchema) {
          return false;
        }

        return this.updateFieldInSchemaById(
          event,
          referencedSchema,
          resolvedRefs
        );
      }
    }

    return false;
  }

  shouldShowAddButton(schema: any): boolean {
    if (!schema) {
      return false;
    }
    if (schema.$ref) {
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

    return false;
  }

  fetchModelDetails(): void {
    const swaggerSpec = this.apiDataService.getSelectedSwaggerSpecValue();
    if (swaggerSpec?.components?.schemas) {
      const schemas = swaggerSpec.components.schemas;

      this.apiSchemas = Object.keys(schemas).map((schemaName) => ({
        name: schemaName,
        details: schemas[schemaName],
      }));
    }

    const schemaName = this.getSchemaName(this.selectedSchema);

    this.modifyExtensions(this.selectedSchema);

    const rootNode: TreeNode = {
      label: this.selectedSchema.title,
      data: {
        name: schemaName,
        description: this.selectedSchema.description || '',
        type: schemaName,
        showAddButton: this.shouldShowAddButton(this.selectedSchema),
        editDisabled: false,
        isReferenceChild: false,
        isRootNode: true,
        isSubschemeChild: false,
        uniqueId: this.selectedSchema[`x-${this.nameOfId}`]?.id || 'no-id',
      },
      children: [],
      expanded: true,
    };

    this.jsonTree = this.schemaToTreeNode(this.selectedSchema, rootNode);

    // console.log('jsonTree', this.jsonTree);
  }

  formatTypeWithCount(type: string, count: number): string {
    return `${type} {${count}}`;
  }

  formatType = (type: any): string => {
    if (Array.isArray(type)) {
      return type.join(' | ');
    } else {
      return type;
    }
  };

  schemaToTreeNode(
    schema: any,
    rootNode: TreeNode | null = null,
    resolvedRefs: Set<string> = new Set()
  ): TreeNode[] {
    const nodes: TreeNode[] = [];

    const schemaName = schema?.allOf
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

    if (!rootNode) {
      this.modifyExtensions(schema);

      rootNode = {
        label: schema?.title || 'No schema',
        data: {
          name: schemaName,
          description: schema?.description || '',
          type: schemaName,
          showAddButton: this.shouldShowAddButton(schema),
          editDisabled: false,
          isReferenceChild: false,
          isRootNode: false,
          isSubschemeChild: true,
          uniqueId: schema[`x-${this.nameOfId}`]?.id || 'no-idsss',
        },
        children: [],
        expanded: true,
      };
    }

    const disableEditOnAllChildren = (node: TreeNode) => {
      node.data.editDisabled = true;
      node.children?.forEach(disableEditOnAllChildren);
    };

    const referenceChildren = (node: TreeNode) => {
      node.data.showReferenceButton = false;
      node.data.editDisabled = true;
      node.data.showAddButton = false;
      node.data.isReferenceChild = true;
      node.children?.forEach(referenceChildren);
    };

    const processSubSchemas = (subSchemas: any[], _typeLabel: string) => {
      const validTypes = [
        'array',
        'integer',
        'number',
        'string',
        'boolean',
        'dictionary',
        'null',
        'any',
      ];

      subSchemas.forEach((subSchema: any) => {
        this.modifyExtensions(subSchema);

        if (subSchema?.$ref) {
          const refSchemaName = this.extractSchemaNameFromRef(subSchema.$ref);

          if (!resolvedRefs.has(refSchemaName)) {
            resolvedRefs.add(refSchemaName);
            const referencedSchema = this.getSchemaByRef(subSchema.$ref);

            if (referencedSchema) {
              const childNode: TreeNode = {
                label: refSchemaName,
                data: {
                  name: refSchemaName,
                  description: referencedSchema.description || '',
                  type: this.formatType(referencedSchema.type || ''),
                  showReferenceButton: true,
                  editDisabled: true,
                  childOfSchema: true,
                  uniqueId: subSchema[`x-${this.nameOfId}`]?.id || 'no-id',
                },
                children: [],
                parent: rootNode,
              };

              const resolvedChildren = this.schemaToTreeNode(
                referencedSchema,
                null,
                resolvedRefs
              );

              resolvedChildren.forEach((resolvedChild) => {
                disableEditOnAllChildren(resolvedChild);
                referenceChildren(resolvedChild);
                childNode.children!.push(resolvedChild);
              });

              rootNode.children!.push(childNode);
            }
          }
        } else if (subSchema?.items) {
          const arrayType = this.handleArray(subSchema);
          this.modifyExtensions(subSchema);

          const childNode: TreeNode = {
            label: arrayType,
            data: {
              name: arrayType,
              description: subSchema?.description || '',
              type: '',
              showReferenceButton: !!subSchema?.$ref,
              editDisabled: !!subSchema?.$ref,
              isReferenceChild: false,
              isRootNode: false,
              childOfSchema: true,
              isObjArrOrDisc: true,
              uniqueId: subSchema[`x-${this.nameOfId}`]?.id || 'no-id',
            },
            children: [],
            parent: rootNode,
          };

          const processItemsRecursively = (
            items: any,
            parentNode: TreeNode
          ) => {
            const hasType = !!items.type;
            const hasProperties =
              items.properties && Object.keys(items.properties).length > 0;
            const hasNestedItems = items.items || items.additionalProperties;

            if (hasType || hasProperties || hasNestedItems) {
              const resolvedChildren = this.schemaToTreeNode(
                items,
                null,
                resolvedRefs
              );

              resolvedChildren.forEach((resolvedChild) => {
                if (resolvedChild.data) {
                  if (resolvedChild.data.type) {
                    resolvedChild.data.type = resolvedChild.data.type.replace(
                      /\s\{\d+\}/,
                      ''
                    );
                  }
                  if (resolvedChild.data.name) {
                    resolvedChild.data.name = resolvedChild.data.name.replace(
                      /\s\{\d+\}/,
                      ''
                    );
                  }
                }

                if (
                  resolvedChild.data &&
                  resolvedChild.data.type === 'object' &&
                  resolvedChild.children &&
                  resolvedChild.children.length > 0
                ) {
                  const deepestItems = this.getDeepestItems(
                    resolvedChild.children
                  );
                  deepestItems.forEach((deepestItem) => {
                    parentNode.children!.push(deepestItem);
                  });
                } else if (
                  resolvedChild.data &&
                  resolvedChild.data.type === 'array'
                ) {
                  processItemsRecursively(items.items, parentNode);
                } else if (
                  items.additionalProperties &&
                  items.additionalProperties.properties
                ) {
                  const additionalPropsResolved = this.schemaToTreeNode(
                    items.additionalProperties,
                    null,
                    resolvedRefs
                  );

                  const additionalDeepestItems = this.getDeepestItems(
                    additionalPropsResolved
                  );
                  additionalDeepestItems.forEach((deepestItem) => {
                    parentNode.children!.push(deepestItem);
                  });
                }
              });
            }
          };

          processItemsRecursively(subSchema.items, childNode);

          if (childNode.children && childNode.children.length > 0) {
            childNode.data.showAddButton = true;
          }

          rootNode.children!.push(childNode);
        } else if (subSchema?.additionalProperties) {
          const discType = this.handleAdditionalProperties(subSchema);

          const childNode: TreeNode = {
            label: discType,
            data: {
              name: discType,
              description: subSchema?.description || '',
              type: '',
              showReferenceButton: !!subSchema?.$ref,
              editDisabled: !!subSchema?.$ref,
              isReferenceChild: false,
              isRootNode: false,
              isObjArrOrDisc: true,
              childOfSchema: true,
              uniqueId: subSchema[`x-${this.nameOfId}`]?.id || 'no-id',
            },
            children: [],
            parent: rootNode,
          };

          const additionalProps = subSchema.additionalProperties;

          const hasProperties =
            additionalProps.properties &&
            Object.keys(additionalProps.properties).length > 0;

          const hasNestedAdditionalProperties =
            !!additionalProps.additionalProperties &&
            this.checkNestedProperties(additionalProps.additionalProperties);

          if (!hasProperties && !hasNestedAdditionalProperties) {
            rootNode.children!.push(childNode);
            return;
          }

          if (hasProperties) {
            Object.keys(additionalProps.properties).forEach((key) => {
              const subProperty = additionalProps.properties[key];

              const subChildNode: TreeNode = {
                label: key,
                data: {
                  name: key,
                  description: subProperty?.description || '',
                  type: this.formatPropertyType(subProperty),
                  showReferenceButton: !!subProperty?.$ref,
                  editDisabled: !!subProperty?.$ref,
                  isReferenceChild: false,
                  isRootNode: false,
                  uniqueId: subProperty[`x-${this.nameOfId}`]?.id || 'no-id',
                },
                children: [],
                parent: childNode,
              };

              childNode.children!.push(subChildNode);
            });
          }

          if (hasNestedAdditionalProperties) {
            const resolvedChildren = this.schemaToTreeNode(
              subSchema.additionalProperties,
              null,
              resolvedRefs
            );

            resolvedChildren.forEach((resolvedChild) => {
              if (
                resolvedChild.data &&
                resolvedChild.data.type === 'object' &&
                resolvedChild.children &&
                resolvedChild.children.length > 0
              ) {
                const deepestItems = this.getDeepestItems(
                  resolvedChild.children
                );
                deepestItems.forEach((deepestItem) => {
                  childNode.children!.push(deepestItem);
                });
              }
            });
          }

          if (childNode.children && childNode.children.length > 0) {
            childNode.data.showAddButton = true;
          }

          rootNode.children!.push(childNode);
        } else if (
          (subSchema?.type && validTypes.includes(subSchema.type)) ||
          Array.isArray(subSchema?.type)
        ) {
          let typeLabel: string | string[] = subSchema.type;

          const itemsType = Array.isArray(subSchema.items?.type)
            ? subSchema.items?.type
            : subSchema.items?.type
            ? [subSchema.items.type]
            : [];

          if (
            Array.isArray(subSchema.type) &&
            subSchema.type.includes('object') &&
            !subSchema.properties
          ) {
            subSchema.properties = {};
          }

          if (subSchema.type === 'array' && itemsType.length > 0) {
            typeLabel = itemsType.includes('null')
              ? [
                  'array',
                  ...itemsType.filter((t: string) => t !== 'null'),
                  'null',
                ]
              : ['array', ...itemsType];
          } else if (
            subSchema.type === 'object' &&
            subSchema.additionalProperties
          ) {
            const dictionaryType = this.handleAdditionalProperties(subSchema);
            typeLabel = `dictionary[string, ${dictionaryType}]`;
          }

          const childNode: TreeNode = {
            label: Array.isArray(typeLabel)
              ? typeLabel.join(' or ')
              : typeLabel,
            data: {
              name: Array.isArray(typeLabel)
                ? typeLabel.join(' or ')
                : typeLabel,
              description: subSchema?.description || '',
              type: '',
              showReferenceButton: !!subSchema?.$ref,
              editDisabled: true,
              isReferenceChild: false,
              isRootNode: false,
              isSubschemeChild: true,
              uniqueId: subSchema[`x-${this.nameOfId}`]?.id || 'no-id',
            },
            children: [],
            parent: rootNode,
          };
          rootNode.children!.push(childNode);
        } else {
          const resolvedSubSchemas = this.schemaToTreeNode(
            subSchema,
            null,
            resolvedRefs
          );

          resolvedSubSchemas.forEach((resolvedChild) => {
            if (resolvedChild.data) {
              resolvedChild.data.editDisabled = true;
            }
            rootNode!.children!.push(resolvedChild);
          });
        }
      });
    };

    this.modifyExtensions(schema);

    if (schema?.allOf) {
      processSubSchemas(schema.allOf, 'allOf');
    }
    if (schema?.oneOf) {
      processSubSchemas(schema.oneOf, 'oneOf');
    }
    if (schema?.anyOf) {
      processSubSchemas(schema.anyOf, 'anyOf');
    }

    if (schema?.properties) {
      this.modifyExtensions(schema);

      // console.log('Scheama:', schema.required);

      Object.keys(schema.properties).forEach((propertyKey) => {
        const property = schema.properties[propertyKey];

        if (!property) {
          console.warn(`Property ${propertyKey} is null or undefined.`);
          return;
        }

        // if (schema.required && schema.required.includes(propertyKey)) {
        //   console.log('Property:', propertyKey);
        // }

        this.modifyExtensions(property);

        if (property.$ref) {
          const refSchemaName = this.extractSchemaNameFromRef(property.$ref);
          this.modifyExtensions(property);

          const childNode: TreeNode = {
            label: propertyKey,
            data: {
              name: propertyKey,
              description: property?.description || '',
              type: refSchemaName || '',
              showReferenceButton: !!property?.$ref,
              editDisabled: false,
              isReferenceChild: false,
              isRootNode: false,
              isObjArrOrDisc: true,
              isRequired: schema.required?.includes(propertyKey),
              uniqueId: property[`x-${this.nameOfId}`]?.id || 'no-id',
            },
            children: [],
            parent: rootNode,
          };

          if (!resolvedRefs.has(refSchemaName)) {
            resolvedRefs.add(refSchemaName);
            const referencedSchema = this.getSchemaByRef(property.$ref);

            if (referencedSchema) {
              const resolvedChildren = this.schemaToTreeNode(
                referencedSchema,
                null,
                resolvedRefs
              );

              resolvedChildren.forEach((resolvedChild) => {
                disableEditOnAllChildren(resolvedChild);
                referenceChildren(resolvedChild);
                childNode.children!.push(resolvedChild);
              });

              rootNode.children!.push(childNode);
            }
          }
        } else if (property?.allOf || property?.oneOf || property?.anyOf) {
          const combinedType = property.allOf
            ? 'allOf'
            : property.oneOf
            ? 'oneOf'
            : 'anyOf';

          this.modifyExtensions(property);

          const childNode: TreeNode = {
            label: propertyKey,
            data: {
              name: propertyKey,
              description: property?.description || '',
              type:
                this.formatTypeWithCount(
                  combinedType,
                  Object.keys(property[combinedType]).length
                ) || '',
              showReferenceButton: !!property?.$ref,
              editDisabled: !!property?.$ref,
              isReferenceChild: false,
              isRootNode: false,
              showAddButton: this.shouldShowAddButton(property),
              childOfProperty: true,
              isObjectChild: true,
              isRequired: schema.required?.includes(propertyKey),
              uniqueId: property[`x-${this.nameOfId}`]?.id || 'no-id',
            },
            children: [],
            parent: rootNode,
          };

          const resolvedChildren = this.schemaToTreeNode(
            property,
            null,
            resolvedRefs
          );

          resolvedChildren.forEach((resolvedChild) => {
            if (resolvedChild.children && resolvedChild.children.length > 0) {
              resolvedChild.children.forEach((nestedChild) => {
                childNode.children!.push(nestedChild);
              });
            }
          });

          rootNode.children!.push(childNode);
        } else if (property?.properties) {
          this.modifyExtensions(property);

          const childNode: TreeNode = {
            label: propertyKey,
            data: {
              name: propertyKey,
              description: property?.description || '',
              type: this.formatPropertyType(property) || '',
              showReferenceButton: !!property?.$ref,
              editDisabled: !!property?.$ref,
              isReferenceChild: false,
              isRootNode: false,
              childOfProperty: true,
              isObjectChild: true,
              isRequired: schema.required?.includes(propertyKey),
              showAddButton: this.shouldShowAddButton(property),
              uniqueId: property[`x-${this.nameOfId}`]?.id || 'no-id',
            },
            children: [],
            parent: rootNode,
          };

          const resolvedChildren = this.schemaToTreeNode(
            property,
            null,
            resolvedRefs
          );

          resolvedChildren.forEach((resolvedChild) => {
            if (resolvedChild.children && resolvedChild.children.length > 0) {
              resolvedChild.children.forEach((nestedChild) => {
                childNode.children!.push(nestedChild);
              });
            }
          });
          rootNode.children!.push(childNode);
        } else if (property?.enum) {
          this.modifyExtensions(property);

          const childNode: TreeNode = {
            label: propertyKey,
            data: {
              name: propertyKey,
              description: property?.description || '',
              type: 'enum',
              showReferenceButton: !!property?.$ref,
              editDisabled: !!property?.$ref,
              isReferenceChild: false,
              isRootNode: false,
              isObjectChild: true,
              isRequired: schema.required?.includes(propertyKey),
              uniqueId: property[`x-${this.nameOfId}`]?.id || 'no-id',
            },
            children: [],
            parent: rootNode,
          };

          rootNode.children!.push(childNode);
        } else if (property?.additionalProperties) {
          this.modifyExtensions(property);

          const discType = this.handleAdditionalProperties(property);

          const childNode: TreeNode = {
            label: propertyKey,
            data: {
              name: propertyKey,
              description: property?.description || '',
              type: discType,
              showReferenceButton: !!property?.$ref,
              editDisabled: !!property?.$ref,
              isReferenceChild: false,
              isRootNode: false,
              isObjArrOrDisc: true,
              isObjectChild: true,
              isRequired: schema.required?.includes(propertyKey),
              uniqueId: property[`x-${this.nameOfId}`]?.id || 'no-id',
            },
            children: [],
            parent: rootNode,
          };

          const additionalProps = property.additionalProperties;

          const hasProperties =
            additionalProps.properties &&
            Object.keys(additionalProps.properties).length > 0;

          const hasNestedAdditionalProperties =
            !!additionalProps.additionalProperties &&
            this.checkNestedProperties(additionalProps.additionalProperties);

          if (!hasProperties && !hasNestedAdditionalProperties) {
            rootNode.children!.push(childNode);
            return;
          }

          if (hasProperties) {
            Object.keys(additionalProps.properties).forEach((key) => {
              const subProperty = additionalProps.properties[key];
              this.modifyExtensions(subProperty);

              const subChildNode: TreeNode = {
                label: key,
                data: {
                  name: key,
                  description: subProperty?.description || '',
                  type: this.formatPropertyType(subProperty),
                  showReferenceButton: !!subProperty?.$ref,
                  editDisabled: !!subProperty?.$ref,
                  isReferenceChild: false,
                  isRootNode: false,
                  isRequired: schema.required?.includes(propertyKey),
                  showAddButton: this.shouldShowAddButton(subProperty),
                  uniqueId: subProperty[`x-${this.nameOfId}`]?.id || 'no-id',
                },
                children: [],
                parent: childNode,
              };

              childNode.children!.push(subChildNode);
            });
          }

          if (hasNestedAdditionalProperties) {
            const resolvedChildren = this.schemaToTreeNode(
              property.additionalProperties,
              null,
              resolvedRefs
            );

            resolvedChildren.forEach((resolvedChild) => {
              if (
                resolvedChild.data &&
                resolvedChild.data.type === 'object' &&
                resolvedChild.children &&
                resolvedChild.children.length > 0
              ) {
                const deepestItems = this.getDeepestItems(
                  resolvedChild.children
                );
                deepestItems.forEach((deepestItem) => {
                  childNode.children!.push(deepestItem);
                });
              }
            });
          }
          if (childNode.children && childNode.children.length > 0) {
            childNode.data.showAddButton = true;
          }

          rootNode.children!.push(childNode);
        } else if (property.items) {
          this.modifyExtensions(property);

          const arrayType = this.handleArray(property);

          const childNode: TreeNode = {
            label: propertyKey,
            data: {
              name: propertyKey,
              description: property?.description || '',
              type: arrayType,
              showReferenceButton: !!property?.$ref,
              editDisabled: !!property?.$ref,
              isReferenceChild: false,
              isRootNode: false,
              isObjArrOrDisc: true,
              isObjectChild: true,
              isRequired: schema.required?.includes(propertyKey),
              uniqueId: property[`x-${this.nameOfId}`]?.id || 'no-id',
            },
            children: [],
            parent: rootNode,
          };

          const processItemsRecursively = (
            items: any,
            parentNode: TreeNode
          ) => {
            const hasType = !!items.type;
            const hasProperties =
              items.properties && Object.keys(items.properties).length > 0;
            const hasNestedItems = items.items || items.additionalProperties;

            if (hasType || hasProperties || hasNestedItems) {
              const resolvedChildren = this.schemaToTreeNode(
                items,
                null,
                resolvedRefs
              );

              resolvedChildren.forEach((resolvedChild) => {
                if (resolvedChild.data) {
                  if (resolvedChild.data.type) {
                    resolvedChild.data.type = resolvedChild.data.type.replace(
                      /\s\{\d+\}/,
                      ''
                    );
                  }
                  if (resolvedChild.data.name) {
                    resolvedChild.data.name = resolvedChild.data.name.replace(
                      /\s\{\d+\}/,
                      ''
                    );
                  }
                }

                if (
                  resolvedChild.data &&
                  resolvedChild.data.type === 'object' &&
                  resolvedChild.children &&
                  resolvedChild.children.length > 0
                ) {
                  const deepestItems = this.getDeepestItems(
                    resolvedChild.children
                  );
                  deepestItems.forEach((deepestItem) => {
                    parentNode.children!.push(deepestItem);
                  });
                } else if (
                  resolvedChild.data &&
                  resolvedChild.data.type === 'array'
                ) {
                  processItemsRecursively(items.items, parentNode);
                } else if (
                  items.additionalProperties &&
                  items.additionalProperties.properties
                ) {
                  const additionalPropsResolved = this.schemaToTreeNode(
                    items.additionalProperties,
                    null,
                    resolvedRefs
                  );

                  const additionalDeepestItems = this.getDeepestItems(
                    additionalPropsResolved
                  );
                  additionalDeepestItems.forEach((deepestItem) => {
                    parentNode.children!.push(deepestItem);
                  });
                }
              });
            }
          };

          processItemsRecursively(property.items, childNode);

          if (childNode.children && childNode.children.length > 0) {
            childNode.data.showAddButton = true;
          }

          rootNode.children!.push(childNode);
        } else if (this.isValidType(property?.type)) {
          this.modifyExtensions(property);

          if (
            Array.isArray(property.type) &&
            property.type.includes('object') &&
            !property.properties
          ) {
            property.properties = {};
          }

          const childNode: TreeNode = {
            label: propertyKey,
            data: {
              name: propertyKey,
              description: property?.description || '',
              type: this.formatPropertyType(property) || '',
              showReferenceButton: !!property?.$ref,
              editDisabled: !!property?.$ref,
              isReferenceChild: false,
              isRootNode: false,
              showAddButton: this.shouldShowAddButton(property),
              isChildOfProperties: true,
              isObjArrOrDisc: false,
              isRequired: schema.required?.includes(propertyKey),
              uniqueId: property[`x-${this.nameOfId}`]?.id || 'no-ids',
            },
            children: [],
            parent: rootNode,
          };
          rootNode.children!.push(childNode);
        }
      });
    } else if (schema?.enum) {
      this.modifyExtensions(schema);

      rootNode!.children = schema.enum.map((enumValue: string) => ({
        label: enumValue,
        data: {
          name: enumValue,
          type: '',
          editDisabled: true,
          uniqueId: schema[`x-${this.nameOfId}`]?.id || 'no-id',
        },
        children: [],
      }));
    } else if (schema?.additionalProperties) {
      this.modifyExtensions(schema);

      const discType = this.handleAdditionalProperties(schema);

      const childNode: TreeNode = {
        label: 'asdqweqe',
        data: {
          name: 'propertyKey',
          description: schema?.description || '',
          type: discType,
          showReferenceButton: !!schema?.$ref,
          editDisabled: !!schema?.$ref,
          isReferenceChild: false,
          isObjArrOrDisc: true,
          isRootNode: false,

          uniqueId: schema[`x-${this.nameOfId}`]?.id || 'no-id',
        },
        children: [],
        parent: rootNode,
      };

      const resolvedChildren = this.schemaToTreeNode(
        schema.additionalProperties,
        null,
        resolvedRefs
      );

      resolvedChildren.forEach((resolvedChild) => {
        if (resolvedChild.children && resolvedChild.children.length > 0) {
          resolvedChild.children.forEach((nestedChild) => {
            childNode.children!.push(nestedChild);
          });
        }
      });
      rootNode.children!.push(childNode);
    } else if (schema?.items) {
      this.modifyExtensions(schema);

      const arrayType = this.handleArray(schema);

      const childNode: TreeNode = {
        //TODO: check its good like this the name
        label: schema.name,
        data: {
          name: schema.name,
          description: schema?.description || '',
          type: arrayType,
          showReferenceButton: !!schema?.$ref,
          editDisabled: !!schema?.$ref,
          isReferenceChild: false,
          isRootNode: false,
          isObjArrOrDisc: true,
          uniqueId: schema[`x-${this.nameOfId}`]?.id || 'no-id',
        },
        children: [],
        parent: rootNode,
      };

      if (schema.items != null && Object.keys(schema.items).length > 0) {
        const resolvedChildren = this.schemaToTreeNode(
          schema.items,
          null,
          resolvedRefs
        );

        resolvedChildren.forEach((resolvedChild) => {
          if (resolvedChild.children && resolvedChild.children.length > 0) {
            resolvedChild.children.forEach((nestedChild) => {
              // disableEditOnAllChildren(nestedChild);
              // referenceChildren(nestedChild);
              childNode.children!.push(nestedChild);
            });
          }
        });
      }
      rootNode.children!.push(childNode);
    }

    nodes.push(rootNode);
    return nodes;
  }

  handleAdditionalProperties(property: any): string {
    const additionalProps = property.additionalProperties;

    if (!additionalProps) {
      return 'dictionary[string, any]';
    }

    if (additionalProps.type === 'array' && additionalProps.items) {
      const arrayType = additionalProps.items.type || 'any';
      const nestedType = additionalProps.items.additionalProperties
        ? this.handleAdditionalProperties({
            additionalProperties: additionalProps.items.additionalProperties,
          })
        : arrayType;

      return `dictionary[string, array[${nestedType}]]`;
    }

    if (
      additionalProps.type === 'object' &&
      additionalProps.additionalProperties
    ) {
      const nestedDictionaryType = this.handleAdditionalProperties({
        additionalProperties: additionalProps.additionalProperties,
      });
      return `dictionary[string, ${nestedDictionaryType}]`;
    }

    if (additionalProps.type === 'object' && additionalProps.properties) {
      return 'dictionary[string, object]';
    }

    const types = Array.isArray(additionalProps.type)
      ? additionalProps.type.join(' or ')
      : additionalProps.type || 'any';

    const additionalFormat = additionalProps.format
      ? `<${additionalProps.format}>`
      : '';

    return `dictionary[string, ${types}${additionalFormat}]`;
  }

  private checkNestedProperties(nestedProps: any): boolean {
    if (!nestedProps || typeof nestedProps !== 'object') {
      return false;
    }

    if (
      nestedProps.properties &&
      Object.keys(nestedProps.properties).length > 0
    ) {
      return true;
    }

    if (nestedProps.additionalProperties) {
      return this.checkNestedProperties(nestedProps.additionalProperties);
    }

    return false;
  }

  formatPropertyType(property: any): string {
    if (Array.isArray(property.type)) {
      if (property.type.length === 2 && property.type.includes('null')) {
        const nonNullType = property.type.find((t: string) => t !== 'null');
        return property.format
          ? `${nonNullType}<${property.format}> or null`
          : `${nonNullType} or null`;
      }
      return property.type.join(' or ');
    } else if (typeof property.type === 'string') {
      return property.format
        ? `${property.type}<${property.format}>`
        : property.type;
    }

    return 'any';
  }

  handleGoRefScheme(event: any): void {
    this.router.navigate(['/schemas', event]);
  }

  isSpecialType(type: string | string[] | { type: string }[]): boolean {
    const specialTypes = [
      'allOf',
      'anyOf',
      'oneOf',
      'enum',
      'object',
      'array',
      'integer',
      'number',
      'string',
      'boolean',
      'dictionary',
      'null',
      'any',
    ];

    const stringFormats = [
      'None',
      'byte',
      'binary',
      'date',
      'date-time',
      'password',
      'email',
      'time',
      'duration',
      'idn-email',
      'hostname',
      'idn-hostname',
      'ipv4',
      'ipv6',
      'uri',
      'uri-reference',
      'uuid',
      'uri-template',
      'json-pointer',
      'relative-json-pointer',
      'regex',
    ];

    const numberFormats = ['float', 'double'];
    const intFormats = ['int32', 'int64'];

    const cleanType = (typeStr: string): string => {
      return typeStr.replace(/ or null$/, '').trim();
    };

    const isObjectWithNumber = (typeStr: string): boolean => {
      const match = typeStr.match(/^(object|allOf|anyOf|oneOf)\s*\{\d+\}$/);
      return match !== null;
    };

    const validateDictionaryType = (typeStr: string): boolean => {
      const match = typeStr.match(/^dictionary\[(.+), (.+)\]$/);
      if (match) {
        const keyType = match[1].trim();
        const valueType = match[2].trim();
        return (
          keyType === 'string' &&
          (specialTypes.includes(cleanType(valueType)) ||
            stringFormats.includes(cleanType(valueType)) ||
            numberFormats.includes(cleanType(valueType)) ||
            intFormats.includes(cleanType(valueType)) ||
            validateGenericType(valueType))
        );
      }
      return false;
    };

    const validateGenericType = (typeStr: string): boolean => {
      const match = typeStr.match(/^(\w+)<(.+)>$/);
      if (match) {
        const baseType = match[1];
        const formatType = match[2];
        return (
          specialTypes.includes(cleanType(baseType)) &&
          (stringFormats.includes(cleanType(formatType)) ||
            numberFormats.includes(cleanType(formatType)) ||
            intFormats.includes(cleanType(formatType)))
        );
      }
      return false;
    };

    const validateArrayType = (typeStr: string): boolean => {
      if (typeStr === 'array') {
        return true;
      }

      if (typeStr === 'array[]') {
        return true;
      }

      const match = typeStr.match(/^array\[(.+)\]$/);
      if (match) {
        const innerType = match[1].trim();

        if (innerType.startsWith('array')) {
          return validateArrayType(innerType);
        }

        const isReferenceValid = this.getSchemaByRef
          ? !!this.getSchemaByRef(`#/components/schemas/${innerType}`)
          : false;

        return (
          specialTypes.includes(cleanType(innerType)) ||
          isReferenceValid ||
          stringFormats.includes(cleanType(innerType)) ||
          numberFormats.includes(cleanType(innerType)) ||
          intFormats.includes(cleanType(innerType)) ||
          validateGenericType(innerType)
        );
      }

      return false;
    };

    const validateUnionTypes = (typeStr: string): boolean => {
      const unionTypes = typeStr.split(' or ').map((t) => t.trim());
      return unionTypes.every(
        (t) =>
          validateArrayType(t) ||
          validateGenericType(t) ||
          specialTypes.includes(cleanType(t)) ||
          stringFormats.includes(cleanType(t)) ||
          numberFormats.includes(cleanType(t)) ||
          intFormats.includes(cleanType(t))
      );
    };

    if (typeof type === 'string') {
      const cleanedType = type.trim();

      if (isObjectWithNumber(cleanedType)) {
        return true;
      }

      if (cleanedType === 'array') {
        return true;
      }
      if (cleanedType.startsWith('array')) {
        return validateArrayType(cleanedType);
      }
      if (cleanedType.startsWith('dictionary')) {
        return validateDictionaryType(cleanedType);
      }
      if (cleanedType.includes(' or ')) {
        return validateUnionTypes(cleanedType);
      }

      return (
        specialTypes.includes(cleanType(cleanedType)) ||
        stringFormats.includes(cleanType(cleanedType)) ||
        numberFormats.includes(cleanType(cleanedType)) ||
        intFormats.includes(cleanType(cleanedType)) ||
        validateGenericType(cleanedType)
      );
    }

    if (Array.isArray(type)) {
      return type.every((t) =>
        this.isSpecialType(typeof t === 'string' ? t : t.type)
      );
    }

    return false;
  }

  toggleChildOverlay(event: Event, rowData: any): void {
    this.selectedCol = this.findFieldInSchema(rowData, this.selectedSchema);
    this.childComponent.toggleOverlay(event, rowData, this.selectedCol);
  }

  getDeepestItems(nodes: TreeNode[]): TreeNode[] {
    const deepestItems: TreeNode[] = [];

    const traverse = (node: TreeNode, currentDepth: number) => {
      if (!node.children || node.children.length === 0) {
        deepestItems.push(node);
      } else {
        node.children.forEach((child) => traverse(child, currentDepth + 1));
      }
    };

    nodes.forEach((node) => traverse(node, 0));
    return deepestItems;
  }

  onFieldBlur(_field: string, event: Event, rowData: any): void {
    if (this.isUpdating) return;
    this.isUpdating = true;
    const value = (event.target as HTMLInputElement).value;
    this.updateSchemaField(value, rowData);
    this.isUpdating = false;
  }
  onFieldEnter(_field: string, event: Event, rowData: any): void {
    if (this.isUpdating || (event as KeyboardEvent).key !== 'Enter') return;
    this.isUpdating = true;
    const inputElement = event.target as HTMLInputElement;
    const value = inputElement.value;
    this.updateSchemaField(value, rowData);
    inputElement.blur();
    this.isUpdating = false;
  }

  updateSchemaField(newName: string, rowData: any): void {
    //TODO: Test disc and arrays
    const updateInSchema = (
      schema: any,
      oldName: string,
      newName: string
    ): void => {
      const propertyValue = schema[oldName];

      if (!propertyValue) {
        console.warn(`Property '${oldName}' not found in schema.`);
        return;
      }

      delete schema[oldName];

      schema[newName] = propertyValue;
    };

    const findAndUpdate = (schema: any): void => {
      if (!schema || typeof schema !== 'object') return;

      if (schema.properties) {
        const propertyKey = Object.keys(schema.properties).find((key) => {
          const propertyId = schema.properties[key][`x-${this.nameOfId}`]?.id;
          const isMatchingId = propertyId === rowData.uniqueId;

          if (isMatchingId) {
            return true;
          }

          if (schema.properties[key].properties) {
            findAndUpdate(schema.properties[key]);
          }

          return false;
        });
        if (propertyKey !== undefined) {
          updateInSchema(schema.properties, propertyKey, newName);
          this.deleteRowEvent.emit();
          return;
        }
      }

      ['allOf', 'anyOf', 'oneOf'].forEach((composite) => {
        if (schema[composite] && Array.isArray(schema[composite])) {
          schema[composite].forEach((subSchema: any) => {
            findAndUpdate(subSchema);
          });
        }
      });

      if (schema.items) {
        if (Array.isArray(schema.items)) {
          schema.items.forEach((item: any) => findAndUpdate(item));
        } else {
          findAndUpdate(schema.items);
        }
      }

      if (schema.additionalItems) {
        findAndUpdate(schema.additionalItems);
      }
    };

    if (this.selectedSchema) {
      findAndUpdate(this.selectedSchema);
      this.deleteRowEvent.emit();
    } else {
      console.warn('No schema found for updating.');
    }
  }

  getTypeStatus(input: string): boolean {
    const result = this.isValidTypeWithNumber(input);
    return result.isValidType && result.isTypeWithNumber;
  }

  isValidTypeWithNumber(input: string): {
    isValidType: boolean;
    isTypeWithNumber: boolean;
  } {
    const isValidType = this.isValidType(input);

    const isTypeWithNumber = /\{\d+\}/.test(input);

    return {
      isValidType,
      isTypeWithNumber,
    };
  }

  isValidType(type: any): boolean {
    if (type === undefined) return false;

    if (Array.isArray(type)) {
      return type.every(
        (t) => typeof t === 'string' && this.VALID_TYPES.includes(t)
      );
    } else if (typeof type === 'string') {
      const arrayTypeMatch = type.match(/^Array\((\w+)\)$/);
      if (arrayTypeMatch) {
        const innerType = arrayTypeMatch[1];
        return this.VALID_TYPES.includes(innerType);
      }
      return this.VALID_TYPES.includes(type);
    }

    return false;
  }

  onInfoClick(rowData: any): void {
    if (!this.selectedSchema || !rowData || !rowData.uniqueId) {
      console.warn(
        'No schema or invalid row data provided for required toggle.'
      );
      return;
    }

    const toggleRequiredByUniqueId = (
      schema: any,
      uniqueId: string,
      fieldName: string
    ): boolean => {
      if (!schema || typeof schema !== 'object') return false;

      if (schema.properties) {
        for (const key in schema.properties) {
          if (schema.properties[key][`x-${this.nameOfId}`]?.id === uniqueId) {
            if (!schema.required) {
              schema.required = [];
            }

            const isRequired = schema.required.includes(fieldName);

            if (isRequired) {
              schema.required = schema.required.filter(
                (field: string) => field !== fieldName
              );
            } else {
              schema.required.push(fieldName);
            }

            return true;
          }

          if (
            toggleRequiredByUniqueId(
              schema.properties[key],
              uniqueId,
              fieldName
            )
          ) {
            return true;
          }
        }
      }

      ['allOf', 'oneOf', 'anyOf'].forEach((compositeKey) => {
        if (schema[compositeKey] && Array.isArray(schema[compositeKey])) {
          schema[compositeKey].forEach((subSchema: any) =>
            toggleRequiredByUniqueId(subSchema, uniqueId, fieldName)
          );
        }
      });

      if (schema.additionalProperties) {
        toggleRequiredByUniqueId(
          schema.additionalProperties,
          uniqueId,
          fieldName
        );
      }

      if (schema.items) {
        if (Array.isArray(schema.items)) {
          schema.items.forEach((item: any) =>
            toggleRequiredByUniqueId(item, uniqueId, fieldName)
          );
        } else {
          toggleRequiredByUniqueId(schema.items, uniqueId, fieldName);
        }
      }

      return false;
    };

    const fieldName = rowData.name;
    const isUpdated = toggleRequiredByUniqueId(
      this.selectedSchema,
      rowData.uniqueId,
      fieldName
    );

    if (isUpdated) {
      this.deleteRowEvent.emit();
    }
  }

  onBookClick(event: Event, rowData: any): void {
    this.selectedRowData = rowData;
    this.selectedCol = this.findFieldInSchema(rowData, this.selectedSchema);
    this.childComponentOverlayTextarea?.toggleOverlay(event, this.selectedCol);
  }

  onDeleteClick(rowData: any): void {
    //TODO: Delete also from the req if it is insided
    if (!this.selectedSchema || !rowData || !rowData.uniqueId) {
      console.warn('No schema or invalid row data provided for deletion.');
      return;
    }

    const deleteFieldByUniqueId = (schema: any, uniqueId: string): boolean => {
      if (!schema || typeof schema !== 'object') return false;

      if (schema.properties) {
        for (const key in schema.properties) {
          if (schema.properties[key][`x-${this.nameOfId}`]?.id === uniqueId) {
            delete schema.properties[key];
            return true;
          } else if (deleteFieldByUniqueId(schema.properties[key], uniqueId)) {
            return true;
          }
        }
      }

      ['allOf', 'oneOf', 'anyOf'].forEach((compositeKey) => {
        if (schema[compositeKey] && Array.isArray(schema[compositeKey])) {
          schema[compositeKey] = schema[compositeKey].filter(
            (subSchema: any) => subSchema[`x-${this.nameOfId}`]?.id !== uniqueId
          );
        }
      });

      if (schema.additionalProperties) {
        if (
          schema.additionalProperties[`x-${this.nameOfId}`]?.id === uniqueId
        ) {
          delete schema.additionalProperties;
          return true;
        }
      }

      if (schema.items) {
        if (Array.isArray(schema.items)) {
          schema.items = schema.items.filter(
            (item: any) => item[`x-${this.nameOfId}`]?.id !== uniqueId
          );
        } else if (schema.items[`x-${this.nameOfId}`]?.id === uniqueId) {
          delete schema.items;
          return true;
        }
      }

      return false;
    };

    const deleted = deleteFieldByUniqueId(
      this.selectedSchema,
      rowData.uniqueId
    );

    if (deleted) {
      this.deleteRowEvent.emit();
      this.fetchModelDetails();

      this.toastMessageService.add({
        severity: 'info',
        summary: 'Deleted',
        detail: `Finished processing delete`,
      });

      this.deleteRow.emit(rowData);
    }
  }

  handleAddScheme(_event: Event, rowData: any): void {
    this.selectedCol = this.findFieldInSchema(rowData, this.selectedSchema);

    let addedToSchema = false;
    let isComposite = false;
    let uniqueId = 'no-id';

    if (this.selectedCol) {
      if (rowData.type === 'object' && !this.selectedCol.properties) {
        this.selectedCol.properties = {};
      }

      if (rowData.type === 'array' && !this.selectedCol.items) {
        this.selectedCol.items = {};
      }

      if (
        rowData.type === 'dictionary' &&
        !this.selectedCol.additionalProperties
      ) {
        this.selectedCol.additionalProperties = {};
      }

      const newProperty: Record<string, any> = {
        type: 'string',
        [`x-${this.nameOfId}`]: {
          id: this.generateUniqueId(),
        },
      };

      this.modifyExtensions(newProperty);
      uniqueId = newProperty[`x-${this.nameOfId}`]?.id || 'no-id';

      if (this.selectedCol.properties) {
        const isDuplicate = Object.keys(this.selectedCol.properties).some(
          (key) =>
            this.selectedCol.properties[key][`x-${this.nameOfId}`]?.id ===
            uniqueId
        );

        if (!isDuplicate) {
          this.selectedCol.properties[''] = newProperty;
          addedToSchema = true;
        } else {
          console.warn('Property already exists in .properties. Skipping.');
        }
      }

      ['allOf', 'anyOf', 'oneOf'].forEach((composite) => {
        if (
          this.selectedCol[composite] &&
          Array.isArray(this.selectedCol[composite])
        ) {
          const isDuplicate = this.selectedCol[composite].some(
            (item) => item[`x-${this.nameOfId}`]?.id === uniqueId
          );

          if (!isDuplicate) {
            this.selectedCol[composite].push(newProperty);
            addedToSchema = true;
            isComposite = true;
            this.fetchModelDetails();
          } else {
            console.warn(`Property already exists in ${composite}. Skipping.`);
          }
        }
      });

      if (this.selectedCol.items) {
        const items = Array.isArray(this.selectedCol.items)
          ? this.selectedCol.items
          : [this.selectedCol.items];

        const isDuplicate = items.some(
          (item: Record<string, any>) =>
            item[`x-${this.nameOfId}`]?.id === uniqueId
        );

        if (!isDuplicate) {
          if (Array.isArray(this.selectedCol.items)) {
            this.selectedCol.items.push(newProperty);
          } else if (typeof this.selectedCol.items === 'object') {
            this.selectedCol.items = [this.selectedCol.items, newProperty];
          } else {
            this.selectedCol.items = newProperty;
          }
          addedToSchema = true;
        } else {
          console.warn('Property already exists in .items. Skipping.');
        }
      }

      if (this.selectedCol.additionalProperties) {
        const isDuplicate =
          this.selectedCol.additionalProperties[`x-${this.nameOfId}`]?.id ===
          uniqueId;

        if (!isDuplicate) {
          if (typeof this.selectedCol.additionalProperties === 'object') {
            this.selectedCol.additionalProperties = {
              ...this.selectedCol.additionalProperties,
              ...newProperty,
            };
          } else {
            this.selectedCol.additionalProperties = newProperty;
          }
          addedToSchema = true;
        } else {
          console.warn(
            'Property already exists in .additionalProperties. Skipping.'
          );
        }
      }
    } else {
      console.warn(
        'selectedCol does not have properties or valid structures to add a new field.'
      );
    }

    if (addedToSchema) {
      this.deleteRowEvent.emit();
    } else {
      //TODO: Add toast
      console.warn('No new property added. It already exists in the schema.');
    }

    const newSchemaNode: TreeNode = isComposite
      ? {
          label: 'string',
          data: {
            name: 'string',
            description: '',
            type: 'string',
            showAddButton: false,
            showReferenceButton: false,
            uniqueId: uniqueId,
          },
          children: [],
          expanded: true,
        }
      : {
          label: '',
          data: {
            name: '',
            description: '',
            type: 'string',
            showAddButton: false,
            showReferenceButton: false,
            uniqueId: uniqueId,
          },
          children: [],
          expanded: true,
        };

    const parentNode = this.findParentNode(this.jsonTree, rowData.uniqueId);

    if (parentNode) {
      if (!parentNode.children) {
        parentNode.children = [];
      }

      const nodeAlreadyExists = parentNode.children.some(
        (child) =>
          child.data.uniqueId === newSchemaNode.data.uniqueId ||
          child.data.name === newSchemaNode.data.name
      );

      if (!nodeAlreadyExists) {
        parentNode.children.push(newSchemaNode);
      }
    } else {
      console.warn('Parent node not found. Adding to root level.');

      const nodeAlreadyExistsAtRoot = this.jsonTree.some(
        (node) =>
          node.data.uniqueId === newSchemaNode.data.uniqueId ||
          node.data.name === newSchemaNode.data.name
      );

      if (!nodeAlreadyExistsAtRoot) {
        this.jsonTree.push(newSchemaNode);
      } else {
        console.warn(
          'Node already exists at the root level. Skipping addition.'
        );
      }
    }

    this.jsonTree = [...this.jsonTree];
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

  extractSchemaNameFromRef(ref: string): string {
    const refParts = ref.split('/');
    return refParts[refParts.length - 1];
  }

  findFieldInSchema(
    rowData: any,
    schema: any,
    resolvedRefs: Set<string> = new Set()
  ): any {
    if (!schema || !rowData) {
      return null;
    }
    if (
      rowData.uniqueId &&
      schema[`x-${this.nameOfId}`] &&
      schema[`x-${this.nameOfId}`].id === rowData.uniqueId
    ) {
      return schema;
    }

    if (schema.properties) {
      for (const propertyKey in schema.properties) {
        const property = schema.properties[propertyKey];

        if (this.isRowDataMatching(rowData, property)) {
          return property;
        }

        const nestedField = this.findFieldInSchema(
          rowData,
          property,
          resolvedRefs
        );
        if (nestedField) {
          return nestedField;
        }
      }
    }

    const compositeConstructs = ['allOf', 'anyOf', 'oneOf'];
    for (const construct of compositeConstructs) {
      if (schema[construct] && Array.isArray(schema[construct])) {
        for (const subSchema of schema[construct]) {
          if (this.isRowDataMatching(rowData, subSchema)) {
            return subSchema;
          }

          const field = this.findFieldInSchema(
            rowData,
            subSchema,
            resolvedRefs
          );
          if (field) {
            return field;
          }
        }
      }
    }

    if (schema.additionalProperties) {
      if (this.isRowDataMatching(rowData, schema.additionalProperties)) {
        return schema.additionalProperties;
      }

      const nestedField = this.findFieldInSchema(
        rowData,
        schema.additionalProperties,
        resolvedRefs
      );
      if (nestedField) {
        return nestedField;
      }
    }

    if (schema.type === 'array' && schema.items) {
      if (this.isRowDataMatching(rowData, schema.items)) {
        return schema.items;
      }

      const nestedField = this.findFieldInSchema(
        rowData,
        schema.items,
        resolvedRefs
      );
      if (nestedField) {
        return nestedField;
      }
    }

    if (schema.$ref) {
      const refSchemaName = this.extractSchemaNameFromRef(schema.$ref);

      if (!resolvedRefs.has(refSchemaName)) {
        resolvedRefs.add(refSchemaName);
        const referencedSchema = this.getSchemaByRef(schema.$ref);

        if (!referencedSchema) {
          return null;
        }

        return this.findFieldInSchema(rowData, referencedSchema, resolvedRefs);
      }
    }

    return null;
  }

  getSchemaByRef(ref: string): any {
    const schemaName = this.extractSchemaNameFromRef(ref);
    return this.apiSchemas.find((schema) => schema.name === schemaName)
      ?.details;
  }

  isRowDataMatching(rowData: any, schemaField: any): boolean {
    if (!rowData || !schemaField) {
      console.warn('RowData or SchemaField is undefined or null:', {
        rowData,
        schemaField,
      });
      return false;
    }
    if (
      rowData.uniqueId &&
      schemaField[`x-${this.nameOfId}`] &&
      schemaField[`x-${this.nameOfId}`].id === rowData.uniqueId
    ) {
      return true;
    }

    return false;
  }
}
