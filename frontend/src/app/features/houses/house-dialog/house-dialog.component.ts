import { Component, Inject, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { REGIONS, IDEAL_HABITATS, HOUSE_TYPES, HousingKitResponse } from '@core/models';
import { HousingKitService } from '@core/services/housing-kit.service';

@Component({
  selector: 'app-house-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>{{ data.mode === 'create' ? 'Create House' : 'Edit House' }}</h2>
    <mat-dialog-content>
      <form [formGroup]="form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Name</mat-label>
          <input matInput formControlName="name">
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Description</mat-label>
          <textarea matInput formControlName="description" rows="2"></textarea>
        </mat-form-field>
        @if (data.mode === 'create') {
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Region</mat-label>
            <mat-select formControlName="region">
              @for (r of regions; track r) { <mat-option [value]="r">{{ r }}</mat-option> }
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>House Type</mat-label>
            <mat-select formControlName="houseType">
              @for (t of houseTypes; track t) { <mat-option [value]="t">{{ t }}</mat-option> }
            </mat-select>
          </mat-form-field>
        }
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Ideal Habitat</mat-label>
          <mat-select formControlName="idealHabitat">
            <mat-option [value]="null">None</mat-option>
            @for (h of habitats; track h) { <mat-option [value]="h">{{ h }}</mat-option> }
          </mat-select>
        </mat-form-field>
        @if (form.get('houseType')?.value === 'KIT') {
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Housing Kit</mat-label>
            <mat-select formControlName="housingKitId">
              @for (kit of kits(); track kit.id) { <mat-option [value]="kit.id">{{ kit.name }} ({{ kit.size }} slots)</mat-option> }
            </mat-select>
          </mat-form-field>
        }
        @if (form.get('houseType')?.value === 'CUSTOM') {
          <div class="dimensions-row">
            <mat-form-field appearance="outline">
              <mat-label>Width</mat-label>
              <input matInput type="number" formControlName="width">
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Depth</mat-label>
              <input matInput type="number" formControlName="depth">
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Height</mat-label>
              <input matInput type="number" formControlName="height">
            </mat-form-field>
          </div>
        }
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-flat-button color="primary" [disabled]="form.invalid" (click)="onSubmit()">
        {{ data.mode === 'create' ? 'Create' : 'Save' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`.full-width { width: 100%; } .dimensions-row { display: flex; gap: 8px; }`]
})
export class HouseDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private kitService = inject(HousingKitService);

  regions = [...REGIONS];
  habitats = [...IDEAL_HABITATS];
  houseTypes = [...HOUSE_TYPES];
  kits = signal<HousingKitResponse[]>([]);

  form = this.fb.group({
    name: ['', Validators.required],
    description: [''],
    region: ['', Validators.required],
    houseType: ['KIT', Validators.required],
    idealHabitat: [null as string | null],
    housingKitId: [null as string | null],
    width: [null as number | null],
    depth: [null as number | null],
    height: [null as number | null]
  });

  constructor(
    public dialogRef: MatDialogRef<HouseDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { mode: string; house?: any }
  ) {}

  ngOnInit() {
    this.kitService.getAll().subscribe(kits => this.kits.set(kits));
    if (this.data.mode === 'edit' && this.data.house) {
      this.form.patchValue(this.data.house);
    }
  }

  onSubmit() {
    if (this.form.invalid) return;
    this.dialogRef.close(this.form.value);
  }
}
