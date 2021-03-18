---
layout: post
title:  "Tealeaf Academy Course Three/Week Five - Continuous Integration And Deployment"
date:   2015-03-20 09:27:00
categories: Tealeaf Academy
banner_image: ""
featured: false
comments: true
---

In my previous post when I talked about the deployment pipeline I discussed using the Paratrooper gem to help automate some of the steps for deployment to the staging and production servers.  In this post I'm going to talk about another tool and development practice that can not only replace this but also do a whole lot more.

<!--more-->

(Click on the link to read my last post on the [Simple Deployment Pipeline](../../../../2015/03/19/course-three-week-five-simple-deployment-pipeline/))


## Continuous Integration

> Continuous Integration is a software development practice where members of a team integrate their work frequently, usually each person integrates at least daily - leading to multiple integrations per day. Each integration is verified by an automated build (including test) to detect integration errors as quickly as possible.

[Clicking this article link](http://martinfowler.com/articles/continuousIntegration.html) will give you a thorough overview of continuous integration.  As mentioned in the quote, the big benefit of CI is that bugs can be found extremely quickly due to less back tracking.  When you have large time periods between integrations then multiple bugs can be introduced and often those bugs can interfere with each other therefore making bug tracking much more difficult and time consuming.

An important part of CI is to have all of your code in a single source repository and then use a CI server (I'll get to that in a bit) to monitor that repository. An example process would work like this:

- developer checks out new feature branch on their local machine.
- feature is finished and all tests pass locally
- push feature branch to GitHub and create a pull request.
- this gets approved and then merged into the staging branch
- CI server is monitoring the staging branch in the repository
- CI server builds the system and runs unit and integration tests
- CI server informs the team of the successful build
- if there's an error the developer fixes it and goes through the process again until it passes.
- the developer can deploy this new code to the staging server and check out the feature on the live staging site to ensure all is good.
- developer merges code code from staging branch into master
- same process with the CI server until pass
- deploy to production site

## Continuous Deployment

Continuous Deployment take CI one step further by allowing the CI server to actually deploy the feature code to the staging and production servers so the developer doesn't have to physically do it.

With CI and CD you can do away with the stress of a large integration at the end of the project and then having a heart attack when it doesn't work properly!  CI and CD allows you to have a working build of the application all the way through the development process and this leads to happy developers and happy clients.

## CI Server

Now, I mentioned about the CI server above and in the Tealeaf Academy course I am using [Circle CI](https://circleci.com) which is so simple to use.  Go to the site, authorise your GitHub account, add the repository you want to monitor. That's CI set up! Now to set up CD go to 'Heroku Deployment' under 'Project Settings/Continuous Deployment' in the Circle CI menu.  Follow the instructions to enter your Heroku API key and SSH key and that gives Circle CI permission to deploy to your servers on Heroku.

Next, at the root of your application folder add a file ```circle.yml``` and I added the following code:

    machine:
      ruby:
        version: 2.1.5

    deployment:
      production:
        branch: master
        commands:
          - heroku maintenance:on --app knoxjeffrey-myflix
          - heroku pg:backups capture --app knoxjeffrey-myflix
          - git push git@heroku.com:knoxjeffrey-myflix.git $CIRCLE_SHA1:refs/heads/master
          - heroku run rake db:migrate --app knoxjeffrey-myflix
          - heroku maintenance:off --app knoxjeffrey-myflix
      staging:
        branch: staging
        commands:
          - heroku maintenance:on --app knoxjeffrey-myflix-staging
          - git push git@heroku.com:knoxjeffrey-myflix-staging.git $CIRCLE_SHA1:refs/heads/master
          - heroku run rake db:migrate --app knoxjeffrey-myflix-staging
          - heroku maintenance:off --app knoxjeffrey-myflix-staging

Just replace the name of my production and staging sites with your own and also change the ruby version to match what you are using.  For this to work you will need a master branch (there by default) and staging branch on your GitHub repository.

I initially had an issue creating a staging branch because I already had a staging tag on GitHub after using Paratrooper [see previous post](../../../../2015/03/19/course-three-week-five-simple-deployment-pipeline/).  As I am no longer using Paratrooper I can just get rid of the tag by typing the following at the command prompt:

    git tag -d staging
    
Now when you merge to the staging and master branches Circle CI will run the entire test suite, deploy to your Heroku servers and let you know if it was successful or if there were errors.

This notification will come in the form of an email but other options are to use [CCMenu](https://itunes.apple.com/us/app/ccmenu/id603117688?mt=12) for Mac users or the [Circle CI Monitor](https://chrome.google.com/webstore/detail/circleci-monitor/pkdkfaokllclembpkggkndfejdhcpmpk) for Chrome users.

And that's how to integrate CI and CD into your workflow, enjoy a life of significantly less time spent tracking bugs!