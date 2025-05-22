import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { AuthService } from './services/auth.service';
import { TabsModule } from 'primeng/tabs';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { PopoverModule } from 'primeng/popover';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { AvatarModule } from 'primeng/avatar';
import { Drawer, DrawerModule } from 'primeng/drawer';
import { StyleClassModule } from 'primeng/styleclass';
import { ImportsModule } from './imports';
import { DrawerMenuComponent } from './common/components/drawer-menu/drawer-menu.component';
import { MenuBreadcrumbComponent } from './common/components/menu-bredcrumb/menu-bredcrumb.component';
import { RefreshDatabaseButtonComponent } from "./common/components/refresh-database-button/refresh-database-button.component";
export class AppModule {}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    TranslateModule,
    TabsModule,
    PopoverModule,
    OverlayPanelModule,
    ButtonModule,
    ToolbarModule,
    AvatarModule,
    DrawerModule,
    ImportsModule,
    StyleClassModule,
    DrawerMenuComponent,
    MenuBreadcrumbComponent,
    RefreshDatabaseButtonComponent
],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  title = 'api-conf';
  user: any;
  roles: string[] = [];
  isAuthenticated = false;
  visible: boolean = false;
  private translate = inject(TranslateService);
  private authService = inject(AuthService);

  @ViewChild('drawerRef') drawerRef!: Drawer;

  constructor() {
    const savedLang = localStorage.getItem('language') || 'en';
    this.translate.setDefaultLang(savedLang);
    this.translate.use(savedLang);
  }

  async ngOnInit() {
    this.isAuthenticated = await this.authService.isLoggedIn();
    if (this.isAuthenticated) {
      this.user = await this.authService.getUser();
      this.roles = await this.authService.getUserRoles();
    }
  }

  closeCallback(e: Event): void {
    this.drawerRef.close(e);
  }

  async login() {
    await this.authService.login();
    window.location.reload();
  }

  async logout() {
    await this.authService.logout();
  }

  result: string = '';
}
