import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GaugeComponent } from './gauge.component';

describe('GaugeComponent', () => {
  let component: GaugeComponent;
  let fixture: ComponentFixture<GaugeComponent>;

  beforeEach(async () => {
    (globalThis as unknown as { Chart: unknown }).Chart = class {
      destroy() {}
    };

    await TestBed.configureTestingModule({
      imports: [GaugeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GaugeComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('quantile', 0.5);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
