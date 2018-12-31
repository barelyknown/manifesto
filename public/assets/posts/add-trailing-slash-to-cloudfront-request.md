[This website](https://github.com/barelyknown/manifesto) is an [Ember](https://www.emberjs.com) application, rendered into static HTML files by [prember](https://github.com/ef4/prember), deployed to [AWS S3](https://aws.amazon.com/s3/) by [ember-cli-deploy](http://ember-cli-deploy.com), and served by [AWS CloudFront](https://aws.amazon.com/cloudfront/).

The static files are rendered as `**/index.html` as [explained in the prember README](https://github.com/ef4/prember#configuring-your-webserver).

However, in order to prevent S3 from returning `302 Moved Temporarily` when CloudFront forwards a request without a trailing slash we need to modify the URI of the request using [Lambda@Edge](https://docs.aws.amazon.com/lambda/latest/dg/lambda-edge.html).

The following very simple Lambda function adds a trailing slash if the URI doesn't contain an extension or a trailing slash.

<pre class="p-2 text-sm text-white rounded whitespace-pre-wrap bg-black">const path = require('path');
exports.handler = async (event) => {
  const { request } = event.Records[0].cf;
  const { uri } = request;
  const extension = path.extname(uri);
  if (extension && extension.length > 0) {
    return request;
  }
  const last_character = uri.slice(-1);
  if (last_character === "/") {
    return request;
  }
  const newUri = `${uri}/`;
  console.log(`Rewriting ${uri} to ${newUri}...`);
  request.uri = newUri;
  return request;
};</pre>

That's it! Trigger the Lambda function with a CloudFront viewer request event, and the request's URI will have the trailing slash added which S3 will handle without a redirect. That'll save 50ms (give or take) and be more search engine friendly.

The function needs to be written in Node (sorry [Ruby](https://aws.amazon.com/blogs/compute/announcing-ruby-support-for-aws-lambda/)) since it will be deployed via Lambda@Edge.
