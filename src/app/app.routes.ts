import { Routes } from '@angular/router';
import { PathsComponent } from './common/paths/paths.component';
import { SchemasComponent } from './common/schemas/schemas.component';
import { ResponsesComponent } from './common/paths/responses/responses.component';
import { ReferenceComponent } from './common/reference/reference.component';
import { NotFoundComponent } from './common/not-found/not-found.component';
import { IndexComponent } from './common/index/index.component';

export const routes: Routes = [
  { path: '', component: IndexComponent, data: { breadcrumb: 'Home' } },
  {
    path: 'path/:path/:method',
    component: PathsComponent,
    data: { breadcrumb: 'Path: :path / :method' },
  },
  {
    path: 'schemas',
    component: SchemasComponent,
    data: { breadcrumb: 'Schemas' },
  },
  {
    path: 'schemas/:schema',
    component: SchemasComponent,
    data: { breadcrumb: 'Models: :schema' },
  },

  {
    path: 'responses',
    component: ResponsesComponent,
    data: { breadcrumb: 'Responses' },
  },
  {
    path: 'responses/:response',
    component: ResponsesComponent,
    data: { breadcrumb: 'Response' },
  },

  {
    path: 'reference',
    component: ReferenceComponent,
    data: { breadcrumb: 'References' },
  },
  {
    path: 'reference/:reference',
    component: ReferenceComponent,
    data: { breadcrumb: 'References: :reference' },
  },
  {
    path: '404',
    component: NotFoundComponent,
    data: { breadcrumb: 'Not Found' },
  },
  { path: '**', redirectTo: '404' },
];
