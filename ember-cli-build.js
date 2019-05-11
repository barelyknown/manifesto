'use strict';

const EmberApp = require('ember-cli/lib/broccoli/ember-app');
const env = EmberApp.env();
const fs = require('fs');
const path = require('path');

async function buildUrls({ destDir, visit }) {
  let urls = [
    '/',
    '/weight-vs-face',
    '/gross-domestic-product',
    '/posts',
  ];
  const jsonPath = path.resolve('public','assets', 'posts', 'data.json');
  const data = JSON.parse(fs.readFileSync(jsonPath, { encoding: 'utf-8' }));

  for (var d = 0; d < data.length; d++) {
    const datum = data[d];
    urls.push(`/posts/${datum.slug}`);
  }

  return urls;
}

module.exports = function(defaults) {
  let app = new EmberApp(defaults, {
    fingerprint: {
      enabled: true,
      extensions: ['js', 'css', 'png', 'jpg', 'gif', 'map', 'svg', 'ico', 'eot', 'ttf', 'woff', 'woff2', 'md', 'csv', 'json', 'alfredworkflow'],
      prepend: process.env.FINGERPRINT_PREPEND || '/',
      exclude: [
        'assets/images/posts/**/*.*',
        'package.json',
        'assets/tests.js',
        'assets/workflows/*.alfredworkflow',
      ],
      generateAssetMap: true,
      fingerprintAssetMap: true,
    },
    prember: {
      urls: buildUrls,
    },
  });

  // Use `app.import` to add additional libraries to the generated
  // output files.
  //
  // If you need to use different assets in different
  // environments, specify an object as the first parameter. That
  // object's keys should be the environment name and the values
  // should be the asset to use in that environment.
  //
  // If the library that you are including contains AMD or ES6
  // modules that you would like to import into your application
  // please specify an object with the list of modules as keys
  // along with the exports of each module as its value.

  return app.toTree();
};
