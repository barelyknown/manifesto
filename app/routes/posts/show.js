import Route from '@ember/routing/route';

export default Route.extend({
  model(params) {
    const { slug } = params;
    return this.store.peekAll('post').find((p) => {
      return p.slug === slug;
    });
  },
});
