import Component from '@ember/component';
import moment from 'moment';
import computedTask from 'manifesto/utils/computed-task';
import { timeout } from 'ember-concurrency';
import { isBlank } from '@ember/utils';

export default Component.extend({
  tagName: '',

  init() {
    this._super(...arguments);
    this.setDates();
    this.tempForecast;
  },

  setDates() {
    const dates = [];
    const tomorrow = moment().add(1, 'days');
    let date = tomorrow.clone();
    while (date.diff(tomorrow, 'days') < 30) {
      dates.push(date.format('YYYY-MM-DD'));
      date.add(1, 'days');
    }
    this.set('dates', dates);
  },

  tempForecast: computedTask('selectedDate', function * () {
    const { selectedDate } = this;
    if (isBlank(selectedDate)) return;

    yield timeout(1500);
    return Math.floor(Math.random() * 100);
  }),

  actions: {
    setDate(date) {
      this.set('selectedDate', date);
    }
  }
});
