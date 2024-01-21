import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserListChannelComponent } from './user-list-channel.component';

describe('UserListChannelComponent', () => {
  let component: UserListChannelComponent;
  let fixture: ComponentFixture<UserListChannelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UserListChannelComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UserListChannelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
