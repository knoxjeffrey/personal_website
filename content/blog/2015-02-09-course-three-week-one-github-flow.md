---
layout: post
title:  "Tealeaf Academy Course Three/Week One - GitHub Flow"
date:   2015-02-10 12:47:00
categories: Tealeaf Academy
banner_image: ""
featured: false
comments: true
---

[GitHub Flow](http://scottchacon.com/2011/08/31/github-flow.html) is a workflow guideline for how to work with GitHub and revolves around the idea of deploying regularly to GitHub.  This ensures that it is very difficult, if not impossible, to introduce a large number of significant bugs.  Additionally it enables me to quickly address issues of all kinds.

<!--more-->

Key points to note are:

- Anything in the ```master``` branch is code that is ready to be deployed to a production site and should be well tested. 
- When working on a feature create a new branch like so ```git checkout -b myfeature``` for example.  The ```-b``` is used to actually create the new branch.  It's important to create a descriptively named branch to make it obvious what the feature is about.
- Commit to that branch locally and regularly push to the same named branch on GitHub.  This can be done like so ```git push origin myfeature```.  This is really useful in case of computer failures or loss so that recent code is backed up and also typing ```git fetch``` gives a nice little list of what features are being worked on.
-  When it's time to merge, request feedback or help then create a pull request on GitHub from the feature branch to the master branch.  This means that the commits will be in a "to be reviewed" status.
- Once the feature is finished and ready to be merged then go to that pull request and click on 'merge' in order to merge this pull request back to master.
- On the local machine switch back to the master branch by ```git checkout master``` and then ```git pull origin master``` in order to pull the merged code on GitHub to the local environment.
- You are now ready to deploy from the local master branch to Heroku and it's good practise to do this straight away.

When I started reading about pull requests I was under the impression that this was only really used when code was at a stage where it was ready to be merged but reading about GitHub Flow has shown me that it is also an amazing system for code reviews.  I can also cc people in on the pull request by using their username if I want specific people to look at my code which is really nice.

Another great feature is that if I get a comment in the pull request conversations saying code needs fixed then I can push again to that feature branch with the corrections and the new commits will show in the conversation.

That's the main points to the GitHub Flow and this will be a great benefit for me when developing my applications.

Before I finish, another couple of handy command line instructions are:

- ```git branch -a``` to show local and remote branches
- ```git branch -r``` to show remote branches
- ```bit branch``` to show local branches