import {
  Component,
  EventEmitter,
  Input,
  Output,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DividerModule } from 'primeng/divider';
import { TranslateModule } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { MatIconModule } from '@angular/material/icon';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';
import { TypeDetailsPopcoverComponent } from './type-details-popcover/type-details-popcover.component';
import { FloatLabelModule } from 'primeng/floatlabel';
@Component({
  selector: 'app-parameters',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DividerModule,
    TranslateModule,
    ToastModule,
    MatIconModule,
    ButtonModule,
    MessageModule,
    InputTextModule,
    SelectModule,
    TooltipModule,
    TypeDetailsPopcoverComponent,
    FloatLabelModule,
  ],
  templateUrl: './parameters.component.html',
  styleUrl: './parameters.component.css',
  providers: [MessageService],
})
export class ParametersComponent {
  @Input() specVersion: '2.0' | '3.0' | '3.1.0' | '3.0.0' = '2.0';
  @Input()
  set parameters(value: any[]) {
    if (value) {
      this._parameters = value;
      this.fetchParameters(value);
    }
  }

  get parameters(): any[] {
    return this._parameters;
  }
  @Output() parametersChange = new EventEmitter<any[]>();

  @ViewChildren(TypeDetailsPopcoverComponent)
  childComponents!: QueryList<TypeDetailsPopcoverComponent>;

  headers: any;
  name: any;
  types: any;
  selectedType: any;
  description: any;
  headerParams: any[] = [];
  queryParams: any[] = [];
  pathParams: any[] = [];
  cookieParams: any[] = [];
  paramType: string = '';
  private debounceTimer: any;
  private _parameters: any[] = [];

  constructor() {}

  ngOnInit(): void {
    this.types = [
      { name: 'any' },
      { name: 'string' },
      { name: 'number' },
      { name: 'integer' },
      { name: 'boolean' },
      { name: 'array' },
    ];

    this.fetchParameters(this.parameters);
  }

  fetchParameters(parameters: any[]) {
    this.headerParams = [];
    this.queryParams = [];
    this.pathParams = [];
    this.cookieParams = [];

    parameters.forEach((param) => {
      switch (param.in) {
        case 'header':
          this.headerParams.push(param);
          break;
        case 'query':
          this.queryParams.push(param);
          break;
        case 'path':
          this.pathParams.push(param);
          break;
        case 'cookie':
          if (this.specVersion !== '2.0') {
            this.cookieParams.push(param);
          }
          break;
      }
    });
  }

  debouncedEmitUpdate(delay = 300) {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.emitParametersUpdate();
    }, delay);
  }

  emitParametersUpdate() {
    const merged = [
      ...this.headerParams,
      ...this.queryParams,
      ...this.pathParams,
      ...this.cookieParams,
    ];
    this.parametersChange.emit(merged);
  }

  onPopoverClosed(
    updatedParam: any,
    index: number,
    type: 'header' | 'query' | 'cookie'
  ): void {
    switch (type) {
      case 'header':
        this.headerParams[index] = updatedParam;
        break;
      case 'query':
        this.queryParams[index] = updatedParam;
        break;
      case 'cookie':
        this.cookieParams[index] = updatedParam;
        break;
    }

    this.debouncedEmitUpdate();
  }

  toggleChildOverlay(
    event: Event,
    popover: TypeDetailsPopcoverComponent
  ): void {
    popover.openPopover(event);
  }

  remove(param: any): void {
    const paramsMap = {
      header: this.headerParams,
      query: this.queryParams,
      path: this.pathParams,
      cookie: this.cookieParams,
    };

    const paramsArray =
      paramsMap[param.in as 'header' | 'query' | 'path' | 'cookie'];
    if (!paramsArray) {
      console.error('Unknown parameter type:', param.in);
      return;
    }

    const index = paramsArray.indexOf(param);
    if (index > -1) {
      paramsArray.splice(index, 1);
    }
    this.emitParametersUpdate();
  }

  addParameter(paramType: 'header' | 'query' | 'path' | 'cookie'): void {
    const newParam =
      this.specVersion === '2.0'
        ? {
            name: '',
            in: paramType,
            description: '',
            required: false,
            type: 'string',
          }
        : {
            name: '',
            in: paramType,
            description: '',
            required: false,
            schema: { type: 'string' },
          };

    switch (paramType) {
      case 'header':
        this.headerParams.push(newParam);
        break;
      case 'query':
        this.queryParams.push(newParam);
        break;
      case 'path':
        this.pathParams.push(newParam);
        break;
      case 'cookie':
        this.cookieParams.push(newParam);
        break;
      default:
        console.error('Unknown parameter type:', paramType);
    }

    this.emitParametersUpdate();
  }

  requiredToggle(param: any) {
    param.required = !param.required;
    this.emitParametersUpdate();
  }
}
