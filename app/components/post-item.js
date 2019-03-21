import Component from '@ember/component';
import { inject as service } from '@ember-decorators/service';

export default class PostItemComponent extends Component {
  tagName = '';

  @service codePrettify;

  didRender() {
    this.codePrettify.prettify();
  }
}
