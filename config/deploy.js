/* eslint-env node */
'use strict';

module.exports = function(deployTarget) {
  let ENV = {
    build: {},
    pipeline: {
      activateOnDeploy: true,
      disabled: {
        's3-index': deployTarget === 'prerendered',
      },
      alias: {
        s3: { as: ['s3', 's3-prember'] }
      },
      runOrder: {
        's3-prember': {
          after: 's3-index',
        }
      }
    },
  };

  ENV.gzip = {
    filePattern: '**/*.{js,css,json,ico,xml,txt,svg,eot,ttf,woff,woff2,md,csv}',
  };

  if (deployTarget === 'production') {
    ENV.build.environment = 'production';

    ENV.cloudfront = {
      accessKeyId: process.env.ACCESS_KEY_ID,
      secretAccessKey: process.env.SECRET_ACCESS_KEY,
      distribution: process.env.CLOUDFRONT_DISTRIBUTION_ID,
    }

    ENV.s3 = {
      accessKeyId: process.env.ACCESS_KEY_ID,
      secretAccessKey: process.env.SECRET_ACCESS_KEY,
      bucket: process.env.ASSETS_BUCKET,
      region: process.env.REGION,
      filePattern: function(_, pluginHelper) {
        let filePattern = pluginHelper.readConfigDefault('filePattern');
        return filePattern.replace('}', ',jpg,csv,md,json}');
      },
    };

    ENV['s3-index'] = {
      accessKeyId: process.env.ACCESS_KEY_ID,
      secretAccessKey: process.env.SECRET_ACCESS_KEY,
      bucket: process.env.INDEX_BUCKET,
      region: process.env.REGION,
      allowOverwrite: true,
    };

    ENV['s3-prember'] = {
      accessKeyId: process.env.ACCESS_KEY_ID,
      secretAccessKey: process.env.SECRET_ACCESS_KEY,
      bucket: process.env.INDEX_BUCKET,
      region: process.env.REGION,
      filePattern: '**/*.html',
    }
  }

  return ENV;
};
