import DS from 'ember-data';
import attr from 'ember-data/attr';
import { validator, buildValidations } from 'ember-cp-validations';

const KINDS = [
  'recycling',
  'garbage',
];

const Validations = buildValidations({
  date: [
    validator('date', {
      onOrAfter: '2018-12-31',
      precision: 'day',
      format: 'YYYY-MM-DD',
    }),
  ],
  lbs: [
    validator('number', {
      allowString: true,
      gt: 0,
    }),
  ],
  kind: [
    validator('inclusion', {
      in: KINDS,
    }),
  ],
});

export default DS.Model.extend(Validations, {
  date: attr('string'),

  lbs: attr('number'),

  kind: attr('string'),
});

export { KINDS };
