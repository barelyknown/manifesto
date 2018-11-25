import DS from 'ember-data';
import attr from 'ember-data/attr';

export default DS.Model.extend({
  slug: attr('string'),

  title: attr('string'),

  postedAt: attr('date'),

  body: attr('string'),

  isPublished: attr('boolean'),
});
