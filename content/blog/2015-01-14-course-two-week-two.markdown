---
layout: post
title:  "Tealeaf Academy Course Two/Week Two"
date:   2015-01-14 08:15:00
categories: Tealeaf Academy
banner_image: "/media/mvc.jpg"
featured: true
comments: true
---

This week involved more work on controllers and views with a focus on binding a form to an object by using ```form_for```.  This is another really handy feature of rails that can save a lot of manual setup work.

<!--more-->

##Form_for

As an example in my application, to create a new post my controller method would look like this:

    def new
      @post = Post.new
    end
    
My ```new.html.erb``` view file then has a form to allow the user to fill in the post which could look like:

    <%= form_for @post do |f| %>

      <%= render 'shared/errors', controller_object: @post %>

      <div class="control-group">
        <%= f.label :title %>
        <%= f.text_field :title %>
      </div>

      <div class="control-group">
        <%= f.label :url %>
        <%= f.text_field :url %>
      </div>

      <div class="control-group">
        <%= f.label :description %>
        <%= f.text_area :description, rows: 5 %>
      </div>

      <br/>
      <%= f.submit @post.new_record? ? "Submit Post" : "Update Post", class: "btn btn-primary" %>
    <% end %>
    
Notice that @post is passed from the controller to the form_for.  The form_for method yields a form builder object (f), and methods to create form controls are called on the form builder object f.  Title, url and description should match the column names that are in my posts table in the database.

Notice the last line:

    <%= f.submit @post.new_record? ? "Submit Post" : "Edit Post", class: "btn btn-primary" %>
    
In my case I am using this same form for my new and edit views so this is a handy way to decide what text to display on the button depending on whether the post is new or an edit.

Also notice the render at the top:

    <%= render 'shared/errors', controller_object: @post %>
    
This is a means to handle form error messages.  Using render holds onto the instance variable @post and the partial will be in a file called _errors.html.erb in the shared folder.  My code for this looks as follows:

    <% if controller_object.errors.any? %>
      <div class="alert alert-error">
        <h5>
            <%= pluralize(controller_object.errors.count, 'error') %> in this form:
        </h5>
        <ul>
            <% controller_object.errors.full_messages.each do |msg| %>
                <li><%= msg %></li>
            <% end %>
        </ul>
      </div>
    <% end %>
    
Errors.any? is a rails method that will return true or false depending on whether there are errors.  errors.full_messages is a handy method to return an array of strings that holds each error message and this is nice and easy to parse in order to display the messages.  I also found this handy pluralize method that in this case will say either error or errors in the error message depending on the number of errors.  Nice little touch because it doesn't look as good when you get a message saying, "1 errors in this form".

##Nested Routes

A nested route in my application to create comments on a post looks like this:
 
    resources :posts, except: [:destroy] do
      resources :comments, only: [:create]
    end
    
The url path for creating a comment would then be posts/id/comments.  Nested routes are useful to stop the top name space becoming polluted and it makes sense in this case to nest it because a comment is related to a post.
    
To make a comment the user visits the posts/id url to see the post and leave a comment.  The form_for in this case will take multiple variables - @post and @comment.  These variables come from the show method in the posts controller:

    def show
      @post = Post.find(params[:id])
      @comment = Comment.new
    end

In rails you use an array to handle multiple variables:

    <div class='row'>
      <div class='span8'>
        <%= form_for [@post, @comment] do |f| %>
          <%= render 'shared/errors', controller_object: @comment %>

          <div class="control-group">
            <%= f.label :body, "Leave A Comment" %>
            <%= f.text_area :body, rows: 5, class: 'span6' %>
          </div>
          </br>
          <%= f.submit "Create Comment", class: "btn btn-primary" %>
        <% end %>
      </div>
    </div>
    
@post is the parent object and this form will submit to the /posts/id/comment url as a post request which is handled by the create method in the comments controller.  For this form we need to make sure there is are @post and @comment variables in both the show method of the posts controller and the create method of the comments controller.
    
In the create method of the comments controller I had this code:

    @post = Post.find(params[:post_id])
    @comment = @post.comments.build(params.require(:comment).permit(:body))
    
Line 2 is exactly the same as the below code except in a more concise style:
    
    @comment = Comment.new(params.require(:comment).permit(:body))
    @comment.post = @post
    
##Checkboxes

I found checkboxes to be quite tricky to implement and needed quite a bit of studying of the documentation to make sense of how to use them with an object backed form.  In my application I was using them to add categories to a new post or when editing a post and my final code looked like this:

    <%= f.collection_check_boxes(:category_ids, Category.all, :id, :name) do |box| %>
      <% box.label(class: "checkbox inline") { box.check_box(class: 'checkbox') + box.text } %>
    <% end %>
    
To understand this better I'll show the info from the api documentation below:

    collection_check_boxes(object, method, collection, value_method, text_method, options = {}, html_options = {}, &block) public
    
You'll notice that I don't have an object in my code but this could be left out because I already had an associated object in f by using form_for.  I also used a block for the layout the checkboxes.
    
One other thing to mention is that category_ids returns a key/value pair of all the categories associated with the post and the values for the key is stored in an array.

Once I had this up and running I had the categories displaying on a new post and the correct categories were being associated with a post when I went to edit the post. One thing I had trouble with and needed the solutions for help was when saving the post because the checkboxes I had clicked were not being recorded in the database.  I had made a change to params.require in the posts controller to allow the categories to be associated with the post by just adding ```:category_ids```.  However, remember from above that category_ids are in an array so this had to be handled in a slightly different way: 

    params.require(:post).permit(:title, :url, :description, category_ids: [])

##Locales

One of the things I wanted to do in my application was to change the error messages to match the labels I had on my forms because they automatically displayed the column names from my database.  After some helpful assistance from one of the tutors at Tealeaf Academy I was pointed in the direction of using locales and this is an example from my application:

    activerecord:
      attributes:
        comment:
          body: "Comment"
          
Locales provides you with a means for internationalization/localization of your Rails application and as part of this, every static string in the Rails framework - e.g. Active Record validation messages, time and date formats - has been internationalized, so localization of a Rails application means "over-riding" these defaults.  In the case of my example the default is the database column so the code was a means to over-ride this.  However if I alway want to change the name of the column then I might be better actually changing the column name by doing a migration...
          
    rails generate migration rename_body
    
...and in the migration file adding the code
    
    def change
      rename_column :comments, :body, :comment
    end 
    
I'm not really sure if there's an advantage to doing this but at any rate it was a nice introduction to locales.
    
##Helpers
   
Helpers are used to extract repetitive presentation logic from the view files.  I made use of this a few times in my application:

    #prepend http:// to url if it is missing
    def url_with_protocol(url)
      url.starts_with?('http://') ? url : "http://#{url}"
    end

    #modify date presentation.
    #
    #example Jan 4th, 2015 20:52 UTC
    def friendly_date(date)
      date.strftime("%b #{date.day.ordinalize}, %Y %H:%M %Z")
    end

##Extract

To finish off I just want to mention a few other ways to extract common code in an application.  You can extract common methods used by multiple controllers to the file application_controller.rb.  Another way to extract common code in a controller is by using before_action to extract common pre-action code in the controller methods. Here's an example from my application:

    before_action :set_post_params, only: [:show, :edit, :update]

    def set_post_params
      @post = Post.find(params[:id])
    end
 
This can look a bit confusing for a beginner because my method for show as an example could look empty:

    def show; end

This is another of things in Rails that initially looks confusing but is simple once you know what is going on.

Well, that's it for another week and lots more information to take in. Onwards to week three!
    
