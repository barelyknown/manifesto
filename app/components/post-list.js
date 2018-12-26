import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';

export default Component.extend({
  tagName: '',

  init() {
    this._super(...arguments);

    this.loadPostsTask.perform();
  },

  postLoader: service(),

  loadPostsTask: task(function * () {
    this.set('posts', yield this.postLoader.loadAll());
  }),
});
