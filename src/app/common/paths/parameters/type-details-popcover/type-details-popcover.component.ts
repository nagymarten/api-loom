import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { Popover, PopoverModule } from 'primeng/popover';
import { ChipModule } from 'primeng/chip';
import { InputSwitchModule } from 'primeng/inputswitch';
import { TranslateModule } from '@ngx-translate/core';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';

interface FormatOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-type-details-popcover',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    PopoverModule,
    SelectModule,
    ChipModule,
    InputSwitchModule,
    TranslateModule,
    FormsModule,
    InputTextModule,
  ],
  templateUrl: './type-details-popcover.component.html',
  styleUrl: './type-details-popcover.component.css',
})
export class TypeDetailsPopcoverComponent {
  @Input() contentType: any;
  @Input() param: any;
  @Input() specVersion: any;

  @ViewChild('op') op!: Popover;

  @Output() paramUpdateOnClose = new EventEmitter<any>();

  styles = [
    { label: 'None', value: 'none' },
    { label: 'Form', value: 'form' },
    { label: 'Simple', value: 'simple' },
  ];

  formatOptionsNumbers: FormatOption[] = [
    { label: 'none', value: 'none' },
    { label: 'float', value: 'float' },
    { label: 'double', value: 'double' },
  ];

  formatOptionsGeneral: FormatOption[] = [
    { label: 'none', value: 'none' },
    { label: 'date-time', value: 'date-time' },
    { label: 'email', value: 'email' },
    { label: 'uuid', value: 'uuid' },
  ];

  formatOptions: FormatOption[] = [];

  format: FormatOption = { label: 'none', value: 'none' };
  enumValues: string[] = [];
  newEnum: string = '';
  defaultValue: string = '';
  example: string = '';
  uniqueItems: boolean = false;
  deprecated: boolean = false;
  allowEmptyValue: boolean = false;
  allowReserved: boolean = false;
  minItems: number | null = null;
  maxItems: number | null = null;
  minLength: number | null = null;
  maxLength: number | null = null;
  explode: boolean = false;
  pattern: string = '';
  excusiveMinimum: boolean = false;
  content: any;
  style: string = '';
  minimum: number | null = null;
  exclusiveMinimum: boolean = false;
  maximum: number | null = null;
  exclusiveMaximum: boolean = false;
  multipleOf: number | null = null;

  ngOnInit(): void {
    this.setFormatOptions();

    const target = this.isV2 ? this.param : this.param?.schema || {};

    this.deprecated = this.hasAnyDeprecated(target);
    this.example = target.example || '';
    this.multipleOf = target.multipleOf ?? null;
    this.pattern = target.pattern || '';
    this.minLength = target.minLength ?? null;
    this.maxLength = target.maxLength ?? null;

    if (!this.isV2) {
      this.style = target.style || '';
    }

    this.defaultValue = target.default ?? '';
    this.format = this.formatOptions.find((opt) => opt.value === 'none')!;
    this.enumValues = Array.isArray(target.enum) ? [...target.enum] : [];

    this.uniqueItems = !!target.uniqueItems;
    this.allowEmptyValue = !!target.allowEmptyValue;
    this.allowReserved = !!target.allowReserved;
    this.explode = !!target.explode;

    this.minItems = target.minItems ?? null;
    this.maxItems = target.maxItems ?? null;

    if (typeof target.exclusiveMinimum === 'number') {
      this.minimum = target.exclusiveMinimum;
      this.exclusiveMinimum = true;
    } else {
      this.exclusiveMinimum = !!target.exclusiveMinimum;
      this.minimum = target.minimum ?? null;
    }

    if (typeof target.exclusiveMaximum === 'number') {
      this.maximum = target.exclusiveMaximum;
      this.exclusiveMaximum = true;
    } else {
      this.exclusiveMaximum = !!target.exclusiveMaximum;
      this.maximum = target.maximum ?? null;
    }
  }

  get effectiveType(): string | undefined {
    return this.specVersion === '2.0'
      ? this.param?.type
      : this.param?.schema?.type;
  }

  get isV2(): boolean {
    return this.specVersion === '2.0';
  }

  get isNumeric(): boolean {
    return this.effectiveType === 'number' || this.effectiveType === 'integer';
  }

  get isArray(): boolean {
    return this.effectiveType === 'array';
  }

  get isString(): boolean {
    return this.effectiveType === 'string';
  }

  get target(): any {
    return this.isV2 ? this.param : (this.param.schema ||= {});
  }

  get isBoolean(): boolean {
    return this.effectiveType === 'boolean';
  }

  get isAny(): boolean {
    return this.effectiveType === 'any';
  }

  hasAnyDeprecated(obj: any): boolean {
    if (!obj) return false;

    return Object.keys(obj).some(
      (key) => key.toLowerCase().endsWith('deprecated') && !!obj[key]
    );
  }

  onDeprecatedToggle(): void {
    this.target.deprecated = this.deprecated;
  }

  onExplodeToggle(): void {
    this.target.explode = this.explode;
  }

  onUniqueItemsToggle(): void {
    this.target.uniqueItems = this.uniqueItems;
  }

  onAllowEmptyValueToggle(): void {
    this.target.allowEmptyValue = this.allowEmptyValue;
  }

  onAllowReservedToggle(): void {
    this.target.allowReserved = this.allowReserved;
  }

  onFormatChange(): void {
    this.target.format = this.format?.value;
  }

  onMinItemsChange(): void {
    this.target.minItems = this.minItems;
  }

  onMaxItemsChange(): void {
    this.target.maxItems = this.maxItems;
  }

  setFormatOptions(): void {
    if (this.isV2) {
      this.content = this.param;
      this.defaultValue = this.param?.default || '';
    } else {
      this.content = this.param?.schema;
      this.defaultValue = this.param?.schema?.default || '';
    }

    if (this.content?.type === 'number' || this.content?.type === 'integer') {
      this.formatOptions = this.formatOptionsNumbers;
    } else {
      this.formatOptions = this.formatOptionsGeneral;
    }

    //TODO: add other formats

    this.format = this.formatOptions.find((opt) => opt.value === 'none')!;
  }

  openPopover(event: Event) {
    this.op.toggle(event);

    this.op.onHide.subscribe(() => {
      if (this.isV2) {
        Object.assign(this.param, this.content);
      } else {
        this.param.schema = { ...this.content };
      }
      this.paramUpdateOnClose.emit(this.param);
    });
  }

  addEnum(): void {
    const trimmedValue = this.newEnum.trim();
    if (trimmedValue && !this.enumValues.includes(trimmedValue)) {
      this.enumValues.push(trimmedValue);
      this.updateEnum();
    }
    this.newEnum = '';
  }

  onDefaultChange(): void {
    this.target.default = this.defaultValue;
  }

  onStyleChange(): void {
    this.target.style = this.style;
  }

  onExampleChange(): void {
    this.target.example = this.example;
  }
  onPatternChange(): void {
    this.target.pattern = this.pattern;
  }

  onMinLengthChange(): void {
    this.target.minLength = this.minLength;
  }

  onMaxLengthChange(): void {
    this.target.maxLength = this.maxLength;
  }

  onMinimumChange(): void {
    this.target.minimum = this.minimum;
  }

  onMaximumChange(): void {
    this.target.maximum = this.maximum;
  }

  onExclusiveMinimumToggle(): void {
    this.target.exclusiveMinimum = this.exclusiveMinimum;
  }

  onExclusiveMaximumToggle(): void {
    this.target.exclusiveMaximum = this.exclusiveMaximum;
  }

  onMultipleOfChange(): void {
    this.target.multipleOf = this.multipleOf;
  }

  removeEnum(index: number): void {
    this.enumValues.splice(index, 1);
    this.updateEnum();
  }

  updateEnum(): void {
    this.target.enum = [...this.enumValues];
  }
}
