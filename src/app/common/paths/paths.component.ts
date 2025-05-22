import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiDataService } from '../../services/api-data.service';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { Subscription } from 'rxjs';
import { RouterModule } from '@angular/router';
import { PathRequestPageComponent } from './path-request-page/path-request-page.component';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ParametersComponent } from './parameters/parameters.component';
import { TabsModule } from 'primeng/tabs';
import { ButtonModule } from 'primeng/button';
import { ResponsesComponent } from './responses/responses.component';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabelModule } from 'primeng/floatlabel';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
  selector: 'paths',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    PathRequestPageComponent,
    TranslateModule,
    ToastModule,
    ParametersComponent,
    TabsModule,
    ButtonModule,
    ResponsesComponent,
    InputTextModule,
    FloatLabelModule,
    CommonModule,
    FormsModule,
    ConfirmDialogModule,
  ],
  templateUrl: './paths.component.html',
  styleUrls: ['./paths.component.css'],
  providers: [MessageService, ConfirmationService],
})
export class PathsComponent implements OnInit, OnDestroy {
  apiPath: string = '';
  method: string = '';
  responses: any;
  methodDetailsForm!: FormGroup;
  swaggerSubscription!: Subscription;
  activeTab: string = 'general';
  activeResponseCode: number = 200;
  responsesArray: any[] = [];
  showDeleteButtons: boolean = false;
  hoveredResponseCode: string | null = null;
  parameters: any;
  selectedLanguage = 'en';
  specsVersion: '2.0' | '3.0' | '3.1.0' | '3.0.0' = '2.0';
  private lastApiPath: string | null = null;
  private lastMethod: string | null = null;
  operationId: string = '';
  summary: string = '';
  description: string = '';
  selectedMethod: any = null;

  private translate = inject(TranslateService);
  private apiDataService = inject(ApiDataService);
  private route = inject(ActivatedRoute);
  private messageService = inject(MessageService);

  constructor(private fb: FormBuilder) {
    const savedLang = localStorage.getItem('language') || 'en';
    this.selectedLanguage = savedLang;
    this.translate.setDefaultLang(savedLang);
    this.translate.use(savedLang);
  }

  ngOnInit(): void {
    this.methodDetailsForm = this.fb.group({
      summary: [''],
      description: [''],
      requestBody: [''],
      responseMessage: [''],
      headers: [''],
      responseBody: [''],
    });
    this.route.paramMap.subscribe((params) => {
      const newApiPath = params.get('path');
      const newMethod = params.get('method');

      const hasChanged =
        this.lastApiPath !== newApiPath || this.lastMethod !== newMethod;

      if (hasChanged) {
        this.apiPath = newApiPath || '';
        this.method = newMethod || '';

        this.lastApiPath = newApiPath;
        this.lastMethod = newMethod;
        this.fetchMethodDetails();
      }
    });
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  tabIndexMap: { [key: string]: number } = {
    general: 0,
    parameters: 1,
    request: 2,
    responses: 3,
  };

  fetchMethodDetails(): void {
    const swaggerSpec = this.apiDataService.getSelectedSwaggerSpecValue();

    if (!swaggerSpec || !swaggerSpec.paths) {
      console.error('No Swagger spec or paths found.');
      return;
    }

    if (!swaggerSpec.openapi) {
      this.specsVersion = swaggerSpec.swagger;
    } else {
      this.specsVersion = swaggerSpec.openapi;
    }

    const apiPathObject = swaggerSpec.paths[this.apiPath];

    if (!apiPathObject) {
      return;
    }

    const methodDetails = apiPathObject[this.method.toLowerCase()];

    if (!methodDetails) {
      return;
    }
    this.selectedMethod = methodDetails;
    this.summary = methodDetails.summary || '';
    this.operationId = methodDetails.operationId || '';
    this.description = methodDetails.description || '';
    this.responses = methodDetails.responses || {};
    this.parameters = methodDetails.parameters || [];

    this.methodDetailsForm.patchValue({
      summary: methodDetails.summary || '',
      description: methodDetails.description || '',
      requestBody: methodDetails.requestBody
        ? JSON.stringify(methodDetails.requestBody, null, 2)
        : '',
    });
    this.setActiveTab('general');
  }

  setResponseData(statusCode: string): void {
    this.activeResponseCode = parseInt(statusCode, 10);
    const response = this.responsesArray.find((r) => r.code === statusCode);

    if (response) {
      this.translate
        .get('PATHS.MESSAGES.NO_HEADERS_DEFINED')
        .subscribe((translatedNoHeaders) => {
          this.methodDetailsForm.patchValue({
            responseMessage: response.description,
            headers: response.headers
              ? JSON.stringify(response.headers, null, 2)
              : translatedNoHeaders,
            responseBody: response.bodySchema,
          });
        });
    }
  }

  async onUpdatePath(): Promise<void> {
    try {
      const swaggerSpec = await this.apiDataService
        .getSelectedSwaggerSpec()
        .toPromise();

      if (!swaggerSpec || !swaggerSpec.paths) {
        console.error('No Swagger spec or paths found.');
        return;
      }

      if (!swaggerSpec.paths[this.apiPath]) {
        const translatedWarnPath = await this.translate
          .get('PATHS.WARNINGS.API_PATH_NOT_FOUND', { apiPath: this.apiPath })
          .toPromise();

        this.messageService.add({
          severity: 'warn',
          summary: await this.translate
            .get('PATHS.WARNINGS.PATH_WARNING_TITLE')
            .toPromise(),
          detail: translatedWarnPath,
          life: 3000,
        });

        swaggerSpec.paths[this.apiPath] = {};
      }

      const apiPathObject = swaggerSpec.paths[this.apiPath];

      if (!apiPathObject[this.method.toLowerCase()]) {
        const translatedWarnMethod = await this.translate
          .get('PATHS.WARNINGS.METHOD_NOT_FOUND', { method: this.method })
          .toPromise();

        this.messageService.add({
          severity: 'warn',
          summary: await this.translate
            .get('PATHS.WARNINGS.METHOD_WARNING_TITLE')
            .toPromise(),
          detail: translatedWarnMethod,
          life: 3000,
        });

        apiPathObject[this.method.toLowerCase()] = {
          summary: '',
          description: '',
          requestBody: {},
          responses: {},
        };
      }

      const methodDetails = apiPathObject[this.method.toLowerCase()];

      if (methodDetails) {
        const formData = this.methodDetailsForm.value;

        // Update method details with form data
        methodDetails.summary = formData.summary || methodDetails.summary;
        methodDetails.description =
          formData.description || methodDetails.description;

        if (formData.requestBody && this.isValidJson(formData.requestBody)) {
          methodDetails.requestBody = JSON.parse(formData.requestBody);
        }

        if (this.activeResponseCode) {
          const responseToUpdate =
            methodDetails.responses[this.activeResponseCode];

          if (responseToUpdate && !('$ref' in responseToUpdate)) {
            responseToUpdate.description =
              formData.responseMessage || responseToUpdate.description;
            responseToUpdate.headers =
              formData.headers && this.isValidJson(formData.headers)
                ? JSON.parse(formData.headers)
                : responseToUpdate.headers;
            responseToUpdate.content = {
              'application/json': {
                schema:
                  formData.responseBody &&
                  this.isValidJson(formData.responseBody)
                    ? JSON.parse(formData.responseBody)
                    : responseToUpdate.content?.['application/json']?.schema,
              },
            };
          }
        }

        swaggerSpec.paths[this.apiPath][this.method.toLowerCase()] =
          methodDetails;

        this.messageService.add({
          severity: 'success',
          summary: await this.translate
            .get('PATHS.WARNINGS.PATH_UPDATED_TITLE')
            .toPromise(),
          detail: await this.translate
            .get('PATHS.WARNINGS.PATH_UPDATED', { apiPath: this.apiPath })
            .toPromise(),
          life: 3000,
        });
      } else {
        console.error(`Error updating path: ${this.apiPath}`);
      }
    } catch (error) {
      console.error('Error updating API path:', error);
    }
  }

  onPathFieldBlur(
    event: Event,
    field: 'summary' | 'operationId' | 'description'
  ): void {
    const target = event.target as HTMLInputElement;
    const value = target.value;
    this.selectedMethod[field] = value;

    if (field === 'description') {
      this.onSchemaPathNameUpdated(this.selectedMethod);
    }

    const toastKeyMap: Record<typeof field, string> = {
      summary: 'SCHEMAS.TOAST.SUMMARY_UPDATED',
      operationId: 'SCHEMAS.TOAST.OPERATIONID_UPDATED',
      description: 'SCHEMAS.TOAST.DESCRIPTION_UPDATED',
    };

    this.messageService.add({
      severity: 'success',
      summary: this.translate.instant(toastKeyMap[field]),
      detail: '',
    });
  }

  onSchemaPathNameUpdated(_updatedModelName: any): void {
    const swaggerSpec = this.apiDataService.getSelectedSwaggerSpecValue();
    if (swaggerSpec?.components?.schemas) {
      swaggerSpec.paths[this.apiPath][this.method.toLowerCase()] =
        this.selectedMethod;

      this.apiDataService.updateSwaggerSpec(swaggerSpec);

      console.log(
        'Updated Swagger spec with new schema path name:',
        swaggerSpec
      );

      this.apiDataService.saveSwaggerSpecToStorage(swaggerSpec);
    }
  }

  handleParametersChange(updatedParameters: any[]): void {
    this.saveParameters(updatedParameters);
  }

  saveParameters(updatedParameters: any[]): void {
    const swaggerSpec = this.apiDataService.getSelectedSwaggerSpecValue();

    if (!swaggerSpec || !swaggerSpec.paths) {
      console.error('No Swagger spec or paths found.');
      return;
    }

    const apiPathObject = swaggerSpec.paths[this.apiPath];
    if (!apiPathObject) {
      console.error(`API path '${this.apiPath}' not found.`);
      return;
    }

    const methodDetails = apiPathObject[this.method.toLowerCase()];
    if (!methodDetails) {
      console.error(`HTTP method '${this.method}' not found for this path.`);
      return;
    }

    methodDetails.parameters = updatedParameters;

    this.apiDataService.updateSwaggerSpec(swaggerSpec);
    this.apiDataService.saveSwaggerSpecToStorage(swaggerSpec);
  }

  handleResponsesChange(updatedResponses: { [status: string]: any }): void {
    const swaggerSpec = this.apiDataService.getSelectedSwaggerSpecValue();

    if (!swaggerSpec || !swaggerSpec.paths) {
      console.error('❌ No Swagger spec or paths found.');
      return;
    }

    const apiPathObject = swaggerSpec.paths[this.apiPath];
    if (!apiPathObject) {
      console.error(`❌ API path '${this.apiPath}' not found.`);
      return;
    }

    const methodDetails = apiPathObject[this.method.toLowerCase()];
    if (!methodDetails) {
      console.error(`❌ HTTP method '${this.method}' not found for this path.`);
      return;
    }

    methodDetails.responses = updatedResponses;

    this.apiDataService.updateSwaggerSpec(swaggerSpec);
    this.apiDataService.saveSwaggerSpecToStorage(swaggerSpec);
  }

  toggleDeleteResponses(): void {
    this.showDeleteButtons = !this.showDeleteButtons;
  }

  private isValidJson(jsonString: string): boolean {
    try {
      JSON.parse(jsonString);
      return true;
    } catch (e) {
      return false;
    }
  }

  ngOnDestroy(): void {
    if (this.swaggerSubscription) {
      this.swaggerSubscription.unsubscribe();
    }
  }
}
