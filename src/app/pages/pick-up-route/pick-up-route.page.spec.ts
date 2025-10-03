import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PickUpRoutePage } from './pick-up-route.page';

describe('PickUpRoutePage', () => {
  let component: PickUpRoutePage;
  let fixture: ComponentFixture<PickUpRoutePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PickUpRoutePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
