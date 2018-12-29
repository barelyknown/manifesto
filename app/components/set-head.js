import Component from '@ember/component';
import { inject as service} from '@ember/service';
import { run } from '@ember/runloop';

export default Component.extend({
  tagName: '',

  headData: service(),

  didReceiveAttrs() {
    const {
      headData,
      description,
      image
    } = this;

    run.once(() => {
      headData.setProperties({
        description,
        image,
      });
    });
  },

  willDestroyElement() {
    const { headData } = this;
    run.once(() => {
      headData.setProperties({
        description: '',
        image: '',
      })
    });
  }
});
