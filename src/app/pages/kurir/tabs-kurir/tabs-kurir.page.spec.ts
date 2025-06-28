import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TabsKurirPage } from './tabs-kurir.page';

describe('TabsKurirPage', () => {
  let component: TabsKurirPage;
  let fixture: ComponentFixture<TabsKurirPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TabsKurirPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
