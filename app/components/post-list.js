import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';

export default Component.extend({
  tagName: '',

  init() {
    this._super(...arguments);

    const postLoading = this.loadPostsTask.perform();
    if (this.fastboot.isFastBoot) {
      this.fastboot.deferRendering(postLoading);
    }
  },

  store: service(),

  fastboot: service(),

  loadPostsTask: task(function * () {
    const posts = yield this.store.peekAll('post');
    // const posts = [];
    this.set('posts', posts);
  }),
});
