import Component from '@ember/component';
import { inject as service } from '@ember/service';

export default Component.extend({
  init() {
    this._super(...arguments);
    this.sidebar;
  },

  tagName: '',

  sidebar: service(),

  actions: {
    toggleSidebar() {
      this.sidebar.toggleVisibility();
    }
  }
});
