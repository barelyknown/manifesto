import DS from 'ember-data';
import attr from 'ember-data/attr';
import d3Fetch from 'd3-fetch';
import { inject as service } from '@ember/service';
import { computed } from 'ember-awesome-macros';
import { task } from 'ember-concurrency';
import moment from 'moment';

export default DS.Model.extend({
  init() {
    this._super(...arguments);
    this.loadBodyTask.perform();
  },

  assetMap: service(),

  loadBodyTask: task(function * () {
    console.log('text', yield d3Fetch.text('foo'));
    // this.set('body', yield text(this.bodyURL));
  }),

  bodyURL: computed('slug', function () {
    return this.assetMap.resolve(`assets/posts/${this.slug}.md`);
  }),

  slug: attr('string'),

  title: attr('string'),

  postedAt: attr('date'),

  body: attr('string'),

  isPublished: attr('boolean'),

  location: attr('string'),

  timeZone: attr('string'),

  timeFormat: computed('postedAt', 'timeZone', function () {
    const { postedAt, timeZone } = this;
    if (moment(postedAt).clone().tz(timeZone).format('HH:mm') === '00:00') {
      return 'LL';
    } else {
      return 'LLL';
    }
  }),
});
