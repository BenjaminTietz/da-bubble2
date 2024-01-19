import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StartConversationComponent } from './start-conversation.component';

describe('StartConversationComponent', () => {
  let component: StartConversationComponent;
  let fixture: ComponentFixture<StartConversationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [StartConversationComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(StartConversationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
