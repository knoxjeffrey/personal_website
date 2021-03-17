---
layout: post
title:  "Tealeaf Academy Course Three/Week Seven - Beyond MVC"
date:   2015-04-03 00:20:00
categories: Tealeaf Academy
banner_image: ""
featured: false
comments: true
---

In this post I'm going to talk about how to manage your application as it grows and discuss ways in which you can keep the code base clean.

<!--more-->

## Decorators

The first thing I want to talk about is decorators in Rails.  Ideally you should decouple your Rails models from any kind of code that deals with presentation otherwise you end up with a bloated model full of code that shouldn't really belong there.  Think of it this way, if you persist data one way in the database but present it in a different way then that is a good signal to use a decorator.  You may be thinking that you could just use a helper for this but there is a distinction between a helper and a decorator.  A helper is a more generic method which can be used for different kinds of objects whereas a decorator should act only with one model and shouldn't take parameters if at all possible.  Here's an example snippet from view in the MyFLiX application I have been building in the Tealeaf Academy course:

    %article.video
      .container
        .row
          .video_large_cover.col-sm-7.col-sm-offset-1
            %img(src="#{@video.display_large_video_image}")
          .video_info.col-sm-3
            %header
              %h3= @video.title
              %span Rating: #{@video.average_rating}
            %p= @video.description
            .actions
              %a.btn.btn-primary(href="#{@video.video_url}") Watch Now
              = link_to_my_queue(@video)
              
You can see that I have two methods in here, ```display_large_video_image``` and ```average_rating```.  These methods are primarily concerned with the presentation in my view and initially I had moved this into the ```video.rb``` model:

    class Video < ActiveRecord::Base

    ...

      # If large_cover is present then return image url,  otherwise display dummy image
      def display_large_video_image
        self.large_cover.present? ? self.large_cover_url : "http://dummyimage.com/665x375/000/fff.png&text=No+Preview+Available"
      end

      # calulate average rating for video to 1 decimal point
      def average_rating
        self.reviews.average(:rating) ? "#{reviews.average(:rating).round(1)}/5" : 'N/A'
      end

    end
    
A better way to deal with this is to create a new file under ```app/decorators/video_decorator.rb``` and move the code into that file:

    class VideoDecorator < Draper::Decorator
      delegate_all

      # If large_cover is present then return image url,  otherwise disply dummy image
      def display_large_video_image
        object.large_cover.present? ? object.large_cover_url : "http://dummyimage.com/665x375/000/fff.png&text=No+Preview+Available"
      end

      # calculate average rating for video to 1 decimal point
      def average_rating
        object.reviews.present? ? "#{reviews.average(:rating).round(1)}/5" : 'N/A'
      end
    end
    
I am using the [draper gem](https://github.com/drapergem/draper) to make it easy to use this VideoDecorator in my controller.  All I have to do is just use the ```.decorate``` method in my controller:

    class VideosController < ApplicationController

      ...

      def show
        @video = Video.find(params[:id]).decorate
        @review = Review.new
      end
      
      ...

    end
    
The one issue this creates is that my view will expect all method calls on ```@video``` to be on the ```VideoDecorator``` whereas ```@video.description``` in my view needs to be called on the video model.  To get around this I have used ```delegate_all``` in my ```VideoDecorator``` class.  This allows all the method calls that are not defined in the ```VideoDecorator``` class to be passed through to the video model.

Draper additionally accesses the decorated model as ```object``` as you can see in my ```VideoDecorator``` class.

This all works well but I came across [this article](http://thepugautomatic.com/2014/03/draper/) which made me see there was an alternative way to do this that didn't require a gem and also makes it more obvious where the method was called without really requiring much extra code - use a plain old Ruby object (PORO).  I'll show the changes below:

The view:

    %article.video
      .container
        .row
          .video_large_cover.col-sm-7.col-sm-offset-1
            %img(src="#{@video_presenter.display_large_video_image}")
          .video_info.col-sm-3
            %header
              %h3= @video.title
              %span Rating: #{@video_presenter.average_rating}
            %p= @video.description
            .actions
              %a.btn.btn-primary(href="#{@video.video_url}") Watch Now
              = link_to_my_queue(@video)

The presenter class (no longer using decorator terminology):

    class VideoPresenter
      def initialize(video)
        @video = video
      end

      # If large_cover is present then return image url,  otherwise display dummy image
      def display_large_video_image
        video.large_cover.present? ? video.large_cover_url : "http://dummyimage.com/665x375/000/fff.png&text=No+Preview+Available"
      end

      # calculate average rating for video to 1 decimal point
      def average_rating
        video.reviews.present? ? "#{video.reviews.average(:rating).round(1)}/5" : 'N/A'
      end

      private

      attr_reader :video
    end

The controller:

    class VideosController < ApplicationController

      ...

      def show
        @video = Video.find(params[:id])
        @video_presenter = VideoPresenter.new(@video)
      end

      ...

    end
    
As you can see there is a little extra code but that only takes an extra 30secs to write so it's hardly an issue and I feel I have extra clarity in my code by doing it this way.

## Policy Objects

An example of when to use policy objects is when you want to enforce different access control policies. For example you could have users that sign up for bronze, silver and gold access to your application.  Here's a simple example where I create a new model class in ```app/policies/user_level_access.rb```

    class UserLevelAccess
      attr_reader :user

      def initialize(user)
        @user = user
      end

      def bronze?
        user.email_confirmed? && user.plan.bronze?
      end

      def silver?
        user.email_confirmed? && user.plan.silver?
      end

      def gold?
        user.email_confirmed? && user.plan.gold?
      end
    end
    
Then in a controller action I can decide what happens depending on the level of access the user has.  Say for example I'm running an online project management application and I want to charge different amounts for each new project depending on the plan the user has purchased.  Without the policy object class my controller action could look like this example:

    class ProjectController < ApplicationController

      ...

      def create
        @project = Project.new(project_params)

        if current_user.email_confirmed? && current_user.plan.gold?
          ...
        elsif current_user.email_confirmed? && current_user.plan.silver?
          ...
        else
          ...
        end
      end

      ...

    end

but with the ```UserLevelAccess``` class I now have:

    class ProjectController < ApplicationController

      ...

      def create
        @project = Project.new(project_params)

        user_level_access = UserLevelAccess.new(current_user)

        if user_level_access.gold?
          ...
        elsif user_level_access.silver?
          ...
        else
          ...
        end
      end

      ...

    end

Designing it this way means my code is re-useable if I need to set the policy in multiple places and also easily maintainable because if I need to make any changes to the the access then I only have to do it in one place, which is especially beneficial if the logic becomes quite complicated.

## Domain Objects

Domain objects in Rails typically inherit from ```ActiveRecord::Base``` and are responsible for persisting or saving data attributes to a relational database table.  However there will be cases in applications where the models do not map to database tables.  I'll extend my example from above to explain when this might be useful:

    class ProjectController < ApplicationController

      ...

      def create
        @project = Project.new(project_params)

        user_level_access = UserLevelAccess.new(current_user)

        if user_level_access.gold?
          new_credit_balance = current_user.current_credit_balance -1
        elsif user_level_access.silver?
          new_credit_balance = current_user.current_credit_balance -2
        else
          new_credit_balance = current_user.current_credit_balance -3
        end

        current_user.current_credit_balance = new_credit_balance
        current_user.save

        if new_credit_balance < 0
          ...
        elsif current_user.current_credit_balance < 10
          ...
        end
        
      end
      
      ...

    end
    
Here you can see that a user is having their balance deducted depending on their current plan.  Each time I want to get the current balance I have to go through current_user and if I want the data to persist I have to do a ```current_user.save```.  However, I would like to extract the concept of credit into it's own model so I can operate on that directly rather than having to go through users:

    class Credit

      attr_accessor :credit_balance, :user

      def initialize(user)
        @credit_balance = user.current_credit_balance
      end

      def -(number)
        credit_balance = credit_balance - number
      end

      def save
        user.current_credit_balance = credit_balance
        user.save
      end

      def depleted?
        credit_balance < 0
      end

      def low_balance?
        credit_balance < 10
      end
    end
    
Now I can change my controller to be this:

    class ProjectController < ApplicationController

      ...

      def create
        @project = Project.new(project_params)
        credit = Credit.new(current_user)

        user_level_access = UserLevelAccess.new(current_user)

        if user_level_access.gold?
          credit = credit - 1
        elsif user_level_access.silver?
          credit = credit - 2
        else
          credit = credit - 3
        end

        credit.save

        if credit.depleated?
          ...
        elsif credit.low_balance?
          ...
        end
      end
      
      ...

    end
    
Doing things this way not only makes the code easier to read but also everything based around credit is located in one place so it will be easy to test, easy to reuse in other parts of the application and also easy to change the business logic in the future.

## Service Objects

I can use service objects to make the business process of credit deduction in the above example more explicit.  Create a new file under ```app/services/credit_deduction.rb``` and it will look like this:

    class CreditDeduction
      attr_accessor :credit, :user
      
      def initialize(user)
        @credit = Credit.new(user)
        @user = user
      end

      def deduct_credit
        if UserLevelPolicy.new(user).premium?
          credit = credit - 1
        else
          credit = credit - 2
        end

        credit.save

        if credit.depleted?
          ...
        elsif credit.low_balance?
          ...
        end
      end
    end
    
You will notice that I have pulled out all of the code related to credit deduction from the controller into this service object.  With this done my controller has been cleaned up considerably and is much more explicit:
    
    class ProjectController < ApplicationController

      ...

      def create
        @project = Project.new(project_params)
        CreditDeduction.new(current_user).deduct_credit
      end  
      
      ...
    end
    
That's all for this post, I've gone through some examples of how to extract code and hopefully this will give you some ideas of how to manage your code as your application grows.