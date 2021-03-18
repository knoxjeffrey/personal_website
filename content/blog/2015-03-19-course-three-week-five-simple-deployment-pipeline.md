---
layout: post
title:  "Tealeaf Academy Course Three/Week Five - Simple Deployment Pipeline"
date:   2015-03-19 11:09:00
categories: Tealeaf Academy
banner_image: ""
featured: false
comments: true
---

A deployment pipeline lays out the whole process that your code needs to go through from your repository to production. It breaks the build into several parts (e.g. build, test and deploy) and all the associated steps that need to be taken.  In this post I'm going to talk through the steps of a simple deployment pipeline as used in the Tealeaf Academy course.

<!--more-->

##  GitHub Flow

The first step of the deployment pipeline is to follow the [GitHub Flow](https://guides.github.com/introduction/flow/) which involves creating branches for each new feature that will not affect the master branch.  Once completed, merge the pull request back to the master branch.

## Run The Test Suite

Do not push your code to GitHub until you have run your entire test suite.  It is important that the master branch always has working code.

## Deploy To Staging

Once you are confident that everything is working well in your local environment then it is time to deploy the code to the staging environment.  Make sure the staging server is as close to the production server as possible for more confidence that everything will also work well in production.  Use the testing server to ensure that every new feature you implement works as expected by working through the steps as a user on your site would.

Setting up staging and production servers is relatively straightforward on Heroku if you are starting an application from scratch, see the guide [here](https://devcenter.heroku.com/articles/multiple-environments).  The guide isn't guide so clear when you already have an existing server running but [this post](http://rrcid.tumblr.com/post/80762541884/setting-up-a-deployment-pipeline) explains it much better.

It is important that your staging server should have it's own config: ```config/environments/staging.rb``` and that way you can tailor the settings to suit how you want it for the staging sever.  An important thing to do is to change the environment variables on Heroku for ```RACK_ENV``` and ```RAILS_ENV``` to ```staging``` for this configuration to take effect.

Another thing to consider on your staging server is email sending because you don't want to be running tests here and spamming all of your users.  I got around this by using the Heroku addon [Mailtrap](https://addons.heroku.com/mailtrap) which has a free plan and means that all emails from my staging environment will be caught by the Mailtrap dummy SMTP server. When you have the addon attached to your staging server then click on ```Mailtrap by Railsware``` in your list of addons in Heroku.  You will then see a list of inboxes and you will see a demo inbox.  Click on that and you will see how to integrate with Ruby on Rails by adding the following code to ```staging.rb```

The setting in my ```staging.rb``` file for this was as follows:

    config.action_mailer.delivery_method = :smtp
    config.action_mailer.smtp_settings = {
      :user_name => 'username',
      :password => 'password',
      :address => 'mailtrap.io',
      :domain => 'mailtrap.io',
      :port => '2525',
      :authentication => :cram_md5
    }
    
## Production Error Monitoring

Unfortunately, even with well tested applications there can still be errors and you need to be informed of these as quickly as possible. For this you need an error monitoring system on your production server and I will be using [Sentry](https://getsentry.com/welcome/).  You can use this free for 14 days to allow you to try it out.  Once you sign up head to the dashboard to create a new project.  Also install ```gem "sentry-raven"``` in your Gemfile and ```bundle install```.  After that you need to create a new file ```config/initializers/raven.rb``` with the following code:

    if Rails.env.staging? || Rails.env.production?
      require 'raven'

      Raven.configure do |config|
        config.dsn = ENV['SENTRY_DSN']
      end
    end
    
I have mentioned before but I am using the Figaro gem to store my environment variables.

## Automate Deployment Pipeline

The deployment to the staging and production servers can be a bit cumbersome and require multiple tasks on the command line.  The solution to this is the Paratrooper gem and it allows you to deploy to the staging server with the command ```rake deploy:staging``` and to the production server with the command ```rake deploy:production```.

First up install ```gem 'paratrooper'``` in the Gemfile and ```bundle install```.  Next up follow the instructions for the Sensible Default Deployment which is the most straightforward deployment method.  This will perform the following tasks:

- Create or update a git tag (if provided)
- Push changes to Heroku
- Run database migrations if any have been added to db/migrate
- Restart the application
- Warm application instance

In order to do this I created a new file ```lib/tasks/deploy.rake``` with the following code:

    require 'paratrooper'

    namespace :deploy do
      desc 'Deploy app in staging environment'
      task :staging do
        deployment = Paratrooper::Deploy.new("knoxjeffrey-myflix-staging", tag: 'staging')

        deployment.deploy
      end

      desc 'Deploy app in production environment'
      task :production do
        deployment = Paratrooper::Deploy.new("knoxjeffrey-myflix") do |deploy|
          deploy.tag              = 'production'
          deploy.match_tag        = 'staging'
        end

        deployment.deploy
      end
    end

Change the staging and production names to suit.  Note the line ```deploy.match_tag = 'staging'``` for deploying to production.  This means that only the code that has been pushed and tested on staging can be pushed to production and therefore you never skip the staging step which reduces the chance of bugs being pushed to production.

## Push To Staging

With that done and everything up to date on GitHub it's time to deploy to staging with the command: ```rake deploy:staging``` and all being well things will work smoothly.  When I got to this stage I did have a few issues though which I'll talk about here.  When I deployed I received the following error:

    Permission denied (publickey).
    fatal: Could not read from remote repository.

    Please make sure you have the correct access rights
    and the repository exists.
    
In order to fix this I followed the instructions [here](https://devcenter.heroku.com/articles/keys).  First I had to type: 

    ssh-keygen -t rsa
    
to generate the key and then:

    heroku keys:add
    
to add the key to heroku.

Another issue I had was to add the env values to Heroku when I was using the Figaro gem.  Before I just had to use the command:

    figaro heroku:set -e staging
    
but now I had 2 Heroku apps for one git repo and that's why I was getting an error:

    !    Multiple apps in folder and no app specified.
    !    Specify app with --app APP.
    
The commands to use now are:

    figaro heroku:set -a knoxjeffrey-myflix-staging -e staging
    figaro heroku:set -a knoxjeffrey-myflix -e production

With this done I was able to deploy again without any problems.  Thanks to Tomas and Albert at Tealeaf Academy for helping me with this!

When I test signing up a new user on my staging server my welcome email was indeed being captured by Mailtrap.  I also tested other features to make sure all was working well and at this point it is time to deploy to production with ```rake deploy:production``` and then check everything there.

This was a massive learning curve for me to get all this working but I now have a much better process to run my test suite, deploy to staging, test and deploy to production.  All this will help to minimise the chances of errors in my production site leading to happy users!