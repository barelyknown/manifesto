import moment from 'moment';

export default [
  {
    slug: 'manifesto-destiny',
    title: 'Manifesto Destiny',
    postedAt: moment.tz([2018,10,25,12], 'America/Chicago').clone().tz('UTC').format(),
    location: 'Chicago, IL',
    timeZone: 'America/Chicago',
    body: `
I'm 40 years old; exactly two weeks from 41.

A blog feels, how do you say, _unbecoming_.

**...but a manifesto!**

The former is the want of my late 20s, _whereas_ the latter embraces mortality in the way that middle age should.

This is a public declaration, née plea, _wherein_ I state my opinions for the record.

_Wherefore‽_
`
  }
];
