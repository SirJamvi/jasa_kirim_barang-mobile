import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TugasDetailPage } from './tugas-detail.page';

describe('TugasDetailPage', () => {
  let component: TugasDetailPage;
  let fixture: ComponentFixture<TugasDetailPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TugasDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
