import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import * as Swagger from 'swagger-schema-official';

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

  private isInIndex = new BehaviorSubject<boolean>(true);
  isInIndex$ = this.isInIndex.asObservable();

  constructor() {
    this.swaggerSpecs = this.getAllSwaggerSpecs();

    if (this.selectedSwaggerKey) {
      this.setSelectedSwaggerSpec(this.selectedSwaggerKey);
    }
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

  // Standalone mode: Backend methods are no-ops (accept params but do nothing)
  saveSwaggerToDatabase(filename?: string, swaggerSpec?: ExtendedSwaggerSpec): void {
    console.info('📦 Standalone mode: Backend save disabled');
  }

  deleteSwaggerSpecFromDatabase(id?: string): void {
    console.info('📦 Standalone mode: Backend delete disabled');
  }

  renameSwaggerSpecInDatabase(id?: string, newFilename?: string): void {
    console.info('📦 Standalone mode: Backend rename disabled');
  }

  updateSwaggerSpecInDatabase(id?: string, newSwagger?: string): void {
    console.info('📦 Standalone mode: Backend update disabled');
  }

  getAllSwaggerSpecsFromApi(): Observable<void> {
    console.info('📦 Standalone mode: Backend sync disabled');
    return new Observable((observer) => {
      observer.next();
      observer.complete();
    });
  }

  get allSwaggerSpecsFromApi(): { [key: string]: any } {
    return {};
  }

  getSwaggerSpecIdByKeyFromApi(key?: string): string | null {
    return null;
  }
}
