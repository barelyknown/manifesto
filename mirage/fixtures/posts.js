import moment from 'moment';

export default [
  {
    slug: 'manifesto-destiny',
    title: 'Manifesto Destiny',
    postedAt: moment.tz([2018,10,25,12], 'America/Chicago').clone().tz('UTC').format(),
    location: 'Chicago, IL',
    timeZone: 'America/Chicago',
  },
  {
    slug: 'visions-and-verbs',
    title: 'Visions and Verbs',
    postedAt: moment.tz([2017,0,2], 'America/New_York').clone().tz('UTC').format(),
    location: 'Simsbury, CT',
    timeZone: 'America/New_York',
  },
];
