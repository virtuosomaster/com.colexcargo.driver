import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ShipmentPage } from './shipment.page';

describe('ShipmentPage', () => {
  let component: ShipmentPage;
  let fixture: ComponentFixture<ShipmentPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ShipmentPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
