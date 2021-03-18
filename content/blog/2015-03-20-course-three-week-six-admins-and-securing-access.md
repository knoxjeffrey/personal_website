---
layout: post
title:  "Tealeaf Academy Course Three/Week Six - Admins And Securing Access"
date:   2015-03-20 14:42:00
categories: Tealeaf Academy
banner_image: ""
featured: false
comments: true
---

There are parts of your site that you only want certain people to be able to access and I'll use this post to walk through the steps of adding an admin to the MyFLiX site on the Tealeaf Academy Course.  I want to give that admin the authority to add a video on the site but regular users should not be able to this.

<!--more-->

First up I need to add an admin column to my users table:

    rails g migration add_admin_to_users
    
then write the migration:

    class AddAdminToUsers < ActiveRecord::Migration
      def change
        add_column :users, :admin, :boolean
      end
    end
    
followed by ```rake db:migrate```.

I want this to add the video with the link ```/admin/add_video``` so within ```routes.rb``` I need to add a namespace:

    namespace :admin do
      get '/add_video', to: 'videos#new'
      resources :videos, only: [:create]
    end
    
Name spacing like this is really useful to stop controllers getting too large especially if you have lots of different roles on your site like admin, moderator, etc.  With it name spaced each role can have their own controller for the site features you need to protect.
    
With that done I need a new controller under ```controllers/admin/videos.rb``` which will look like:

    class Admin::VideosController < AdminsController

      def new
        @video = Video.new
      end

      def create

      end

    end
    
Note that I am inheriting from ```AdminsController``` rather than the usual ```ApplicationController```.  The ```AdminsControlller``` will be as follows:

    class AdminsController < ApplicationController
      before_filter :require_user
      before_filter :require_admin

      private

      def require_admin
        unless current_user.admin?
          flash[:danger] = "You do not have access to that area."
          redirect_to root_path
        end
      end
    end

I already have ```before_filter :require_user``` defined in ```ApplicationController``` but I need to add the ```require_admin``` method.  The reason for inheriting from ```AdminsController``` is because I want to ensure that I never forget to add the before filter (very important that ordinary users never access this area) and by inheriting from ```AdminsController``` this will happen automatically so need for me to worry about it.

In addition to the controller I need to add a view file under ```views/admin/videos/new.html.haml```.

Now I can go to the rails console and make one of my users an admin:

    user = User.first
    user.update_column(:admin, true)

Obviously there should be tests to back this up and that is mainly straightforward so I didn't cover it but I did learn an interesting feature of testing in this lesson.

In my project I'm using Fabricator to create my user objects like so:

    Fabricator(:user) do
      email_address { Faker::Internet.email }
      password { Faker::Internet.password(6) }
      full_name { Faker::Name.name } 
      admin false
    end
    
 and I also use a macro to set the current user in the system:
 
    def set_current_user_session
      valid_user = Fabricate(:user)
      session[:user_id] = valid_user.id
    end
    
This works well for ordinary users but I need the session to specify that the user is also admin so I used another macro:

    def set_current_admin_session
      valid_user = Fabricate(:admin)
      session[:user_id] = valid_user.id
    end
    
This time I'm fabricating an admin which I do not yet have defined.  Interestingly I can make my admin inherit from my user fabricator:

    Fabricator(:admin, from: :user) do
      admin true
    end
    
This way the admin gets the ```email_address```, ```password``` and ```full_name``` from user but alters ```admin```.

That's it for this post, fairly straight forward but handy to know.