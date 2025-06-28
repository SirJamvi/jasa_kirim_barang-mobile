import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LacakKirimanPage } from './lacak-kiriman.page';

describe('LacakKirimanPage', () => {
  let component: LacakKirimanPage;
  let fixture: ComponentFixture<LacakKirimanPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(LacakKirimanPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
