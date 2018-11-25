import Component from '@ember/component';
import { inject as service } from '@ember/service';

export default Component.extend({
  tagName: '',

  init() {
    this._super(...arguments);

    this.loadPosts();
  },

  store: service(),

  loadPosts() {
    const posts = this.store.findAll('post');
    this.set('posts', posts);
  }
});
