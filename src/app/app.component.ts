import {Component, OnInit} from '@angular/core';
import {AggregateId, AggregateVersion, AppointemntsService, Appointment} from "./services";
import * as moment from 'moment';
import {Day, Week} from "./components/Model";

@Component({
  selector: 'app-root',
  providers: [ AppointemntsService ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  weekDays: string[] = ['Monday', 'Thursday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  daysEvents: Week[];
  allAppointments: Appointment[];
  selectedDay: moment.Moment;
  selectedAppointment: Appointment = Appointment.empty();
  appointmentIsSelected: boolean = false;
  logged: boolean;
  loaded: boolean;

  constructor(private appointmentsService: AppointemntsService) {
    this.logged = localStorage.getItem("id") !== null;
    this.loaded = false;
  }

  ngOnInit(): void {
    this.selectedDay = this.getFirstDayOfWeek();
    if(this.logged) {
      this.loadAppointments();
    }

    this.addNewAppointment = this.addNewAppointment.bind(this);
    this.updateAppointment = this.updateAppointment.bind(this);
    this.deleteAppointment = this.deleteAppointment.bind(this);
    this.onFailure = this.onFailure.bind(this);
    this.onSuccess = this.onSuccess.bind(this);
    this.closeConfirm = this.closeConfirm.bind(this);
    this.onLogin = this.onLogin.bind(this);
  }

  onLogin(): void {
    this.logged = true;
    this.loadAppointments();
  }

  onLogout(): void {
    this.logged = false;
    this.appointmentIsSelected = false;
    localStorage.removeItem("id");
  }

  loadAppointments(): void {
    this.appointmentsService.getAll((data) => {
      this.allAppointments = data;
      this.loadDays(this.selectedDay.clone());
      this.loaded = true;
    });
  }


  loadDays(firstDay: moment.Moment) {
    this.daysEvents = [];
    for(let i = 0; i < 4; i++) {
      const week = new Week(firstDay);
      week.week.forEach(d => {
        const appointments = this.allAppointments.filter(a => Day.isTheSame(a.start, d.day));
        if(appointments.length > 0) {
          d.appointments = appointments.sort((a,b) => a.start.isBefore(b.start) ? -1 : 1);
        }
      });
      this.daysEvents.push(week);
    }
  }

  nextWeek() {
    this.selectedDay.add(7,'d');
    this.loadAppointments();
  }

  prevWeek() {
    this.selectedDay.add(-7,'d');
    this.loadAppointments();
  }

  clickEmpty(e, day: moment.Moment) {
    this.selectedAppointment = Appointment.empty();
    this.selectedAppointment.start = day.clone();
    this.selectedAppointment.end = day.clone();
    this.appointmentIsSelected = true;
    e.stopPropagation();
  }

  clickNoEmpty(id: AggregateId,e) {
    this.selectedAppointment = this.allAppointments.find(a => a.aggregateId.id === id.id);
    this.appointmentIsSelected = true;
    e.stopPropagation();
  }

  addNewAppointment(a: Appointment) {
    this.allAppointments = this.allAppointments.concat([a]);
    this.loadDays(this.selectedDay.clone());
    this.appointmentIsSelected = false;
  }

  updateAppointment(app: Appointment) {
    this.allAppointments = this.allAppointments.map(a => a.aggregateId.id === app.aggregateId.id ?  app : a);
  }

  deleteAppointment(id: AggregateId) {
    this.allAppointments = this.allAppointments.filter(a => a.aggregateId.id !== id.id);
    this.loadDays(this.selectedDay.clone());
    this.appointmentIsSelected = false;
  }

  onFailure(tmpId: AggregateId) {
    this.allAppointments = this.allAppointments.filter(a => a.aggregateId.id !== tmpId.id);
    this.loadDays(this.selectedDay.clone());
  }

  closeConfirm() {
    this.appointmentIsSelected = false;
  }

  onSuccess(id: AggregateId, tmpId: AggregateId, version: AggregateVersion) {
    this.allAppointments.forEach((a: Appointment) => {
      if(a.aggregateId.id === tmpId.id) {
        a.aggregateId = id;
        a.version = version;
      }
    });
  }

  getFirstDayOfWeek() {
    return moment(moment.now()).add(-moment(moment.now()).day(), 'd');
  }
}

