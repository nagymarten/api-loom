import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  ActivatedRoute,
  NavigationEnd,
  Router,
  RouterModule,
} from '@angular/router';
import { MenuItem } from 'primeng/api';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { filter } from 'rxjs';

@Component({
  selector: 'app-menu-bredcrumb',
  imports: [BreadcrumbModule, RouterModule, CommonModule],
  templateUrl: './menu-bredcrumb.component.html',
  styleUrl: './menu-bredcrumb.component.css',
  standalone: true,
})
export class MenuBreadcrumbComponent implements OnInit {
  breadcrumbModel: MenuItem[] = [];
  breadcrumbHome: MenuItem = {
    icon: 'pi pi-home',
    routerLink: '/',
  };

  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.breadcrumbModel = this.buildMenuItems(this.route.root);
      });
  }

  private buildMenuItems(
    route: ActivatedRoute,
    url: string = '',
    items: MenuItem[] = []
  ): MenuItem[] {
    const segment = route.snapshot.url.map((s) => s.path).join('/');
    if (segment) {
      url += `/${segment}`;
    }

    let label = route.snapshot.data['breadcrumb'];

    if (label) {
      Object.entries(route.snapshot.params).forEach(([key, value]) => {
        label = label.replace(`:${key}`, this.formatParamValue(key, value));
      });

      if (label.includes(':') && label.includes(' / ')) {
        const [prefix, rest] = label.split(':');
        const [middle, method] = rest.split(' / ').map((p: string) => p.trim());

        items.push({
          label: prefix.trim(),
          icon: prefix.trim() === 'Path' ? 'pi pi-folder' : undefined,
        });

        items.push({
          label: middle,
        });

        items.push({
          label: method,
        });
      }

      // References: ABC30 or Models: User → References › ABC30
      else if (label.includes(':')) {
        const [prefix, value] = label.split(':');

        const trimmedPrefix = prefix.trim();

        items.push({
          label: trimmedPrefix,
          routerLink: url,
          icon: ['References', 'Models'].includes(trimmedPrefix)
            ? 'pi pi-folder'
            : undefined,
        });

        items.push({
          label: value.trim(),
          routerLink: url,
        });
      }

      // Default case
      else if (label !== 'Home') {
        items.push({
          label,
          routerLink: url,
        });
      }
    }

    for (const child of route.children) {
      this.buildMenuItems(child, url, items);
    }

    return items;
  }

  private formatParamValue(key: string, value: string): string {
    if (key === 'method') return value.toUpperCase();

    return value
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (c) => c.toUpperCase());
  }
}
