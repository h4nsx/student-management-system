import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerificationDetail } from './verification-detail';

describe('VerificationDetail', () => {
  let component: VerificationDetail;
  let fixture: ComponentFixture<VerificationDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerificationDetail],
    }).compileComponents();

    fixture = TestBed.createComponent(VerificationDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
