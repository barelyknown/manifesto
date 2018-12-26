import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';

export default Component.extend({
  tagName: '',

  init() {
    this._super(...arguments);
    if (this.slug) {
      this.loadPostTask.perform(this.slug);
    }
  },

  postLoader: service(),

  loadPostTask: task(function * (slug) {
    const posts = yield this.postLoader.loadAll();
    const post = posts.find((post) => {
      return post.slug === slug;
    });
    this.set('post', post);
  }),
});
