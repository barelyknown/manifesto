import Component from '@ember/component';
import { inject as service} from '@ember/service';
import { run } from '@ember/runloop';

export default Component.extend({
  tagName: '',

  headData: service(),

  didReceiveAttrs() {
    const { title } = this;
    run.once(() => {
      this.headData.set('title', title);
    });
  },

  willDestroyElement() {
    run.once(() => {
      this.headData.set('title', '');
    });
  }
});
