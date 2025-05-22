import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { FormsModule } from '@angular/forms';
import { EditorModule } from 'primeng/editor';
import { Popover, PopoverModule } from 'primeng/popover';
import { TextareaModule } from 'primeng/textarea';
import { FloatLabel } from 'primeng/floatlabel';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-overlay-textarea',
  imports: [
    CommonModule,
    OverlayPanelModule,
    FormsModule,
    EditorModule,
    PopoverModule,
    TextareaModule,
    FloatLabel,
    TranslateModule,
  ],
  templateUrl: './overlay-textarea.component.html',
  styleUrl: './overlay-textarea.component.css',
})
export class OverlayTextareaComponent {
  @Input() selectedSchema: any;
  @Output() schemaUpdated = new EventEmitter<any>();

  @ViewChild('opTextarea') opTextarea!: Popover;

  text: string = '';
  selectedColumn: any;

  onOverlayHide(): void {
    this.selectedColumn.description = this.text;
    this.schemaUpdated.emit(this.selectedColumn);
  }

  toggleOverlay(event: Event, selectedRowData: any): void {

    this.selectedColumn = selectedRowData;
    this.text =
      selectedRowData.description !== undefined
        ? selectedRowData.description
        : '';
    this.opTextarea.toggle(event);
  }
}
