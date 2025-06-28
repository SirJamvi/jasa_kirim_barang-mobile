import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TabsPelangganPage } from './tabs-pelanggan.page';

describe('TabsPelangganPage', () => {
  let component: TabsPelangganPage;
  let fixture: ComponentFixture<TabsPelangganPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TabsPelangganPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
