import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CancelledPage } from './cancelled.page';

describe('CancelledPage', () => {
  let component: CancelledPage;
  let fixture: ComponentFixture<CancelledPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CancelledPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
