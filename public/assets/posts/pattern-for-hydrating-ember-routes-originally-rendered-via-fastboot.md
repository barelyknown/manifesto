I've adopted the pattern of writing websites like this one and the
[marketing website for my company (XBE)](https://www.x-b-e.com) as
Ember apps that are pre-rendered using FastBoot and prember. Once familiar
with that development pattern, it's quite straight forward and provides
the benefits of a static site with the development _and_ interactive
benefits of a client-rendered app.

This post explains the pattern that I've used to ensure that the hydration
of the Ember app's data store doesn't cause re-rendering issues while still
getting the immediate route transition behavior that I prefer in all of my
apps.

Here's a description of the specific problem:

When the application is pre-rendered, I'd like it to wait until the
model is resolved before rendering so that the pre-rendered page includes
all content. However, when I'm handling a transition to that page within
the app (non-FastBoot) I'd like for the transition to happen immediately
(before the model is resolved) to avoid a lag between the click and the
transition. After the app is subsequently loaded, I'd like it to avoid
displaying the "loading" state it would show during a route transition
if the corresponding template was pre-rendered.

Let's start with the route and work backwards. I'd like to write an
`ember-concurrency` task that is used to fetch the route's model, and
then have everything just work&trade; across the scenarios listed above.
The example below shows a minimal example of the idea.

<pre class="prettyprint lang-js">// routes/example.js
import Route from '@ember/routing/route';
import RouteModelTask from 'marketing/mixins/route-model-task';
import { task } from 'ember-concurrency';

export default Route.extend(RouteModelTask, {
  modelTask: task(function * (){
    return yield this.store.query('example', {});
  }),
});
</pre>

And then when we render the template, we'll show a loading indicator
of some sort only if the `modelTask` hasn't resolved yet. Again, this is
simplified and doesn't include any sugar to make dealing with the task
that is bound to the `model` _feel_ cleaner &mdash; I just didn't want
to confuse the ideas with additional abstraction.

<pre class="prettyprint">// templates/example.hbs
{{#if this.model.lastSuccessful}}
  {{#each this.model.lastSuccessful.value}}
    ✂️
  {{/each}}
{{else}}
  Loading...
{{/if}}
</pre>

Whether or not to defer rendering in various contexts is handled by
the mixin, and therefore none of that logic clutters up any routes that
implement this pattern.

Let's take a look at a stripped-down implementation of the mixin.
I removed some of the logic that's needed to handle all types
of routes to make the key initial ideas more obvious.

<pre class="prettyprint lang-js">// mixins/route-model-task.js
import Mixin from '@ember/object/mixin';

import {
  task,
  waitForProperty,
 } from 'ember-concurrency';

import { inject as service } from '@ember/service';
import { assert } from '@ember/debug';
import { isPresent } from '@ember/utils';

export default Mixin.create({
  fastboot: service(),

  router: service(),

  model(params) {
    this._super(...arguments);

    const {
      fastboot,
      modelTask
    } = this;

    assert('modelTask must be present in the route', isPresent(modelTask));

    const instance = modelTask.perform(...arguments);

    if (fastboot.isFastBoot) {
      // defer rendering until the data is fetched from the server
      // but handle it this way to enable the route to render immediately
      // when not in fastboot to avoid that s l u g g i s h feel
      fastboot.deferRendering(instance);
    }

    return this.modelTask;
  },

  afterModel() {
    const { _super, afterModelTask } = this;
    _super(...arguments);
    return afterModelTask.perform(...arguments);
  },

  afterModelTask: task(function * (model) {
    const {
      fastboot,
      fastboot: { shoebox },
      router,
      fullRouteName,
    } = this;

    if (fastboot.isFastBoot) {
      return;
    } else {
      let path = router.urlFor(fullRouteName);

      if (shoebox.retrieve('requestPath') === path) {
        // wait for the model task instance to idle before
        // rendering to avoid the *blink* of the model not being defined
        // as the data is hydrated
        return yield waitForProperty(model, 'isIdle', (v) => v);
      }
    }
  }),
});
</pre>

This all gives us the behavior that we want in all situations
without clouding the route-specific logic.
