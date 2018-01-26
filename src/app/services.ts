import {HttpClient} from '@angular/common/http';
import {Host, Injectable, SkipSelf, ViewContainerRef} from "@angular/core";
import * as moment from 'moment';
import {ToastsManager} from "ng2-toastr";

export class AggregateId {
  static copy(other: AggregateId) {
    return new AggregateId(other.id);
  }

  constructor(public id: number) {}
}

export class OrganizationId {
  static copy(other: OrganizationId) {
    return new OrganizationId(other.id);
  }

  constructor(public id: number) {}
}

export class AggregateVersion {
  static copy(other: AggregateVersion) {
    return new AggregateVersion(other.version);
  }

  constructor(public version: number) {}
}

export class Appointment {
  static empty() {
    return new Appointment(new AggregateId(-1), new AggregateVersion(1), "", "", moment(), moment());
  }

  constructor(public aggregateId: AggregateId, public version: AggregateVersion, public title: string,
              public description: string, public start: moment.Moment, public end: moment.Moment) {}

  toString() {
    return this.title + " " + this.start.format("HH:mm") + " - " + this.end.format("HH:mm");
  }
}

export class StatusResponse {
  constructor(readonly name: string) {}
}

export class CommandResult {
  constructor(readonly status: StatusResponse, readonly id: AggregateId, readonly version: AggregateVersion, readonly message: string) {}
}

@Injectable()
export class AppointemntsService {
  private Url = 'http://localhost:9000//appointments/';
  constructor(private http: HttpClient) {
  }

  getAll(callBack: (data) => void) {
    this.http.get(this.Url + "get-all/" + localStorage.getItem("id")).subscribe( data  => {
      const results: any = data;
      callBack(results.map( d =>
      new Appointment(AggregateId.copy(d.aggregateId), AggregateVersion.copy(d.version), d.aggregate.title,
        d.aggregate.descripion, moment(d.aggregate.start), moment(d.aggregate.end))));
    });

  }

  create(appointment: Appointment, callBack: (data) => void) {
    this.http.post(this.Url + "create", {
      organizationId: new OrganizationId(Number.parseInt(localStorage.getItem("id"))),
      title: appointment.title,
      description: appointment.description,
      start: appointment.start.format('YYYY-MM-DD[T]HH:mm:ss.SSS'),
      end: appointment.end.format('YYYY-MM-DD[T]HH:mm:ss.SSS')}).toPromise()
      .then((d: CommandResult) => {
        callBack(d);
      });
  }

  delete(appointment: Appointment, callBack: (data) => void) {
    this.http.post(this.Url + "delete", {
      aggregateId: appointment.aggregateId,
      expectedVersion: appointment.version,
      organizationId: new OrganizationId(Number.parseInt(localStorage.getItem("id")))}).toPromise()
      .then((d: CommandResult) => {
        callBack(d);
      });
  }

  update(appointment: Appointment, callBack: (data) => void) {
    this.http.post(this.Url + "change", {
      aggregateId: appointment.aggregateId,
      expectedVersion: appointment.version,
      organizationId: new OrganizationId(Number.parseInt(localStorage.getItem("id"))),
      title: appointment.title,
      description: appointment.description,
      start: appointment.start.format('YYYY-MM-DD[T]HH:mm:ss.SSS'),
      end: appointment.end.format('YYYY-MM-DD[T]HH:mm:ss.SSS')}).toPromise()
      .then((d: CommandResult) => {
        callBack(d);
      });
  }
}

