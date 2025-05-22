import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MessageService } from 'primeng/api';
import { TabMenuModule } from 'primeng/tabmenu';
import { TextareaModule } from 'primeng/textarea';
import { ReactiveFormsModule, FormControl, FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { Clipboard } from '@angular/cdk/clipboard';
import { ToastModule } from 'primeng/toast';
import { RippleModule } from 'primeng/ripple';
import { TranslateModule } from '@ngx-translate/core';
import { TabsModule } from 'primeng/tabs';
import { ListboxModule } from 'primeng/listbox';
import { TooltipModule } from 'primeng/tooltip';
import { FloatLabelModule } from 'primeng/floatlabel';

@Component({
  selector: 'app-schema-examples',
  imports: [
    CommonModule,
    TabMenuModule,
    TextareaModule,
    ReactiveFormsModule,
    ButtonModule,
    ToastModule,
    RippleModule,
    TranslateModule,
    TabsModule,
    ListboxModule,
    FormsModule,
    TooltipModule,
    FloatLabelModule
  ],
  templateUrl: './schema-examples.component.html',
  styleUrls: ['./schema-examples.component.css'],
  providers: [MessageService],
})
export class SchemaExamplesComponent implements OnInit {
  @Input() selectedSchema: any;
  @Output() exampleChanged = new EventEmitter<string>();

  responseExamples: { label: string; index: number }[] = [];
  activeItem: { label: string; index: number } | null = null;
  examplesControl = new FormControl('');
  currentIndex: number = 0;
  selectedExample: any = null;
  selectedExamples: any[] = [];


  constructor(
    private clipboard: Clipboard,
    private toastMessageService: MessageService
  ) {}

  ngOnInit(): void {
    this.initializeExamples();
  }

  generateExampleFromSchema(schema: any): any {
    if (!schema || typeof schema !== 'object') return null;

    switch (schema.type) {
      case 'string':
        return schema.example || schema.default || 'string_example';
      case 'number':
        return schema.example || schema.default || 0;
      case 'integer':
        return schema.example || schema.default || 0;
      case 'boolean':
        return schema.example || schema.default || true;
      case 'array':
        if (schema.items) {
          return [this.generateExampleFromSchema(schema.items)];
        }
        return [];
      //TODO: Make it right
      case 'dictonary':
        if (schema.items) {
          return [this.generateExampleFromSchema(schema.items)];
        }
        return [];
      case 'object':
        const exampleObject: { [key: string]: any } = {};
        if (schema.properties) {
          for (const key in schema.properties) {
            if (schema.properties.hasOwnProperty(key)) {
              exampleObject[key] = this.generateExampleFromSchema(
                schema.properties[key]
              );
            }
          }
        }
        return exampleObject;
      case 'null':
        return null;
      default:
        return 'unknown_type';
    }
  }

  initializeExamples(): void {
    if (
      !this.selectedSchema?.examples ||
      this.selectedSchema.examples.length === 0
    ) {
      const defaultExample = this.generateExampleFromSchema(
        this.selectedSchema
      );
      this.selectedSchema.examples = [defaultExample];
    }

    this.responseExamples = this.selectedSchema.examples.map(
      (_example: any, index: number) => ({
        label: `Example ${index + 1}`,
        index: index,
      })
    );

    this.activeItem = this.responseExamples[0];
    this.currentIndex = 0;
    this.setExampleValue(this.currentIndex);
  }

  onExampleSelectFromList(): void {
    this.saveCurrentExample();
    if (this.activeItem) {
      this.currentIndex = this.activeItem.index;
      this.setExampleValue(this.currentIndex);
    }
  }

  onExampleSelect(index: number): void {
    this.saveCurrentExample();
    this.currentIndex = index;
    this.setExampleValue(index);
  }

  setExampleValue(index: number): void {
    const exampleData = this.selectedSchema.examples[index];
    if (exampleData) {
      const exampleJSON = JSON.stringify(exampleData, null, 2);
      this.examplesControl.setValue(exampleJSON);
      this.exampleChanged.emit(exampleJSON);
    }
  }

  saveCurrentExample(event?: any): void {
    try {
      let newValue: any;

      if (event && event.target && event.target.value !== undefined) {
        newValue = event.target.value;
      } else if (event && event.value !== undefined) {
        newValue = event.value;
      } else {
        newValue = this.examplesControl.value; 
      }

      const updatedExample = JSON.parse(newValue || '{}');
      this.selectedSchema.examples[this.currentIndex] = updatedExample;
    } catch (error) {
      console.error('Invalid JSON format:', error);
    }
  }

  generateAndAddExample(): void {
    const newExample = this.generateExampleFromSchema(this.selectedSchema);
    this.selectedSchema.examples.push(newExample);

    this.initializeExamples();

    this.currentIndex = this.responseExamples.length - 1;
    this.activeItem = this.responseExamples[this.currentIndex];
    this.setExampleValue(this.currentIndex);
  }

  copyExample(): void {
    const exampleText = this.examplesControl.value;
    if (exampleText) {
      this.clipboard.copy(exampleText);
      this.toastMessageService.add({
        severity: 'info',
        summary: 'Copied',
        detail: 'Example copied to clipboard',
      });
    }
  }

  deleteExample(): void {
    if (this.selectedSchema.examples.length > 0) {
      this.selectedSchema.examples.splice(this.currentIndex, 1);

      if (this.selectedSchema.examples.length === 0) {
        this.responseExamples = [];
        this.examplesControl.setValue('');
        this.activeItem = null;
        this.currentIndex = -1;
      } else {
        this.initializeExamples();
        this.currentIndex = Math.min(
          this.currentIndex,
          this.selectedSchema.examples.length - 1
        );
        this.activeItem = this.responseExamples[this.currentIndex];
        this.setExampleValue(this.currentIndex);
      }
    } else {
      console.warn('No examples to delete.');
    }
  }
}
