---
layout: post
title:  "Tealeaf Academy Course Two/Week Three - Voting"
date:   2015-01-20 15:30:00
categories: Tealeaf Academy
banner_image: "/media/thumbs_up.jpg"
featured: true
comments: true
---

The final section of week 3 of the course involved adding user votes to my application.  This required some learning to understand what polymorphic association was.  The best place to start is the Ruby on Rails Guide which states, “with polymorphic associations, a model can belong to more than one other model, on a single association”.

<!--more-->

The reason for this is that often there will times when model associations seem to be quite similar.  In the case of my application I want to implement voting on posts and also on comments.  Instead of having two different models I can just make one, called Vote, and associate it with Post and Comment using polymorphic association.

Columns name in a polymorphic model are ...able. eg voteable_type and voteable_id.  voteable_type have string entries that must include an active Record object.  For example a post will be recorded as Post for the voteable_type and the id of the post will be the voteable_id. Both columns together are the foreign key, known as a composite foreign key.

##Model

So to generate this do:

    rails generate migration create_votes
    
and then in the migration file:

    create_table :votes do |t|
      t.boolean :vote
      t.integer :user_id
      t.string :voteable_type
      t.integer :voteable_id
      t.timestamps
    end

Note that ```t.string :voteable_type``` and ```t.integer :voteable_id``` could be replaced by this one liner:

    t.references :voteable, polymorphic: true
    
due to the conventions of rails but I decided to be more explicit at this time.  The boolean value is used to indicate an up vote or down vote.

Back to the command line for the usual command ```rake db:migrate``` and then I need to create a model called vote.rb:

    class Vote < ActiveRecord::Base
      belongs_to :creator, class_name: 'User', foreign_key: 'user_id'
      belongs_to :voteable, polymorphic: true
    end
    
Rails is clever in that if you set voteable (remember this is a virtual attribute that has getters and setters) as a post object it will know to hit the database with voteable_type as Post and voteable_id as the post primary key.

On the Post model (the one side, Vote is many) I need to add:

    has_many :votes, as: :voteable

Same for Comment:

    has_many :votes, as: :voteable

And finally User:

    has_many :votes

Note that I don't need to make any more changes to the database.  That's all there is to setting up the model layer so next it's on to implementing the votes in the application.

##Implementing Voting

As an example of a simple implementation of adding votes to my posts I can do the following in my _post.html.erb partial:

    <div class="span0 well text-center'>
      <%= link_to '' do %>
        <i class="icon-arrow-up"></i>
      <% end %>

      <%= link_to '' do %>
        <i class="icon-arrow-down"></i>
      <% end %>
    </div>
    
Looking at this it's now obvious that I have to implement POST routes in order for the up and down votes to hit the database.  I can either do this like so:

    resources :votes, only: [:create]

or nest under the posts and comments resources (which is what I have done in my application)

    post :vote, on: :member
    
I can also do exactly the same thing, except as a block:

    member do
      post :vote
    end
    
This will expose a POST route, /posts/3/vote, for example and I can add this to my link with a named route like so:

    <%= link_to vote_post_path(post), method: 'post' do %>

The ```method``` syntax calls some built in javascript in rails that generates a form on the fly and actually submits the form with any parameters that I add.  Pretty handy!

In this case I need a true/false parameter to show if its an up or down vote.  Therefore I need something like /posts/2/vote?vote=true

For the up arrow I can make it:

    <%= link_to vote_post_path(post, vote: true), method: 'post' do %>

and for the down arrow:

    <%= link_to vote_post_path(post, vote: false), method: 'post' do %>
    
I now will need an action in PostsController to handle the route:

    def vote
      posts = Post.find(params[:id])
      vote = Vote.create(voteable: post, creator: current_user, vote: params[:vote])

      if vote.valid?
        flash[:notice] = "You're vote was counted"
      else
        flash[:notice] = "You can only vote once"
      end

      redirect_to :back
    end
    
I also want to display the total number of votes between the up/down arrows.  This requires some logic because I actually want up_votes - down_votes.  The is data logic and should belong in the Post model:

    def total_votes
      up_votes - down_votes
    end

    def up_votes
      self.votes.where(vote: true).size
    end

    def down_votes
      self.votes.where(vote: false).size
    end
    
Then in the html between the arrows simply add:

    <%= post.total_votes %>

If I want to display the post in the order of number of votes I can do this in PostsController by adding to the index method:

    def index
      @posts = Post.all.sort_by(|x| x.total_votes).reverse
    end

Lastly, I only want my users to vote once which will require a validation in the Vote model:

    validates_uniqueness_of :creator, scope: [:voteable_type, :voteable_id]
    
That's pretty much it and it's a case of repeating for voting on comments.  Hope you enjoyed reading about polymorphic association and how to implement it in a Rails application.