import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
})
export class SignupPage implements OnInit {

  authType: string = 'email';

  constructor() { }

  ngOnInit() {
  }


  Switchto(anytype:string){
    this.authType = anytype;
  }
}
