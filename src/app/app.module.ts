import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule} from '@angular/common/http';
import {ToastModule, ToastOptions} from 'ng2-toastr/ng2-toastr';

import { AppComponent } from './app.component';
import {AppointmentSettingsComponent} from "./appointmentSettings.component";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {CustomOption} from "./CustomOptions";
import {LoginComponent} from "./login.component";


@NgModule({
  declarations: [
    AppComponent,
    AppointmentSettingsComponent,
    LoginComponent
  ],
  imports: [
    BrowserAnimationsModule,
    BrowserModule,
    FormsModule,
    HttpClientModule,
    ToastModule.forRoot()
  ],
  providers: [{provide: ToastOptions, useClass: CustomOption}],
  bootstrap: [AppComponent]
})
export class AppModule { }
