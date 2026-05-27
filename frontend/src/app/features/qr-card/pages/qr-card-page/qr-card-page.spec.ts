import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QrCardPage } from './qr-card-page';

describe('QrCardPage', () => {
  let component: QrCardPage;
  let fixture: ComponentFixture<QrCardPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QrCardPage],
    }).compileComponents();

    fixture = TestBed.createComponent(QrCardPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
