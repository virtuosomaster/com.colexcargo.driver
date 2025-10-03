import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DeliveredPage } from './delivered.page';

describe('DeliveredPage', () => {
  let component: DeliveredPage;
  let fixture: ComponentFixture<DeliveredPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DeliveredPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
