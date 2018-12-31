import Component from '@ember/component';
import { inject as service } from '@ember/service';

export default Component.extend({
  tagName: '',

  codePrettify: service(),

  didRender() {
    this.codePrettify.prettify();
  }
});
