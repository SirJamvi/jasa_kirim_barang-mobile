import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BuatKirimanPage } from './buat-kiriman.page';

describe('BuatKirimanPage', () => {
  let component: BuatKirimanPage;
  let fixture: ComponentFixture<BuatKirimanPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(BuatKirimanPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
