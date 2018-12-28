import EmberRouter from '@ember/routing/router';
import RouterScroll from 'ember-router-scroll';
import config from './config/environment';

const Router = EmberRouter.extend(RouterScroll, {
  location: config.locationType,
  rootURL: config.rootURL,
  locationType: 'router-scroll',
  historySupportMiddleware: true,
});

Router.map(function() {
  this.route('posts', function() {
    this.route('show', { path: '/:slug' }, function() {});
  });
  this.route('sidebar');
  this.route('weight-tracker');
  this.route('weight-vs-face');
});

export default Router;
