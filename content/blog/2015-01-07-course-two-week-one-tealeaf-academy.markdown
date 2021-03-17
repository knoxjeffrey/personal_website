---
layout: post
title:  "Tealeaf Academy Course Two/Week One"
date:   2015-01-07 13:38:49
categories: Tealeaf Academy
banner_image: "/media/rails.jpg"
featured: true
comments: true
---

This weeks post is going to be more of a reference guide for some of the important steps in creating a Rails application that I have come across in the first week of the Rails course.  There's a heck of a lot to take in and this will be a handy point of reference for me.

<!--more-->

##Decide On Database Schema

The first step is to decide on the database schema and sketching out an entity relationship diagram is probably the best way to do this. This allows me to sketch out the table names, column names, datatypes, table relationships, foreign keys and also to change the association name between tables to make it more descriptive.  With this laid out I have everything I need to create my database.

Rails makes it super easy to create database tables.  For example, if I want a posts table in the database (all database table names are plural) then I can create a migration file with the terminal command ```rails generate migration create_posts```.  This automatically creates a migration file with the following code:

    class CreatePosts < ActiveRecord::Migration
      def change
        create_table :posts do |t|
        end
      end
    end
    
The create table method has already declared the posts table name for me because I used the ```create_posts``` command in the terminal (one of the many Rails conventions).  All I have to do now is fill out the column names for posts along with their data types.  This now looks as follows (note that timestamps below automatically creates column names of created_at and updated_at):

    class CreatePosts < ActiveRecord::Migration
      def change
        create_table :posts do |t|
          t.string :title
          t.string :url
          t.text :description
          t.integer :user_id
          t.timestamps
        end
      end
    end
    
Excellent, all done and all I have to do now is run ```rake db:migrate``` from the command line to create my table in the database.
    
##Models

Rails makes use of Active Record to make it nice and easy to connect to the relational database that has just been created through a technique known as Object Relational Mapping (ORM).  The idea of convention over configuration is what makes Active Record so powerful and it's important to know the naming conventions in order to make use of it.

The first convention is the model file name.  In order for Active Record to map to the posts database table, the file must be the singular of the table name: ```post.rb```.  Within that file you must define a class called ```Post``` which represents the database table and would look like:

    class Post < ActiveRecord::Base

    end

By subclassing ```ActiveRecord::Base``` I have now mapped to the posts table in the database.  Every object created from this class now represents a row of the table eg, ```post = Post.find(2)``` creates a post object that represents the row in the posts table with id of 2.   The attributes of the object represents the column names and Active Record has automatically created getter and setter methods for each column so I can retrieve and change the information eg, ```post.title``` will get the data from the title column of the row in the posts table with id 2.

A nice way to test this out is in the terminal by typing ```rails console``` or if you want to make sure you don't make any commits to the database then you can use ```rails console --sandbox```.

Within the class I can then define the relationships between tables and again naming conventions are important.  Below is an example for the Posts class:

    class Post < ActiveRecord::Base
      belongs_to :creator, foreign_key: 'user_id', class_name: 'User'
      has_many :comments
      has_many :post_categories
      has_many :categories, through: :post_categories
    end

There is some important information to take note of from this.  The first line states a ```belongs_to``` relationship.  This means that the posts table has a many-to-one relationship to a table, in this case users, and uses a foreign key of user_id in posts to link to the primary key of id in users.  With normal Rails convention this line should read ```belongs_to :user``` but this is an example of configuration rather than convention in order to make the relationship more descriptive.  The line is essentially saying that creator is now the attribute to be used to represent the association rather than user_id.  Note that this does not alter the database column name and the foreign key is still user_id in the posts table. 

```has_many :comments``` and ```has_many :post_categories``` means that posts has a one-to-many relationship with the comments table and post_categories table.  The last line, ```has_many :categories, through: :post_categories``` is interesting because it lets me know that the post_categories table is actually a join table and that posts has a many-to-many relationship with categories.

##Routes And Controllers

Okay, so that's the model layer taken care of and now I have to handle the url requests to my application.  When a request comes in, the routes.rb file will have to handle the request and pass it on to a controller.

If my application has a request to http://somuchtolearn.com/posts for example, I would need to have a statement such as ```resources :posts``` in my routes.rb file in order to handle the request.  Rails will assume I have a controller file called ```posts_controller.rb``` which has a class of PostController.  Therefore, ```resources :posts``` is a quick way to map all HTTP verbs and URLs to controller actions in my PostsController class.  The basic class with no controller actions looks like as follows:

    class PostsController < ApplicationController

    end
    
How do I know what the controller actions will be?  I can use ```rake routes``` in the terminal or type the url http://localhost:3000/rails/info/ to get a list of all the controller actions I'll need to manage and this is shown below:

      HELPER        HTTP VERB       PATH                CONTROLLER#ACTION

    posts_path        GET     /posts(.:format)            posts#index
                      POST    /posts(.:format)            posts#create
    new_post_path     GET     /posts/new(.:format)        posts#new
    edit_post_path    GET     /posts/:id/edit(.:format)   posts#edit
    post_path         GET     /posts/:id(.:format)        posts#show
                      PATCH   /posts/:id(.:format)        posts#update
                      PUT     /posts/:id(.:format)        posts#update
                      DELETE  /posts/:id(.:format)        posts#destroy
                      
This is something I will be learning off by heart but I'm sure I'll be referring back to this quite a lot until I know it well!

This could be fine tuned by using ```resources :posts, only: [:index, :show]``` to create only the specified routes or ```resources :posts, except: [:destroy]``` to create all routes except the one specified.  If I keep all of the controller actions, the basic class template I create should look as follows:

    class PostsController < ApplicationController
      def index

      end

      def show

      end

      def new

      end

      def create

      end

      def edit

      end

      def update

      end

      def destroy

      end
    end

I can then set about defining the rules for each request.  An example for handling the ```posts#index``` and ```posts#show``` controller actions would look as follows:

    class PostsController < ApplicationController
      def index
        @posts = Post.all
      end

      def show
        @post = Post.find(params[:id])
      end

      def new

      end

      def create

      end

      def edit

      end

      def update

      end

      def destroy

      end
    end

You can see that I have created instance variables in the methods and this allows me to access them within my view templates which I will talk about next.

##Views

If a user requests a url of say http://somuchtolearn.com/posts, this will be handled by the index method of the PostsController. In order to render this url, the controller requires a folder called posts under the views folder and within that folder there needs to be an index.html.erb file.  The template for this could be as follows:

    <p class'lead'>
        All Posts
        <hr/>
    </p>

    <% @posts.each do |post| %>
      <div class='row'>
        <div class="span8 well">
          <% post.categories.each do |category|
            <span class='badge'><%= category.name %></span>
          <% end %>
          <h4><%= link_to post.title, post.url %></h4>
          <p><%= post.description %></p>
          <p>
            <span class='quiet'>posted by </span><%= post.creator.username %>
            <small>at <%= post.created_at %></small>
          </p>
          <span>
            <%= link_to("#{post.comments.size} comments", post_path(post))%>
          </span>
        </div>
      </div>
    <% end %>

Note my use of @posts in this template which is the instance variable created in the index method of the PostsContoller class.  Given what I have defined so far in my controller class I would also need a show.html.erb view file but I don't need to go through that here.

##Partials

Partials are an excellent way to extract code from my template that will be used repeatedly throughout my application - DRY springs to mind again!  For example, a lot of my views will use a header similar to the All Posts header above so I need to extract this code into a partial.  For this I can create a new folder called shared which indicates that the partial will be shared across all resources.  The file name for partials must begin with an underscore and in this case it could be _content_title.html.erb which would look as follows:

    <p class'lead'>
      <%= title %>
      <hr/>
    </p>
    
My index.html.erb code at the top could now be changed to:

```<%= render 'shared/content_title', title: "All Posts"%>```

In order to call the partial I must use the render command and also note that in this case I do not need to use the underscore for the file name.  The title variable in index is then passed into the title variable in the partial with value "All Posts".  This makes it very flexible and allows me to pass in any information as long as there are matching title variables.

Another piece of code that I might be using again throughout my application is the category for badges as shown by this code:

    <% post.categories.each do |category|
      <span class='badge'><%= category.name %></span>
    <% end %>
    
```post.categories``` will return an array of categories associated with that post and the code above iterates through the array to print out each category.  The code above could be replaced with:

    <%= render post.categories %>

To access the relevant partial I again need to use the render keyword but Rails has a specific convention of where it will look for the partial file in this case.  This code...

```<%= render post.categories %>``` 

...is the equivalent to the following Ruby code:

    <% post.categories.each do |category|
      <%= render 'categories/category', category: category %>
    <% end %>
    
This is another example of the power of conventions in rails.  Note that it will look for the partial in a folder called categories and the file name would be _category.html.erb.  The code in the partial would then be as follows (again note the matching variable names):

    <span class='badge'><%= category.name %></span>
    
##Done...Finally!

I know this has been a long post but there is so much to remember. I wanted to go through it all and write it down to improve my understanding of it and to let it all sink into my overloaded brain!

I understand now what they mean by Rails magic and whilst it's slow going at the moment, as I get used to the conventions then my workflow should speed up dramatically.  Interaction with the database through Active Record is amazing and so much better than having to write out cumbersome SQL code all the time for simple read and write requests.  Rails really does take away a lot of extra configuration that would normally need to happen and that is a great thing.  All I have to do now is remember the Rails conventions!



