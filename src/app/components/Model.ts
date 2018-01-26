import * as moment from 'moment';
import {Appointment} from "../services";

export class Week {
  week: Day[];

  constructor(firstDay: moment.Moment) {
    this.week = [];
    for(let i = 0; i < 7; i++) {
      const day = firstDay.add(1, 'd').clone();
      this.week.push(new Day(day));
    }
  }

  getWeekNumber() {
    return this.week[0].day.week();
  }
}

export class Day {
  appointments: Appointment[];

  static isTheSame(a: moment.Moment, b: moment.Moment) {
    return a.date() === b.date() && a.month() === b.month() && a.year() === b.year();
  }

  constructor(public day: moment.Moment) {
    this.appointments = [];
  }

  toSimplyDate() {
    return moment(this.day, "YYYY-MM-DD").format("MMMM DD");
  }

  isToday () {
    return Day.isTheSame(this.day, moment(moment.now()));
  }
}
