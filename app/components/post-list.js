import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import ENV from 'manifesto/config/environment';

export default Component.extend({
  tagName: '',

  init() {
    this._super(...arguments);

    this.loadPostsTask.perform();
  },

  store: service(),

  loadPostsTask: task(function * () {
    const posts = (yield this.store.findAll('post')).filter((p) => {
      if (ENV.environment === 'production') {
        return p.isPublished;
      } else {
        return true;
      }
    })
    this.set('posts', posts);
  })
});
