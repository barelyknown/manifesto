import Service from '@ember/service';
import { inject as service } from '@ember/service';
import { json } from 'd3-fetch';
import { task } from 'ember-concurrency';
import ENV from 'manifesto/config/environment';

export default Service.extend({
  store: service(),

  isLoaded: false,

  loadAllTask: task(function * () {
    const {
      isLoaded,
      store,
    } = this;

    if (!isLoaded) {
      const data = yield json('/assets/posts/data.json');
      for (var d = 0; d < data.length; d++) {
        if (ENV.environment !== 'production' || data[d].isPublished) {
          const doc = {
            id: data[d].slug,
            type: 'post',
            attributes: {
              slug: data[d].slug,
              title: data[d].title,
              postedAt: data[d].postedAt,
              location: data[d].location,
              timeZone: data[d].timeZone
            },
            relationships: {}
          };
          store.push({ data: [doc] });
        }
      }
    }
    return store.peekAll('post');
  }),

  loadAll() {
    return this.loadAllTask.perform();
  }
});
