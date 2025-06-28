import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DaftarOrderPage } from './daftar-order.page';

describe('DaftarOrderPage', () => {
  let component: DaftarOrderPage;
  let fixture: ComponentFixture<DaftarOrderPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DaftarOrderPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
