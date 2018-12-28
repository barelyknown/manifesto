import Component from '@ember/component';
import { inject as service} from '@ember/service';
import { run } from '@ember/runloop';

export default Component.extend({
  tagName: '',

  headData: service(),

  didReceiveAttrs() {
    const { title } = this;
    console.log('didReceiveAttrs');
    run.once(() => {
      this.headData.set('title', title);
    });
  },

  willDestroyElement() {
    console.log('willDestroyElement');;
    run.once(() => {
      this.headData.set('title', '');
    });
  }
});
