import DS from 'ember-data';
import attr from 'ember-data/attr';
import { text } from 'd3-fetch';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { task } from 'ember-concurrency';

export default DS.Model.extend({
  init() {
    this._super(...arguments);
    this.loadBodyTask.perform();
  },

  assetMap: service(),

  loadBodyTask: task(function * () {
    const body = yield text(this.bodyURL);
    this.set('body', body);
  }),

  bodyURL: computed('slug', function() {
    return this.assetMap.resolve(`assets/posts/${this.slug}.md`);
  }),

  slug: attr('string'),

  title: attr('string'),

  postedAt: attr('date'),

  body: attr('string'),

  isPublished: attr('boolean'),

  location: attr('string'),
});
