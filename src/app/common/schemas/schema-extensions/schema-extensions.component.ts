import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MessageService } from 'primeng/api';
import { TabMenuModule } from 'primeng/tabmenu';
import { InputTextModule } from 'primeng/inputtext';
import { ReactiveFormsModule, FormControl, FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { Clipboard } from '@angular/cdk/clipboard';
import { ToastModule } from 'primeng/toast';
import { RippleModule } from 'primeng/ripple';
import { TranslateModule } from '@ngx-translate/core';
import { ListboxModule } from 'primeng/listbox';
import { FloatLabel } from 'primeng/floatlabel';
import { TooltipModule } from 'primeng/tooltip';
import { TextareaModule } from 'primeng/textarea';

@Component({
  selector: 'app-schema-extensions',
  imports: [
    CommonModule,
    TabMenuModule,
    InputTextModule,
    ReactiveFormsModule,
    ButtonModule,
    ToastModule,
    RippleModule,
    TranslateModule,
    ListboxModule,
    FormsModule,
    FloatLabel,
    TooltipModule,
    TextareaModule,
  ],
  providers: [MessageService],
  templateUrl: './schema-extensions.component.html',
  styleUrl: './schema-extensions.component.css',
})
export class SchemaExtensionsComponent implements OnInit {
  @Input() selectedSchema: any;
  @Input() nameOfId: string | undefined;
  @Output() extensionChanged = new EventEmitter<string>();

  extensions: { label: string; fullKey: string; index: number }[] = [];
  activeItem: { label: string; fullKey: string; index: number } | null = null;
  extensionsControl = new FormControl('');
  currentIndex: number = 0;
  selectedExtensionName: string = '';
  oldExtensionName: string = '';

  constructor(
    private clipboard: Clipboard,
    private toastMessageService: MessageService
  ) {}

  ngOnInit(): void {
    this.initializeExtensions();
  }

  initializeExtensions(): void {
    if (!this.selectedSchema) {
      console.warn('No selected schema found.');
      return;
    }

    const extensionPairs = Object.keys(this.selectedSchema)
      .filter((key) => key.startsWith('x-') && key !== `x-${this.nameOfId}`)
      .map((key) => ({ key, value: this.selectedSchema[key] }));

    this.extensions = extensionPairs.map((extension, index) => ({
      label: `${extension.key.replace(/^x-/, '')}`,
      fullKey: extension.key,
      index: index,
    }));

    if (this.extensions.length > 0) {
      this.activeItem = this.extensions[0];
      this.selectedExtensionName = this.extensions[0].label;
      this.oldExtensionName = this.extensions[0].label;
      this.currentIndex = this.activeItem.index;
      this.setExtensionValue(this.currentIndex);
    }
  }

  onExtensionSelectFromList(): void {
    if (this.activeItem) {
      this.currentIndex = this.activeItem.index;
      this.setExtensionValue(this.currentIndex);
      this.setExtensionName(this.currentIndex);
    }
  }

  setExtensionValue(index: number): void {
    const selectedExtension = this.extensions[index];
    if (selectedExtension) {
      const extensionValue = selectedExtension?.fullKey
        ? this.selectedSchema[selectedExtension.fullKey]
        : undefined;

      let extensionString = '';

      if (typeof extensionValue === 'object' && extensionValue !== null) {
        if (
          Object.keys(extensionValue).length === 1 &&
          'id' in extensionValue
        ) {
          extensionString = `id: '${extensionValue['id']}'`;
        } else {
          extensionString = JSON.stringify(extensionValue, null, 2);
        }
      } else if (typeof extensionValue === 'string') {
        extensionString = extensionValue.trim();
      } else if (extensionValue !== undefined) {
        extensionString = String(extensionValue);
      }

      this.extensionsControl.setValue(extensionString);
      this.extensionChanged.emit(extensionString);
    }
  }

  setExtensionName(index: number): void {
    const selectedExtension = this.extensions[index];
    if (selectedExtension) {
      this.selectedExtensionName = selectedExtension.label;
      this.oldExtensionName = selectedExtension.label; // <<< Store old label
    }
  }
  saveCurrentExtension(): void {
    let newFullKey = '';
    let oldFullKey = '';

    try {
      const updatedValue = this.extensionsControl.value?.trim();

      oldFullKey = this.oldExtensionName.startsWith('x-')
        ? this.oldExtensionName
        : `x-${this.oldExtensionName}`;

      newFullKey = this.selectedExtensionName.startsWith('x-')
        ? this.selectedExtensionName
        : `x-${this.selectedExtensionName}`;

      if (updatedValue !== undefined) {
        if (oldFullKey !== newFullKey) {
          delete this.selectedSchema[oldFullKey];
        }
        this.selectedSchema[newFullKey] = updatedValue;
      } else {
        console.log('No value to save');
      }
    } catch (error) {
      console.error('Error while saving extension:', error);
    }

    console.log('Schema after save:', { ...this.selectedSchema });

    this.initializeExtensions();

    const updatedItem = this.extensions.find(
      (item) => `x-${item.label}` === newFullKey
    );

    if (updatedItem) {
      this.activeItem = updatedItem;
      this.currentIndex = updatedItem.index;
      this.setExtensionValue(this.currentIndex);
      this.setExtensionName(this.currentIndex);
      this.oldExtensionName = this.selectedExtensionName; // Update old name
    } else {
      console.warn('Could not find updated extension.');
    }
  }

  generateAndAddExtension(): void {
    if (!this.selectedSchema) {
      console.error('No schema selected to add an extension.');
      return;
    }

    const extensionKey = `x-custom-extension-${Date.now()}`;

    this.selectedSchema[extensionKey] = 'Example';

    this.extensionChanged.emit(this.selectedSchema);
    this.initializeExtensions();

    this.currentIndex = this.extensions.findIndex(
      (item) => item.label === extensionKey
    );

    if (this.currentIndex !== -1) {
      this.activeItem = this.extensions[this.currentIndex];
      this.setExtensionValue(this.currentIndex);
    }
  }

  copyExample(): void {
    const extensionText = this.extensionsControl.value;
    if (extensionText) {
      this.clipboard.copy(extensionText);
      this.toastMessageService.add({
        severity: 'info',
        summary: 'Copied',
        detail: 'Extension copied to clipboard',
      });
    }
  }

  deleteExtension(): void {
    if (!this.selectedSchema || this.currentIndex === -1) {
      console.warn('No schema or extension selected for deletion.');
      return;
    }

    const selectedExtensionKey = this.extensions[this.currentIndex]?.fullKey;

    if (selectedExtensionKey && selectedExtensionKey in this.selectedSchema) {
      delete this.selectedSchema[selectedExtensionKey];

      this.extensionChanged.emit(this.selectedSchema);
      this.initializeExtensions();

      if (this.extensions.length > 0) {
        this.currentIndex = 0;
        this.activeItem = this.extensions[0];
        this.setExtensionValue(this.currentIndex);
      } else {
        this.currentIndex = -1;
        this.activeItem = null;
        this.extensionsControl.setValue('');
      }
    } else {
      console.warn('Selected extension key not found in the schema.');
    }
  }
}
