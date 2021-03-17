---
layout: post
title:  "Tealeaf Academy Course Three/Week Four - Sending Emails"
date:   2015-03-10 11:26:00
categories: Tealeaf Academy
banner_image: ""
featured: false
comments: true
---

In todays post I want to talk sending automated emails in an example scenario for when a someone signs up as a user for your application.

<!--more-->

First up I have to create a new folder ```app/mailers``` if it doesn't already exist and within that folder create a file called ```app_mailer.rb```.  Within that file the code for sending the email looks as follows:

    class AppMailer < ActionMailer::Base
      def notify_on_user_signup(user)
        @user = user
        mail from: 'info@myapplication.com', to: user.email, subject: "Welcome to Application"
      end
    end
    
This is pretty self explanatory, the only thing of note is the instance variable which will be passed to a view template in folder ```app/views/app_mailer``` with the file called ```notify_on_new_user.html.haml```.  The file below is a really simple html template just for demonstration purposes:

    !!! 5
    %html(lang="en-US")
      %body
        %p
          Welcome to my application #{ @user.full_name }!
            
That's it, nice and simple! Obviously I now need a way to call ```notify_on_new_user``` so within my controller under the create action for a new user I simply need to include the following:

    def create
      @user = User.new(user_params)

      if @user.save
        AppMailer.notify_on_user_signup(@user).deliver
        redirect_to root_path
      else
        render :new
      end
    end
    
It's important to note that you must user ```.deliver``` as this is what will actually send the email.

As things, stand I can test this in my development environment by creating a new user and then checking the server logs for the info on the email.  This is fine for my basic email but if you have created a more complex html template for your email then it would be nice to check that it renders correctly.  Additionally for development mode I don't want to actually send emails.

The solution for this is to add the following to ```config/environments/development.rb```:

    config.action_mailer.delivery_method = :letter_opener
    
Letter opener is a gem that will actually open up the content of the email in my browser (without sending it) after I have created a new user and is added to my Gemfile as:

    group :development do
      gem 'letter_opener'
    end
    
and then ```bundle install```.  Perfect!

Obviously for my production version I want the emails to send so I need to add code to ```config/environments/production.rb```.  For the example below I'm setting the configuration up for Gmail:

    config.action_mailer.delivery_method = :smtp
    config.action_mailer.smtp_settings = {
      address:              'smtp.gmail.com',
      port:                 587,
      domain:               'example.com',
      user_name:            '<username>',
      password:             '<password>',
      authentication:       'plain',
      enable_starttls_auto: true  }
      
Whilst the above solution will work, it's not ideal to leave you user name and password exposed.  The solution to this is to use environment variables and there are several possible routes as described by [this article](http://railsapps.github.io/rails-environment-variables.html).

The solution I used was to add the Figaro gem, ```gem "figaro"``` and then ```bundle install```.  With this added, from the command line type ```figaro install``` and this will create a ```config/application.yml``` file and will automatically modify the ```.gitignore``` file to prevent the file being added into your git repository.

All you have to now is add the following to the newly created file:

    GMAIL_USERNAME: your_username
    GMAIL_PASSWORD: your_password
    
and now it's simply a case of editing the code in ```config/environments/production.rb``` to be as follows:

    config.action_mailer.delivery_method = :smtp
    config.action_mailer.smtp_settings = {
      address:              'smtp.gmail.com',
      port:                 587,
      domain:               'example.com',
      user_name:            ENV['GMAIL_USERNAME'],
      password:             ENV['GMAIL_PASSWORD'],
      authentication:       'plain',
      enable_starttls_auto: true  }

Now that I have the authentication details hidden, I need to make it work on my production server.  In my case I'll be using Heroku which is handy because the Figaro gem makes things really easy to setup.  All I need to type is:

    figaro heroku:set -e production
    
and that's it.  One thing to note is that Gmail isn't the best option to use because there's a good chance Google will see it as suspicious activity and block the emails.  I used my business account to test things worked although I had to change ```:enable_starttls_auto``` to false to make it work. We're going to cover commercial email providers next week in the course which should be a more suitable option.

That's a simple walkthrough of how to get email functionality working on your site, hope it proves to be useful.           