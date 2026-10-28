import {Component, inject, Inject} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from "@angular/material/dialog";
import {ImageDialogComponent} from "../image-dialog/image-dialog.component";
import {MatButton} from "@angular/material/button";

@Component({
  selector: 'app-question-dialog',
  imports: [
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatButton,
    MatDialogClose
  ],
  templateUrl: './question-dialog.component.html'
})
export class QuestionDialogComponent {
  private dialogRef: MatDialogRef<ImageDialogComponent, boolean> = inject(MatDialogRef<ImageDialogComponent, boolean>);

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: {
      question: string,
      additionalText: string | undefined,
      options: { default: string, other: string }
    }) {
    this.dialogRef.backdropClick().subscribe(() => this.dialogRef.close());
  }

  static openDialog(matDialog: MatDialog, question: string, additionalText: string | undefined, options: {
    default: string,
    other: string
  }): MatDialogRef<QuestionDialogComponent, boolean> {
    return matDialog.open(QuestionDialogComponent, {
      // hasBackdrop: true,
      autoFocus: true,
      data: {
        question: question,
        additionalText: additionalText,
        options: options
      },
    });
  }
}
