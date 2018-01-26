import {Component, Input, OnInit, Output, ViewContainerRef} from '@angular/core';
import {AggregateId, AggregateVersion, AppointemntsService, Appointment, CommandResult} from "./services";
import {ToastsManager} from "ng2-toastr";
import {isDefined} from "@angular/compiler/src/util";

@Component({
  selector: 'app-settings',
  providers: [ AppointemntsService ],
  templateUrl: './appointmentSettings.component.html',
  styleUrls: ['./appointmentSettings.component.css']
})
export class AppointmentSettingsComponent implements OnInit {
  @Input() appointment: Appointment;
  @Input() addNewAppointment: (appointment: Appointment) => void;
  @Input() updateAppointment: (appointment: Appointment) => void;
  @Input() deleteAppointment: (id: AggregateId) => void;
  @Input() onSuccess: (id: AggregateId, oldId: AggregateId, version: AggregateVersion) => void;
  @Input() onFailure: (oldId: AggregateId) => void;
  @Input() close: () => void;
  fromMinute: number;
  fromHours: number;
  toMinute: number;
  toHours: number;

  correctTitle: boolean;
  correctDate: boolean;

  constructor(private appointmentsService: AppointemntsService, public toastr: ToastsManager, private vcr: ViewContainerRef ) {
    this.toastr.setRootViewContainerRef(vcr);
  }

  ngOnInit(): void {
    this.fromMinute = this.appointment.start.get('m');
    this.fromHours = this.appointment.start.get('h');
    this.toMinute = this.appointment.end.get('m');
    this.toHours = this.appointment.end.get('h');
    this.correctTitle = this.appointment.title.length > 0;
    this.correctDate = this.checkDate();
  }

  titleValidate() {
    this.correctTitle = this.appointment.title.length > 0;
  }

  dateValidate() {
    this.correctDate = this.checkDate();
  }

  checkDate() {
    return this.fromHours < this.toHours || (this.fromHours === this.toHours && this.fromMinute < this.toMinute);
  }

  onDelete(): void {
    this.appointmentsService.delete(this.appointment, (d: CommandResult) => {
      if (d.status.name === "FAILURE") {
        this.toastr.error(d.message, "Błąd");
      } else {
        this.deleteAppointment(this.appointment.aggregateId);
      }
    });
  }

  submit(): void {
    if(!this.correctTitle) {
      this.toastr.warning("Tytuł nie może być pusty", "Walidacja");
    }
    if(!this.correctDate) {
      this.toastr.warning("Data rozpoczęcia musi być wcześniejsza niż data zakończenia", "Walidacja");
    }
    if(this.correctDate && this.correctTitle) {
      this.appointment.end.set({h: this.toHours, m: this.toMinute});
      this.appointment.start.set({h: this.fromHours, m: this.fromMinute});
      this.appointment.description = this.appointment.description !== undefined ? this.appointment.description : "";

      if (this.appointment.aggregateId.id === -1) {
        const tmpId = new AggregateId(Math.random());
        this.appointment.aggregateId = tmpId;
        this.addNewAppointment(this.appointment);

        this.appointmentsService.create(this.appointment, (d: CommandResult) => {
          if (d.status.name === "FAILURE") {
            this.onFailure(tmpId);
            this.toastr.error(d.message, "Błąd");
          } else {
            this.onSuccess(d.id, tmpId, d.version);
            this.toastr.success("Zmiany zapisane", "Sukces");
          }
        });
      } else {
        this.appointmentsService.update(this.appointment, (d: CommandResult) => {
          this.appointment.version.version = this.appointment.version.version + 1;
          this.updateAppointment(this.appointment);
          if (d.status.name === "FAILURE") {
            this.toastr.error(d.message, "Błąd");
          } else {
            this.toastr.success("Zmiany zapisane", "Sukces");
          }
        });
      }
    }
  }
}

