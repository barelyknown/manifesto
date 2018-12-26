import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';

export default Component.extend({
  tagName: '',

  init() {
    this._super(...arguments);
    if (this.slug) {
      this.loadPost(this.slug);
    }
  },

  store: service(),

  loadPost(slug) {
    const post = this.store.peekAll('post').find((post) => {
      return post.slug === slug;
    });
    this.set('post', post);
  }
});
