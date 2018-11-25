import DS from 'ember-data';
import attr from 'ember-data/attr';
import { text } from 'd3-fetch';

export default DS.Model.extend({
  init() {
    this._super(...arguments);
    this.loadBody();
  },

  loadBody() {
    text(`/posts/${this.slug}.md`).then((data) => {
      this.set('body', data);
    });
  },

  slug: attr('string'),

  title: attr('string'),

  postedAt: attr('date'),

  body: attr('string'),

  isPublished: attr('boolean'),

  location: attr('string'),
});
