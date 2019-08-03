_This was originally written by me as an internal Slack post at [XBE](https://www.x-b-e.com) to help us better navigate the trade off between innovation and quality. I'm posting publicly to help others that struggle with the same tension and might benefit from reading these strategies, or from simply knowing they aren't alone!_

__________

Development Team,

We’re at a bit of a crossroads. Our customers need for us to innovate in order to help them increase production, reduce waste, and reduce risk _AND_ they also depend heavily on our software for their daily operations and need for our quality to be rock solid.

These goals are at odds. The more we innovate, the more change we introduce, and the larger the surface area of our solution. That causes quality problems, even if short lived. But, if we don’t innovate, we fail to live up to the promised future for which our customers have signed up.

I think that we’re struggling to strike the right balance. And so, I wanted to share some of the techniques that I’ve used successfully to ship a lot of brand new functionality of relatively high quality. Now, I don’t always get it right!, but when I do...

**1. Stay focused on a single thing until it’s shipped.**

Yes, there are distractions to deal with, some our fault, some not. But, do your best to keep your head down on a single thing until it’s done. The cost of loading a feature into your head is non-trivial, and so do that as few times as possible.

**2. Don’t work on something that’s not ready to be worked on.**

Yes, sometimes we have no choice but to get going on a feature that we’re unsure of because external demands say so. But, even in those cases, don’t start programming until you’re ready and it’s important. Stare into space, take a walk, talk it out, etc. Or, if part of the feature is ready to be worked on, start there and mull the rest while you’re working. But avoid the avoidable missteps.

**3. Take full responsibility for your quality.**

It’s a luxury to have others test your code. Don’t be lazy and depend on others to find quality gaps that you could have found. For me, that usually means developing functionality in a few waves. First, get the happy path working. Then, defend against the potential problems and handle the corner cases. Then, refine the usability. Then, clean up the clarify the code. There’s no substitute for careful programming in the first place. Feel like you’re on a high wire without a net.

**4. Keep things as simple as possible, but not more so.**

Keep things straight forward. Feel where there is tension between your code and our app’s conventions, your code and the framework, and your code and the language. Where there is tension, your instinct should be to _adjust your code_. Of course, there are places where improving the frameworks is right, but in general, that’s the wrong decision, especially in the moment. Go with the pitch, attack asymmetrically, and make the smallest changes you can.

**5. Assume you won’t come back to the code for a while.**

Get it as right as possible the first time. Create affordances for what might be required in the future so that extensions can be built instead of planning on large refactors. Tie off loose ends. Now, there is a time and place for spiking something, and it’s reasonable to ship MVPs that are iterated on immediately. But, at any point, if you didn’t come back to the feature, it should be in good shape.

**6. Be a self-sufficient generalist.**

I’ll take a pretty good generalist any day over a collection of great specialists. Notice where you’re weak, and get stronger through purposeful education and practice. None of us can be great at everything, but we can be good enough in most cases. As you plug holes and even out the peaks and valleys, you’ll be able to tackle bigger problem more quickly, and you’ll have _more fun_.

____

I’ve shipped nearly every line of code that I’ve written for our apps. In part, that’s because I merge my PRs!, but mostly because I follow the above rules.

I want each of you to strive to do better to balance innovation and quality. Our customers and team members are depending on us to get that right, we’re all extremely committed to our shared goals, and I know we can level up!

Thanks as always,

Sean