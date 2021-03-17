---
layout: post
title:  "Tealeaf Academy Course Two/Week Three - Authentication"
date:   2015-01-16 16:10:00
categories: Tealeaf Academy
banner_image: "/media/password.jpg"
featured: true
comments: true
---

Adding user authentication to my application is obviously very important if I want to restrict what actions people can take on my site if they aren't registered and to track the behaviour of users that are registered.  There's quite a few steps to this so I thought I'd make a separate blog post to step through it.

<!--more-->

In order to authenticate a user I will need a means to add a password to the database.  Rails has a built in method has_secure_password that can do this for me although there are certain things that need to be done first.  

I obviously can't just store the password itself in the database so has_secure_password requires the bcrypt-ruby gem and it provides a hashing algorithm to securely store the password.  This is a one way hash because there is no getter method which means the password cannot be retrieved for security purposes.  A hash algorithm basically turns any amount of data into a fixed length string of characters called a fingerprint.  Additional security is added by appending or prepending a random string, called a salt, to the password before hashing.  I can add this gem to the Gemfile:

    gem 'bcrypt-ruby', '~> 3.0.0'
    
has_secure_password also requires a password_digest column in the database for it to work.  For this I need to generate a migration with the command ```rails generate migration add_password_digest_to_users``` and then in the migration file we add the necessary column to my users table:

    def change
      add_column :users, :password_digest, :string
    end 
    
A ```rake db:migrate``` will then add this column.  has_secure_password has methods that can set and authenticate a password.  One such method is 'password' which is a virtual attribute that acts as a setter to set values into password_digest.  There is also an authenticate method which return false if the password is incorrect but returns the object (in this case the user) if the password is correct.

has_secure_password has built in validations but in this case I am choosing to not use them (I'll add my own) by adding the following code to the users model:

    has_secure_password validations: false
    
If you are interested in what validations come with has_secure_password you can read more in the [api documentation](http://api.rubyonrails.org/classes/ActiveModel/SecurePassword/ClassMethods.html). I now need to setup my own validations for when the user is logging in.  This will consist of 2 fields username and password and the validations are:

    validates :username, presence: true, uniqueness: true
    validates :password, presence: true, on: :create, length: {minimum: 5}
    
Notice that I only validate the password on creation of a new user because I don't want to have to keep entering the password if the user is logged in and changing some details in their user profile like address or contact number.  Also remember that I don't have a password column but this is actually a virtual attribute and I am able to create validations on this.

For now I am going to ignore the rest of the process for registering a new user (this will be dealt with at the end of the post) but simply handle logging in and logging out.  First up I need to setup the routes for logging in and logging out.  Up until now the routes have been based on tables in the database.  The first thought might be to use the users table but these routes are only for creating, editing, etc a user and not logging them in/out.  What I need is something like the idea of a session which persists and that handles the logged in/out status.  In this case I'm not using resources because I want to set my own routes:

    get '/login', to: 'sessions#new'
    post '/login', to: 'sessions#create'
    get '/logout', to: 'sessions#destroy'
    
Notice that I'm still following the Rails conventions of new, create and destroy.  Obviously I need a SessionsController for this with the new, create and destroy methods:

    def new; end

    def create
      user = User.find_by(username: params[:username])

      if user && user.authenticate(params[:password])
        session[:user_id] = user.id #this is backed by the browsers cookie to track if the user is authenticated
        flash[:notice] = "You've logged in!"
        redirect_to root_path
      else
        flash[:error] = "There is a problem with your username or password"
        redirect_to login_path
      end
    end

    def destroy
      session[:user_id] = nil
      flash[:notice] = "You've logged out"
      redirect_to root_path 
    end
    
New is the only controller method I need a view for and this uses a non model backed form this time that submits a post request to the /login route:

    <div class='row'>
      <div class="span8 well">
        <%= form_tag '/login' do %>

          <div class="control-group">
            <%= label_tag :username %>
            <%= text_field_tag :username %>
          </div>

          <div class="control-group">
            <%= label_tag :password %>
            <%= password_field_tag :password %>
          </div>
          <br/>
          <%= submit_tag 'Login', class: "btn btn-primary" %>
        <% end %>
      </div>
    </div>
    
There are a couple of things to note from the other methods in the SessionsController starting with the create method.  Notice that user is not an instance variable because I'm not using model backed form and the way params are handled is slightly different.  Notice also the use of a session.  This is backed by a browser cookie and will be used to track if a user is authenticated.  It's important not to use a user object but rather the user.id for the session due to size restraints of the cookie.  When the user logs out then the destroy route is followed and sets the session cookie as nil.

Throughout the application I want to keep track of whether the user is logged in or out and display the relevant buttons in the navigation bar so the best place to do this is in the navigation bar itself:

    <% if logged_in? %>
      <div class='nav_item'>
        <%= link_to 'New Post', new_post_path, class: "btn btn-success btn-small" %>
      </div>
      <div class='nav_item'>
        <%= link_to 'Log Out', logout_path, class: "btn btn-small" %>
      </div>
    <% else %>
      <div class='nav_item'>
        <%= link_to 'Log In', login_path, class: "btn btn-small" %>
      </div>
    <% end %>

Notice this is wrapped in a logged_in? if statement and this is used to display buttons depending on whether or not the user is logged in.  This is a helper method that will actually be added to application_controller.rb because it will also be used by a controller, not just the view.  This requires a helper_method to be added to application_controller to make it available to the views and my complete code looks like so:

    class ApplicationController < ActionController::Base
      # Prevent CSRF attacks by raising an exception.
      # For APIs, you may want to use :null_session instead.
      protect_from_forgery with: :exception

      #allow these methods to be used in the views as well
      helper_method :current_user, :logged_in?

      def current_user
        #if there's an authenticated user, return the user obj
        #else return nil
        #
        #uses memoization to stop the database being hit every time current_user method is called.  
        #If it's the first call then the database is hit and subsequent calls will use the value stored in the @current_user instance variable
        @current_user ||= User.find(session[:user_id]) if session[:user_id]
      end

      #takes the current user_method and turns it into a boolean.  !!nil returns false 
      def logged_in?
        !!current_user 
      end

    end

The comments in the code should explain how this all works.  I can now use ```<% if logged_in? %>``` to hide elements on my pages depending on whether the use is logged in like when creating a new post, editing a post, creating a comment, etc.  However this does not stop the path actually being reached if the user typed in something like /posts/new if they're not logged in.  In order to do this I must shut down certain routes with a before_action in my controllers and my posts controller would look like this for example:

    before_action :require_user, except: [:index, :show]
    
This needs a require_user method which I will place in application_controller because this is a method I will use in multiple controllers:

    def require_user
      if !logged_in?
        flash[:error] = "You must be logged in to do that"
        redirect_to root_path
      end
    end

I just continue to use this method in all the controllers where it is required.

One last thing I had to do in my application was to look at my ERD to see what tables a user was associated with and for this it was posts and comments.  The foreign key in both tables (user has many posts/comments) was user_id although I had renamed it creator to make it more descriptive.  This meant that for the create method in PostsController I had @post.creator = current_user and in CommentsController it was @comment.creator = current_user.  Note that current_user can also return nil but this won't happen in this case because I have blocked off the routes so posts and comments can only be made if there is a session[:user_id].

At this point, creating a user registration page is pretty straight forward. First up I'll handle the routes for creating a new user:

    resources :users, only: [:create]
    
In this I have just used resources for the :create route but not :new.  This is really for aesthetic reasons because I don't want the path for user registration to be /users/new but rather /register and for this I will create my own route:

    get '/register', to: 'users#new'

The UsersController is quite easy for this:

    def new
      @user = User.new
    end
  
    def create
      @user = User.new(user_params)

      if @user.save
        session[:user_id] = @user.id
        flash[:notice] = "You are registered"
        redirect_to root_path
      else
        render :new
      end

    end

The only thing of note here is the session[:user_id] which I'm using to automatically log a user in after registration.  The new user form is another form_for based on @user and is pretty similar to what I have done in the last blog post so I won't go into detail here.  I have also already added the validations in the user model (at the beginning of the post) so I'm good to go!

I then added more routes for the user and resources now loks like this;

    resources :users, only: [:create, :show, :edit, :update ]
    
These routes were added so I could edit the user profile and also have a page that displayed all the details about the user including their posts.  I made some changes in my navigation bar to handle this and most of the new pages were fairly straightforward by using forms and partials, however there were a couple of things to note.

The first thing was the ability to turn on/off sections of a partial and this was needed in my comments partial to allow more detail to be shown on the :show route for the user.  The code for the partial was:

    <%= render 'comments/comment', comment: comment, show_post: true %>
    
At the end I've passed in a boolean show_post and to handle this I can wrap a ```<% if show_post %>``` around the sections I want the boolean to apply to.  However, in cases where it is false I don't have to explicitly pass this in by using the following code at the start of the partial:

    <% show_post ||= false %>
    
The final thing was to block off the ability for a logged in user to edit the profile of another user by adding a before action in the UsersController:

    before_action :require_same_user, only: [:edit, :update]

and the method...

    def require_same_user
    if current_user != @user
      flash[:error] = "You're not allowed to do that"
      redirect_to root_path
    end
  end

That's it for this blog post but I'm only about halfway through the week so I'll be following this post up with another one to cover the rest of the material.  Pretty cool though that I can now manage the authentication of users on my site!


