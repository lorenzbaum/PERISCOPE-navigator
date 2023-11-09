import {Component, inject, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef, MatDialogContent, MatDialogActions} from "@angular/material/dialog";
import {MatIconModule} from '@angular/material/icon';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatButtonModule} from '@angular/material/button';
import {NgOptimizedImage} from '@angular/common';

@Component({
  selector: 'app-image-dialog',
  templateUrl: './image-dialog.component.html',
  styleUrl: './image-dialog.component.scss',
  standalone: true,
  imports: [MatDialogContent, NgOptimizedImage, MatDialogActions, MatButtonModule, MatTooltipModule, MatIconModule]
})
export class ImageDialogComponent {
  private dialogRef: MatDialogRef<ImageDialogComponent, string> = inject(MatDialogRef<ImageDialogComponent, string>);

  constructor(@Inject(MAT_DIALOG_DATA) public data: { url: string, width: number, height: number }) {
    this.dialogRef.backdropClick().subscribe(() => {
      this.onClose();
    });
    // this.dialogRef.updateSize(`${data.width}px`, `${data.height}px`)
  }

  protected onClose(): void {
    this.dialogRef.close('closed');
  }

  static openDialog(matDialog: MatDialog, url: string, width: number, height: number): MatDialogRef<ImageDialogComponent, string> {
    return matDialog.open(ImageDialogComponent, {
      hasBackdrop: true,
      autoFocus: false,
      width: '95%',
      height: '95%',
      maxWidth: `${width * 1.5}px`,
      maxHeight: `${height * 1.5 + 12}px`,
      data: {
        url: url,
        width: width,
        height: height,
      },
    });
  }
}
