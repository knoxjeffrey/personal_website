---
layout: post
title:  "Tealeaf Academy Course Two/Week Four - Part 1"
date:   2015-01-24 15:09:00
categories: Tealeaf Academy
banner_image: ""
featured: false
comments: true
---

Using ajax in rails is similar to how I used ```method: 'post'``` for the vote up/down links in order to generate a form on the fly.  In this case, using ```remote: true``` generates html with a ```date-remote``` call.  Javascript in rails is looking for that ```data-remote``` call and then attaches itself to the element and converts the given link to an ajax call. An example using my code is helpful to explain:

    <%= link_to vote_post_path(post, vote: true), method: 'post', remote: true do %>
    
<!--more-->

If you're interested, this is a snippet of the html that is generated from my code:

    <a data-method="post" data-remote="true" href="/posts/13/vote?vote=true" rel="nofollow">

and what is happening is that the anchor tag is being transformed by rails javascript into a form by ```data-method``` and then submitted in an ajax way (asynchronously behind the scenes) by ```data-remote``` with all of the parameters being packaged correctly.  It's important to note that ```data-method``` and ```data-remote``` work together.

Previously when a vote was given, a POST request was made in the vote method in PostsController and CommentsController and then there was a redirect. As I'm now using ajax, I no longer want to redirect.  Instead I can do:

    def vote
      @vote = Vote.create(voteable: @post, creator: current_user, vote: params[:vote])
      respond_to do |format|
        format.html do
          @vote.valid? ? flash[:notice] = "Your vote was counted" : flash[:danger] = "You can only vote once"

          redirect_to :back
        end

        format.js 
      end
    end

Any non ajaxified requests will follow the format.html block and the js requests will follow format.js.  By not having a block for format.js it will try and do the default action of rendering a template of the same name as the action, in this case a js template, called vote.js.erb.  As with html.erb templates I will have access to the instance variables in the vote controller method.

In order to change the number after a vote is made, I need to get a handle on the number element.  For example in my post partial I currently have 

    <%= post.total_votes %>
    
so in order to get a handle on it I need to give it an id. This cannot be a hardcoded id because every row returned will need a unique identifier and this can be done like so:

    <span id="post_<%= post.id %>_votes"><%= post.total_votes %></span>
    
Now in my .js file 

  $("#post_<%= @post.id %>_votes").html("<%= @post.total_votes %>");
  
One important thing to remember is to ensure the post is an instance variable in the vote action within the controller to ensure it flows through to the js file.  The same goes for anything else I want to pass through.

##Slugging

Slugging is a way to hide the database ids to make the url more friendly and descriptive. It also has benefits in SEO ranking and a more descriptive url is more likely to be clicked on by a user.  It also prevents people getting an idea about the data that's in the database and improves site security.

As an example in my application I have a link to comments on the posts index page that looks like this:

    <%= link_to("#{post.comments.size} comments", post_path(post))%>
    
```post_path(post)``` is actually calling another method behind the scenes in order to return the id and the method that is actually called is ```post_path(post.to_param)```.  to_param is a method of ActiveRecord::Base and will automatically return the id as a string.  Therefore I need to override this method and because it is part of ActiveRecord::Base I have to do this in each of the models where an id would be returned in the url.  This seems to be repeated logic and can instead be moved into a module.

First though I need to add a column to each table where needed called slug (using posts table in this example):

    rails generate migration add_slug_to_posts
    
and then 

    def change
      add_column :posts, :slug, :string
    end
    
Alternatively I could make a migration of add_slugs if I had multiple slug columns to add and then just list an add_column for each table in the migration file.  Next I run rake db:migrate and then I need to generate the slug in the model based on the post title in this example:

    def generate_slug!
      self.slug = self.title.gsub(' ', '-').downcase
    end
    
    def to_param
      self.slug
    end

This generate_slug method is very basic at the moment but I'll show the full code in a later post that is much more robust and will also be a gem so it can be used by multiple classes and other applications.

Look at Active Record Callbacks to see when to generate the slug.  If you need to always keep the same url for bookmarking you can generate the slug only after creating the post but in this case I'm doing it ```before_save``` which means the slug will change after each save:

    before_save :generate_slug!

Then I need to add slugs to all my current posts, etc in my test database, etc. I can do this from the rails command line: 
    
    Post.all.each { |post| post.save }
    
This works because the validations runs the generate_slug method before the save.  You need to be very careful doing this in production.  It is much better to do this with a migration:

    class PopulatePostsSlugs < ActiveRecord::Migration
      def change
        Post.all.each { |post| post.save }
      end
    end

The ```set_post_params``` method has to change now because to_param is returning the slug rather than the id.  Currently I have:

    def set_post_params
      @post = Post.find(params[:id])
    end
    
so change this to:

    def set_post_params
     @post = Post.find_by(slug: params[:id])
    end
    
I need to now do the same in the other controllers.  Friendly id is a gem that could be used in the future but this was a good demonstration of how to do it yourself.

##Admin roles

To do this first define a set of roles. With each of those roles then list a set of permissions, ie. User has many roles and roles has many permissions. Example - a role could be moderator and the roles could be edit post, delete post, etc.  Then in the application you have to do things like check the user permissions when they are making a comment, voting, etc. Best to try and avoid this complicated structure unless it is absolutely necessary.

A better compromise for simple apps is have a role column on users and then specify any role you like.

    rails generate migration add_role_to_users
    
and then 

    def change
      add_column :users, :role, :string
    end
    
followed by ```rake db:migrate```

I can then add the checks for various roles to the User model

    def admin?
      self.role == 'admin'
    end
    
    def moderator?
      self.role == 'moderator'
    end
    
Change some of the user records in the test database to these roles to test it out.  Now say I want a requirement in my application that only admins can add categories.

Go to the CategoriesController add

     before_action :require_admin, except: [:show]
    
Now need to write the require_admin method in ApplicationController (may need to use this in several controllers)

    def require_admin
      access_denied unless logged_in? and current_user.admin?
    end
  
    def access_denied
      flash[:error] = "You are not allowed to do that"
      redirect_to root_path
    end
  
I also need to edit the button for adding a category to hide it to everyone except an admin:

    <% if logged_in? && current_user.admin? %>
      <li class='divider'></li>
      <li>
        <%= link_to(new_category_path) do %>
          <span class="glyphicon glyphicon-plus" aria-hidden="true"></span>
          New Category
        <% end %>
      </li>
    <% end %>
     
## Time zones

In order to set the default time zone, go to application.rb and uncomment the line:

    config.time_zone = 'Central Time (US & Canada)'
    
To look up valid string values for time zone go to rails console:

    rake time:zones:all
    
and choose the time zone.  Any time you change application.rb you have to restart the server.

Now I want to allow users to set their own time zone in their user profile:
    
    rails generate migration add_time_zone_to_users
    
and then 

    def change
      add_column :users, :time_zone, :string
    end
    
followed by rake db:migrate

On the users form partial I can now add a new label and field

    <div class="form-group">
        <%= f.label :time_zone %>
        <%= f.time_zone_select :time_zone, nil, {default: "Edinburgh"}, {class: "form-control"} %>
    </div>
    
Need to now add to strong parameters in UsersController

    def user_params
      params.require(:user).permit(:username, :password, :time_zone)
    end
    
I now want to change my helper method for displaying the date:

    def display_friendly_date(date)
      if logged_in? && !current_user.time_zone.blank?
        date = date.in_time_zone(current_user.time_zone)
      end
      
      date.strftime("%b #{date.day.ordinalize}, %Y %H:%M %Z")
    end
    
##Exposing APIs

API stands for Application Programming Interface and allows one piece of software to talk to another.  ReSTful APIs like Google or Twitters API works like a website, you make a call from the Client to the Server and get data back over the HTTP protocol.  ReSTful APIs use HTTP verbs to perform some actions on objects and they adhere to some principles that say how resources should be identified/represented and how they should be manipulated through those representations.

In rails you can specify what to do when different resources are requested and the default is .html if you request a url like /posts/something but there is also .js, .json, etc.  This is a GET call to my show resource so in my application I could do the following:

    def show
      @comment  = Comment.new

      respond_to do |format|
        format.html

        #this will give the json representation of my @post object by calling .to_json on the object (comes with                             #Active Record) on the object behind the scenes
        format.json { render json: @post }

        #similar for xml
        format.xml {render xml: @post }
      end
    end

Therefore /posts/something.json and /posts/something.xml are endpoints I will expose to my client or other applications in order to return data back in the requested format.

##Adding Custom Fonts

First I create a new folder under assets called fonts and then include any custom fonts I wish to use.  Add this code to application.rb to add the fonts I include to the asset pipeline:

    config.assets.paths << Rails.root.join("app", "assets", "fonts")

##Conclusion
These are just some of the topics I covered in the final week of course 2, I'm going to write up some more posts to cover the final topics.  I've been able to add some nice features to my application this week, I can't wait to see what else is coming up in the third course!
    
  