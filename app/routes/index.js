import Route from '@ember/routing/route';

export default Route.extend({
  model() {
    return this.store.peekAll('post').filter((post) => {
      return post.isPublished;
    }).sort((a,b) => {
      return a.publishedAt > b.publishedAt;
    });
  }
});
