import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable, tap } from 'rxjs';
import * as Swagger from 'swagger-schema-official';
import { RawJsonService } from '@ingenimind/apiloom-api-client';
import Keycloak from 'keycloak-js';

interface SwaggerSpecEntry {
  id: string;
  referenceName: string;
  spec: ExtendedSwaggerSpec;
}

interface ExtendedSwaggerSpec extends Swagger.Spec {
  openapi?: string;
  servers?: Array<{ url: string; description?: string }>;
  components?: {
    responses?: { [responseName: string]: Response };
  };
}

@Injectable({
  providedIn: 'root',
})
export class ApiDataService {
  private keycloak = inject(Keycloak);
  private jsonApiService = inject(RawJsonService);

  private swaggerSpecSubject = new BehaviorSubject<ExtendedSwaggerSpec | null>(
    this.getSwaggerSpecFromStorage()
  );
  swaggerSpec$: Observable<ExtendedSwaggerSpec | null> =
    this.swaggerSpecSubject.asObservable();

  private swaggerSpecs: { [key: string]: any } = {};
  private selectedSwaggerSpecSubject = new BehaviorSubject<any | null>(null);

  selectedSwaggerSpec$ = this.selectedSwaggerSpecSubject.asObservable();

  private selectedSwaggerKey: string | null =
    localStorage.getItem('selectedSwaggerKey') || null;

  private id: string = '';
  private allSwaggerSpecsApi: { [key: string]: SwaggerSpecEntry } = {};
  private isInIndex = new BehaviorSubject<boolean>(true);
  isInIndex$ = this.isInIndex.asObservable();

  constructor() {
    this.swaggerSpecs = this.getAllSwaggerSpecs();

    if (this.selectedSwaggerKey) {
      this.setSelectedSwaggerSpec(this.selectedSwaggerKey);
    }

    this.id = this.keycloak.tokenParsed?.sub || '';
  }

  getSelectedSwaggerKey(): string | null {
    return this.selectedSwaggerKey;
  }

  updateSetInIndex(newValue: boolean) {
    this.isInIndex.next(newValue);
  }

  setSelectedSwaggerSpec(key: string): void {
    this.clearCurrentSpec();

    let newSpec = this.swaggerSpecs[key] || { paths: {} };
    if (newSpec) {
      this.selectedSwaggerSpecSubject.next(newSpec);
      this.selectedSwaggerKey = key;
      localStorage.setItem('selectedSwaggerKey', key);
    } else {
      console.warn(`No spec found for key: ${key}`);
    }
  }

  clearSelectedSwaggerSpec(): void {
    localStorage.removeItem('selectedSwaggerKey');
  }

  getSelectedSwaggerSpec(): Observable<any | null> {
    return this.selectedSwaggerSpec$;
  }

  getSelectedSwaggerSpecValue(): any | null {
    return this.selectedSwaggerSpecSubject.value;
  }

  getSwaggerSpecByKey(key: string): ExtendedSwaggerSpec | null {
    const allSpecs = this.getAllSwaggerSpecs();
    return allSpecs[key] || null;
  }

  getSwaggerSpecIdByKeyFromApi(key: string): string | null {
    const allSpecs = this.allSwaggerSpecsApi;
    return allSpecs[key] ? allSpecs[key].id : null;
  }

  getAllSwaggerSpecs(): { [key: string]: ExtendedSwaggerSpec } {
    const swaggerSpecs = localStorage.getItem('swaggerSpecs');
    if (!swaggerSpecs) return {};

    try {
      return JSON.parse(swaggerSpecs);
    } catch (error) {
      console.error('Error parsing stored Swagger specs:', error);
      return {};
    }
  }

  deleteSwaggerSpecFromStorage(key: string): void {
    const allSpecs = this.getAllSwaggerSpecs();

    if (allSpecs[key]) {
      delete allSpecs[key];
      localStorage.setItem('swaggerSpecs', JSON.stringify(allSpecs));

      this.swaggerSpecs = allSpecs;
    } else {
      console.warn(`Swagger spec with key '${key}' not found.`);
    }
  }

  updateSwaggerSpec(updatedSwaggerSpec: ExtendedSwaggerSpec): void {
    const key = this.selectedSwaggerKey;

    if (!key) {
      console.warn('No selected Swagger key found. Cannot update spec.');
      return;
    }

    const currentSpec = this.swaggerSpecs[key];
    if (currentSpec) {
      this.deleteSwaggerSpecFromStorage(key);
    }

    this.storeSwaggerSpec(key, updatedSwaggerSpec);

    this.setSelectedSwaggerSpec(key);
  }

  getSwaggerSpec(): Observable<ExtendedSwaggerSpec | null> {
    return this.swaggerSpec$;
  }

  saveSwaggerSpecToStorage(swaggerSpec: ExtendedSwaggerSpec): void {
    localStorage.setItem('swaggerSpec', JSON.stringify(swaggerSpec));
  }

  getSwaggerSpecFromStorage(): ExtendedSwaggerSpec | null {
    const swaggerSpecString = localStorage.getItem('swaggerSpec');

    if (swaggerSpecString) {
      try {
        return JSON.parse(swaggerSpecString) as ExtendedSwaggerSpec;
      } catch (error) {
        console.error('Error parsing stored Swagger spec:', error);
        return null;
      }
    }
    return null;
  }

  storeSwaggerSpec(key: string, swaggerSpec: ExtendedSwaggerSpec): void {
    const allSpecs = this.getAllSwaggerSpecs();

    allSpecs[key] = swaggerSpec;

    localStorage.setItem('swaggerSpecs', JSON.stringify(allSpecs));
    this.swaggerSpecs = this.getAllSwaggerSpecs();
  }

  clearCurrentSpec(): void {
    this.swaggerSpecSubject.next({ paths: {} } as ExtendedSwaggerSpec);
    this.selectedSwaggerSpecSubject.next({ paths: {} });

    localStorage.removeItem('swaggerSpec');
  }

  clearSwaggerSpecMemory(): void {
    localStorage.removeItem('swaggerSpec');
    localStorage.removeItem('swaggerSpecs');
    localStorage.removeItem('selectedSwaggerKey');
  }

  saveSwaggerToDatabase(
    filename: string,
    swaggerSpec: ExtendedSwaggerSpec
  ): void {
    this.jsonApiService
      .saveRawJson({
        data: JSON.stringify(swaggerSpec),
        referenceName: filename,
        userId: this.id,
      })
      .subscribe({
        error: (err) => {
          console.error('❌ Failed to save Swagger spec:', err);
        },
      });
  }

  deleteSwaggerSpecFromDatabase(id: string): void {
    this.jsonApiService.deleteRawJson(id).subscribe({
      error: (err) => {
        console.error('❌ Failed to delete Swagger spec:', err);
      },
    });
  }

  renameSwaggerSpecInDatabase(id: string, newFilename: string): void {
    const body = { referenceName: newFilename };

    this.jsonApiService.updateRawJson(id, body).subscribe({
      error: (err) => {
        console.error('❌ Failed to rename Swagger spec:', err);
      },
    });
  }

  updateSwaggerSpecInDatabase(id: string, newSwagger: string): void {
    const body = { value: JSON.stringify(newSwagger) };

    this.jsonApiService.updateRawJson(id, body).subscribe({

      error: (err) => {
        console.error('❌ Failed to rename Swagger spec:', err);
      },
    });
  }

  getAllSwaggerSpecsFromApi(): Observable<void> {
    return this.jsonApiService.getAllRawJsonsByUserID().pipe(
      tap((response: any[]) => {
        this.allSwaggerSpecsApi = {};
        const simplifiedSpecs: Record<string, ExtendedSwaggerSpec> = {};

        response.forEach((item) => {
          try {
            const parsed = JSON.parse(item.data);
            simplifiedSpecs[item.referenceName] = parsed;
            this.allSwaggerSpecsApi[item.referenceName] = {
              id: item.id,
              referenceName: item.referenceName,
              spec: parsed,
            };
          } catch (err) {
            console.error(`Failed to parse Swagger spec [${item.id}]`, err);
          }
        });
        localStorage.setItem('swaggerSpecs', JSON.stringify(simplifiedSpecs));
      }),
      map(() => void 0)
    );
  }

  get allSwaggerSpecsFromApi(): { [key: string]: SwaggerSpecEntry } {
    return this.allSwaggerSpecsApi;
  }
}
