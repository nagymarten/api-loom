import { Component, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { ApiDataService } from '../../../services/api-data.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-refresh-database-button',
  imports: [ButtonModule, TranslateModule, ToastModule, CommonModule],
  providers: [MessageService],

  templateUrl: './refresh-database-button.component.html',
  styleUrl: './refresh-database-button.component.css',
})
export class RefreshDatabaseButtonComponent {
  private apiDataService = inject(ApiDataService);
  private messageService = inject(MessageService);
  private translate = inject(TranslateService);

  isInIndex: boolean = false;

  constructor() {
    this.apiDataService.isInIndex$.subscribe(value => {
      this.isInIndex = value;
    });
  }

  refreshDatabase(): void {
    const asd = this.apiDataService.getSelectedSwaggerSpecValue();
    const key = this.apiDataService.getSelectedSwaggerKey();
    let id: string | null = null;
    if (key !== null) {
      id = this.apiDataService.getSwaggerSpecIdByKeyFromApi(key);
    }

    if (id) {
      this.apiDataService.updateSwaggerSpecInDatabase(id, asd);

      this.messageService.add({
        severity: 'success',
        summary: this.translate.instant('TOAST.REFRESH_DB.SUMMARY'),
        detail: this.translate.instant('TOAST.REFRESH_DB.DETAIL'),
        life: 3000,
      });
    } else {
      this.messageService.add({
        severity: 'warn',
        summary: this.translate.instant('TOAST.REFRESH_DB.NO_ID_SUMMARY'),
        detail: this.translate.instant('TOAST.REFRESH_DB.NO_ID_DETAIL'),
        life: 3000,
      });
    }

    this.apiDataService.getAllSwaggerSpecsFromApi();
  }
}
