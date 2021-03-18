---
layout: post
title:  "Tealeaf Academy Course Three/Week Five - Sidekiq Backgound Email Job"
date:   2015-03-17 13:20:00
categories: Tealeaf Academy
banner_image: ""
featured: false
comments: true
---

I'm going to walk you through the steps of how to send emails as a background job in your application using Sidekiq and also how to test this.

<!--more-->

## Setup

Before I get onto using Sidekiq I first have to install Redis because Sidekiq uses Redis to store all of its job and operational data.  This is pretty straight forward and can be done in the command prompt:

    brew install redis
    
With that done I then need to run the Redis server and again this is a breeze from the prompt:

    redis-server
    
Note this this has to be done in addition to starting the Rails server.

Next up, open the Gemfile and add the following to install Sidekiq:

    gem 'sidekiq'
    
and then ```bundle install```.  Finally I need to run Sidekiq so it can listen for new jobs with:

    bundle exec sidekiq
    
## Send Email Asynchronously

Below is a sample of code from my MyFLiX application I am building in the Tealeaf Academy course.  This code is using ActionMailer in Users Controller to send out an email when a new user is created:

      def create
        @user = User.new(user_params)

        if @user.save
          check_for_invitation
          AppMailer.notify_on_user_signup(@user).deliver
          redirect_to sign_in_path
        else
          render :new
        end
      end 
      
It's a breeze to send the email asynchronously using delayed extensions in Sidekiq and this will make my application much slicker given that the user no longer has to wait for my application to go through my commercial email provider to send an email.  Only a small change is needed in the create action by adding the ```delay``` method and removing the ```deliver``` method:

    AppMailer.delay.notify_on_user_signup(@user)
    
## Monitor SideKiq Jobs

You'll probably be interested in being able to monitor your jobs and Sidekiq provides a handy interface to do this but it requires some additions to the application.  First up, in the ```routes.db``` file I need to add:

    require 'sidekiq/web'
    
to the top of the file and also:

    Sidekiq::Web.use Rack::Auth::Basic do |username, password|
      username == ENV["SIDEKIQ_USERNAME"] && password == ENV["SIDEKIQ_PASSWORD"]
    end if Rails.env.production?
    mount Sidekiq::Web => '/sidekiq'
    
within your routes.  Note that I've used the [Figaro Gem](https://github.com/laserlemon/figaro) to store my ENV values.  Therefore after I upload to Heroku I need to run the command ```figaro heroku:set -e production``` in order to set these values in my production environment.

In addition, I need to add the following to my Gemfile:

    gem 'sinatra', :require => nil
    
and then ```bundle install```.  This is because the Sidekiq interface is build with Sinatra.

With that done I can now visit my application on ```http://localhost:3000/sidekiq``` and I will see the Sidekiq interface with a grand total of zero jobs!

If I log now out of my application and then register a new user I can look at the Sidekiq interface and I can see that one job has been successfully processed.

It's that simple! All I need to do now is make sure my tests still pass.

## Tests

As things stand my tests will fail because tests such as this are looking at ActionMailer::Base.deliveries:

    context "sending emails" do
      context "valid input details" do

        before { post :create, user: { email_address: 'knoxjeffrey@outlook.com', password: 'password', full_name: 'Jeff Knox' } }
        after { ActionMailer::Base.deliveries.clear }

        it "sends out the email" do
          expect(ActionMailer::Base.deliveries.last.to).to eq(['knoxjeffrey@outlook.com'])
        end

        it "sends email containing the users full name" do
          expect(ActionMailer::Base.deliveries.last.body).to include("Jeff Knox")
        end
      end

      context "invalid input details" do
        before { post :create, user: { email_address: 'junk' } }
        after { ActionMailer::Base.deliveries.clear }

        it "does not send an email" do
          expect(ActionMailer::Base.deliveries).to be_empty
        end
      end
    end
    
To get around this I can test the workers inline which means that I can use Sidekiq synchronously with the request/response locally rather than asynchronously.  All this needs is a change to my ```spec_helper.rb``` file by adding:

    require 'sidekiq/testing'
    Sidekiq::Testing.inline!
    
All my tests now pass and that's it.  We'll be covering this topic at a production level later in the course so look out for that blog post!