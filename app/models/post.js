import DS from 'ember-data';
import attr from 'ember-data/attr';
import fetch from 'fetch';
import { inject as service } from '@ember/service';
import { computed } from 'ember-awesome-macros';
import { task } from 'ember-concurrency';
import moment from 'moment';

export default DS.Model.extend({
  assetMap: service(),

  fastboot: service(),

  loadBodyTask: task(function * () {
    let body;
    if (this.fastboot.isFastBoot) {
      const fs = FastBoot.require('fs');
      const path = FastBoot.require('path');
      const jsonPath = path.resolve('public','assets', 'posts', `${this.slug}.md`);
      body = fs.readFileSync(jsonPath, { encoding: 'utf-8' });
    } else {
      const response = yield fetch(this.bodyURL);
      if (response.status === 200) {
        body = yield response.text();
      }
    }
    this.set('body', body);
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
