import moment from 'moment';

export default [
  {
    slug: 'india-travelogue-2018-dispath-1',
    isPublished: true,
    title: 'India Travelogue: Dispatch 1',
    postedAt: moment.tz([2018,11,13,9], 'Asia/Kolkata').clone().tz('UTC').format(),
    location: 'Goa, India',
    timeZone: 'Asia/Kolkata',
  },
  {
    slug: 'manifort-alchemy',
    isPublished: false,
    title: 'Manifort Alchemy',
    postedAt: moment.tz([2018,11,1,17], 'America/Chicago').clone().tz('UTC').format(),
    location: 'Chicago, IL',
    timeZone: 'America/Chicago',
  },
  {
    slug: 'manifesto-destiny',
    isPublished: true,
    title: 'Manifesto Destiny',
    postedAt: moment.tz([2018,10,25,12], 'America/Chicago').clone().tz('UTC').format(),
    location: 'Chicago, IL',
    timeZone: 'America/Chicago',
  },
  {
    slug: 'visions-and-verbs',
    isPublished: true,
    title: 'Visions and Verbs',
    postedAt: moment.tz([2017,0,2], 'America/New_York').clone().tz('UTC').format(),
    location: 'Simsbury, CT',
    timeZone: 'America/New_York',
  },
  {
    slug: 'the-app-store-first-comes-power',
    isPublished: true,
    title: 'First Comes Power',
    postedAt: moment.tz([2009,0,3], 'America/New_York').clone().tz('UTC').format(),
    location: 'Ann Arbor, MI',
    timeZone: 'America/New_York',
  }
];
