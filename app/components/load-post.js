import Component from '@ember/component';
import { inject as service } from '@ember/service';

export default Component.extend({
  init() {
    this._super(...arguments);
    this.loadPost(this.slug);
  },

  store: service(),

  loadPost(slug) {
    const post = this.store.peekAll('post').find((post) => {
      return post.slug === slug;
    });
    this.set('post', post);
  }
});
