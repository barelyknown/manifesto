import Service from '@ember/service';
import { equal, raw } from 'ember-awesome-macros';
import { inject as service } from '@ember/service';

export default Service.extend({
  init() {
    this._super(...arguments);
    this.set('canGoBack', this.router.currentRouteName !== 'sidebar');
  },

  router: service(),

  isVisible: equal('router.currentRouteName', raw('sidebar')),

  toggleVisibility() {
    if (this.isVisible) {
      if (this.canGoBack) {
        history.back();
      } else {
        this.router.transitionTo('application');
      }
    } else {
      this.set('canGoBack', true);
      this.router.transitionTo('sidebar');
    }
  }
});
