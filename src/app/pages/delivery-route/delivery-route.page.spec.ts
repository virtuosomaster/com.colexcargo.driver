import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DeliveryRoutePage } from './delivery-route.page';

describe('DeliveryRoutePage', () => {
  let component: DeliveryRoutePage;
  let fixture: ComponentFixture<DeliveryRoutePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DeliveryRoutePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
