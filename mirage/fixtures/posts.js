import moment from 'moment';

export default [
  {
    slug: 'manifesto-destiny',
    title: 'Manifesto Destiny',
    postedAt: moment.tz([2018,10,25,12], 'America/Chicago').clone().tz('UTC').format(),
    location: 'Chicago, IL',
    timeZone: 'America/Chicago',
  }
];
