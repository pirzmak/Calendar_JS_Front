import {Component, Input, OnInit, Output, ViewContainerRef} from '@angular/core';
import {AggregateId, AggregateVersion, AppointemntsService, Appointment, CommandResult} from "./services";

@Component({
  selector: 'app-login',
  providers: [ AppointemntsService ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  @Input() loginApp: () => void;

  login: string;

  constructor() {}

  ngOnInit(): void {
    this.login = "";
  }

  loginTo(): void {
    localStorage.setItem('id', ""+(Math.abs(this.login.split("").reduce(function(a,b){a=((a<<5)-a)+b.charCodeAt(0);return a&a;},0)))%10000);
    this.loginApp();
  }
}

