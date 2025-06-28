import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RiwayatTugasPage } from './riwayat-tugas.page';

describe('RiwayatTugasPage', () => {
  let component: RiwayatTugasPage;
  let fixture: ComponentFixture<RiwayatTugasPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(RiwayatTugasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
