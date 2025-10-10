import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FileUploadComponent),
      multi: true
    }
  ]
})
export class FileUploadComponent implements ControlValueAccessor {
  @Input() accept: string = 'image/*';
  @Input() maxSize: number = 32 * 1024 * 1024; // 32MB
  @Input() multiple: boolean = false;
  @Input() disabled: boolean = false;
  @Output() fileSelected = new EventEmitter<File>();
  @Output() fileRemoved = new EventEmitter<void>();

  selectedFile: File | null = null;
  previewUrl: string | null = null;
  isDragOver = false;
  errorMessage = '';

  // ControlValueAccessor implementation
  private onChange = (value: File | null) => {};
  private onTouched = () => {};

  writeValue(value: File | null): void {
    this.selectedFile = value;
    if (value) {
      this.createPreview(value);
    } else {
      this.previewUrl = null;
    }
  }

  registerOnChange(fn: (value: File | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFile(input.files[0]);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    if (!this.disabled) {
      this.isDragOver = true;
    }
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;

    if (this.disabled) return;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  private handleFile(file: File): void {
    this.errorMessage = '';

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      this.errorMessage = 'Solo se permiten archivos de imagen';
      return;
    }

    // Validar tamaño
    if (file.size > this.maxSize) {
      this.errorMessage = `El archivo es demasiado grande. Máximo ${this.formatFileSize(this.maxSize)}`;
      return;
    }

    this.selectedFile = file;
    this.createPreview(file);
    this.onChange(file);
    this.onTouched();
    this.fileSelected.emit(file);
  }

  private createPreview(file: File): void {
    const reader = new FileReader();
    reader.onload = (e) => {
      this.previewUrl = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  removeFile(): void {
    this.selectedFile = null;
    this.previewUrl = null;
    this.errorMessage = '';
    this.onChange(null);
    this.fileRemoved.emit();
  }

  openFileDialog(): void {
    if (!this.disabled) {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = this.accept;
      input.multiple = this.multiple;
      input.onchange = (event) => this.onFileSelected(event);
      input.click();
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  get fileSize(): string {
    return this.selectedFile ? this.formatFileSize(this.selectedFile.size) : '';
  }

  get fileName(): string {
    return this.selectedFile ? this.selectedFile.name : '';
  }
}
