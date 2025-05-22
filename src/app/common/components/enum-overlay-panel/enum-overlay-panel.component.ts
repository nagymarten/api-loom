import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { OverlayPanel, OverlayPanelModule } from 'primeng/overlaypanel';

import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Popover, PopoverModule } from 'primeng/popover';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-enum-overlay-panel',
  imports: [
    OverlayPanelModule,
    CommonModule,
    TranslateModule,
    PopoverModule,
    ButtonModule,
  ],
  templateUrl: './enum-overlay-panel.component.html',
  styleUrl: './enum-overlay-panel.component.css',
})
export class EnumOverlayPanelComponent {
  @ViewChild('optionsMenu') optionsMenu!: Popover;

  @Output() markAsExample = new EventEmitter<number>();
  @Output() markAsDefault = new EventEmitter<number>();

  @Input() index!: number;
  @Input() markedAsExample!: string | null;
  @Input() markedAsDefault!: string | null;
  @Input() value!: string;

  open(event: Event) {
    this.optionsMenu.toggle(event);
  }

  selectOption(option: 'example' | 'default') {
    if (option === 'example') {
      this.markAsExample.emit(this.index);
    } else if (option === 'default') {
      this.markAsDefault.emit(this.index);
    }
  }

  isMarked(option: 'example' | 'default'): boolean {
    if (option === 'example') {
      return this.markedAsExample === this.value;
    }
    if (option === 'default') {
      return this.markedAsDefault === this.value;
    }
    return false;
  }

  get exampleIcon(): string {
    return this.isMarked('example') ? 'pi pi-check' : 'pi pi-circle';
  }

  get defaultIcon(): string {
    return this.isMarked('default') ? 'pi pi-check' : 'pi pi-circle';
  }

}
