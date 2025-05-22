import { Component, inject } from '@angular/core';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import Keycloak from 'keycloak-js';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-index',
  imports: [TranslateModule, ButtonModule],
  templateUrl: './index.component.html',
  styleUrl: './index.component.css',
})
export class IndexComponent {
  title = 'api-conf';
  user: any;
  roles: string[] = [];
  username: string | undefined;

  private translate = inject(TranslateService);
  private keycloak = inject(Keycloak);

  constructor() {
    const savedLang = localStorage.getItem('language') || 'en';
    this.translate.setDefaultLang(savedLang);
    this.translate.use(savedLang);
  }

  async ngOnInit() {
    if (this.keycloak.authenticated) {
      const profile = await this.keycloak.loadUserProfile();
      this.username = profile.username;
    }
  }
}
