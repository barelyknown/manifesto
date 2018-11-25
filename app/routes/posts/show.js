import Route from '@ember/routing/route';

export default Route.extend({
  model(params) {
    const { post_slug: slug } = params;
    return this.store.findAll('post').then((posts) => {
      return posts.find((post) => {
        return post.slug === slug;
      });
    });
  }
});
