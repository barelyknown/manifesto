import EmberRouter from '@ember/routing/router';
import config from './config/environment';

const Router = EmberRouter.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
  this.route('posts', function() {
    this.route('show', { path: '/:post_slug' }, function() {});
  });
  this.route('sidebar');
  this.route('weight-vs-face');
});

export default Router;
