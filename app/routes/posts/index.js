import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';

export default Route.extend({
  postLoader: service(),

  model() {
    return this.modelTask.perform();
  },

  modelTask: task(function * () {
    return (yield this.postLoader.loadAll()).filter((post) => {
      return post.isPublished;
    }).sort((a,b) => {
      return a.postedAt > b.postedAt ? -1 : 1;
    });
  })
});
