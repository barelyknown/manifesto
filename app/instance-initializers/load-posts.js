import posts from 'manifesto/mirage/fixtures/posts';

export function initialize(appInstance) {
  const store = appInstance.lookup('service:store');
  store.pushPayload({
    data: posts.map((post) => {
      return {
        id: post.slug,
        type: 'post',
        attributes: {
          'is-published': post.isPublished,
          'title': post.title,
          'posted-at': post.postedAt,
          'location': post.location,
          'time-zone': post.timeZone,
        },
      };
    }),
  });
}

export default {
  initialize
};
