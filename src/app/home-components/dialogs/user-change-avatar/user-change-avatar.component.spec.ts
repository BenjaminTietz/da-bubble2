import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserChangeAvatarComponent } from './user-change-avatar.component';

describe('UserChangeAvatarComponent', () => {
  let component: UserChangeAvatarComponent;
  let fixture: ComponentFixture<UserChangeAvatarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UserChangeAvatarComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UserChangeAvatarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
