import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ShipmentsPage } from './shipments.page';

describe('ShipmentsPage', () => {
  let component: ShipmentsPage;
  let fixture: ComponentFixture<ShipmentsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ShipmentsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
