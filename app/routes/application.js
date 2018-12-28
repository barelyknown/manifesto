import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default Route.extend({
  postLoader: service(),

  beforeModel() {
    return this.postLoader.loadAll();
  }
});
