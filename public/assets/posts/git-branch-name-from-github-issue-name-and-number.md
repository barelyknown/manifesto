I like my Git branch names to start with the GitHub issue number that I'm working
on and then have a sensible description (usually based on the GitHub issue name).

For example:

> First material transaction in time card pre-approval form is incorrect #4045

becomes...

`4045-first-material-transaction-in-incorrect`

And so I made an [Alfred workflow (right-click to download)](/assets/workflows/git-branch-name-from-github-issue-name-and-number.alfredworkflow) that takes the GitHub issue name and number and creates a Git branch name that's usually good enough.

Here's the good-enough JavaScript that does the conversion.

<pre class="prettyprint lang-js">function run(argv) {
  const SEP = '-';
  const MAX_LENGTH = 50;
  const NUMBER_PATTERN = /\d+$/;
  const SUFFIX_PATTERN = /\s*#\d+$/;

  let [query] = argv;
  let numberMatches = query.match(NUMBER_PATTERN);
  if (numberMatches) {
    let [number] = numberMatches;
	let parts = [number];
    let name = query.replace(SUFFIX_PATTERN, '');
    let words = name.split(/\s/g);
    parts.push(words.pop());
    while (words.length > 0) {
      let word = words.shift().toLowerCase();
      if (parts.join(SEP).length + word.length + number.length < MAX_LENGTH) {
        parts.splice(-1, 0, word);
      } else {
        break;
      }
    }
	return parts.join(SEP);
  }
}</pre>
