import Service from '@ember/service';
import { inject as service } from '@ember/service';
import fetch from 'fetch';
import { task, all } from 'ember-concurrency';
import ENV from 'manifesto/config/environment';

export default Service.extend({
  store: service(),

  isLoaded: false,

  assetMap: service(),

  fastboot: service(),

  loadAllTask: task(function * () {
    const {
      isLoaded,
      store,
    } = this;

    if (!isLoaded) {
      let data;
      if (this.fastboot.isFastBoot) {
        const fs = FastBoot.require('fs');
        const path = FastBoot.require('path');
        const jsonPath = path.resolve('public','assets', 'posts', 'data.json');
        data = JSON.parse(fs.readFileSync(jsonPath, { encoding: 'utf-8' }));
      } else {
        const response = yield fetch('/assets/posts/data.json');
        if (response.status === 200) {
          data = yield response.json();
        }
      }
      for (var d = 0; d < data.length; d++) {
        if (ENV.environment !== 'production' || data[d].isPublished) {
          const doc = {
            id: data[d].slug,
            type: 'post',
            attributes: {
              slug: data[d].slug,
              title: data[d].title,
              description: data[d].description,
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
    const posts = store.peekAll('post');
    const loadBodies = posts.map((post) => {
      return post.loadBodyTask.perform();
    })
    yield all(loadBodies);
    return posts;
  }),

  loadAll() {
    return this.loadAllTask.perform();
  }
});
