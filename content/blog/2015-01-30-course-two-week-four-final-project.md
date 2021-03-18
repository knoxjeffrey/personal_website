---
layout: post
title:  "Tealeaf Academy Course Two/Week Four - Final Project"
date:   2015-01-30 14:22:00
categories: Tealeaf Academy
banner_image: ""
featured: false
comments: true
---

Building my own application from scratch has been an amazing experience and there's no way I'd have progressed this fast without the guys from Tealeaf Academy and a local developer I've been working with.

First a quick bit of info on my application.  I wanted to create an application that could be used by healthcare professionals to share blog articles about treatment techniques.  The intention is for bringing about better patient care in the long run by providing easy access to information without having to trawl through a lot of sites and missing out on information.  In the long run I want to add functionality for users to write CPD articles based on the blog posts which can be presented to their professional body.  For now though the functionality is quite similar to the PostIt! application I built in the tutorials, although I have added quite a few extras to make it interesting.

You can find my application here:  [CPD Boost](http://cpd-boost.herokuapp.com)
and code: [GitHub](https://github.com/knoxjeffrey/cpd_boost)

Register on the application and you'll find a lot of extra functionality.

<!--more-->

The table structure is almost identical to the previous application but I have added a bookmarked_posts table to allow users to save the posts that they find interesting.  I want to use this to allow users to then write their own learning experience based on the post but this is functionality I'll add at a later date.

The first learning experience was thinking about the order in which to actually build up the application.  It's pretty clear to start with an ERD diagram so I know how it will all fit together and then I created the migrations so the tables were ready to use.  Next up was coding the models to allow them to map to the database tables.  It was after this that it became not so clear on what way to proceed.  

I thought initially that seeing as I had started with the M in MVC that I could flesh out the views and then write the controllers but I just had so much functionality in my head that it was difficult to know which bit to start on.  In the end I took the approach of thinking about what the minimum functionality my app needs and that was essentially users.  Therefore I first built up the features around that like implementing sessions and creating users.  Next the users needed to view and add posts so I built that and then the ability to comment on a post.  Well I think you get the idea now!

##Voting

The PostIt! application allowed me to vote on posts and comments but there was no way to remove that vote if I changed my mind or voted on the wrong thing.

The code was fairly similar for creating a form on the fly and then submitting with Ajax but I had to add in logic to decide if the user had already voted:

    <span id="like_button_<%= post.slug %>">
      <% if post.already_voted_by_user?(current_user) %>
        <%= link_to post_vote_path(post, post.vote_object(current_user)), method: 'delete', remote: true do %>
          <span class="fa fa-heart" aria-hidden="true"> <%= post.votes.size %></span>
          <% end %>
      <% else %>
        <%= link_to post_votes_path(post), method: 'post', remote: true do %>
          <span class="fa fa-heart-o" aria-hidden="true"> <%= post.votes.size %></span>
        <% end %>
      <% end %>
    </span>
    
This needed some logic to pull the info out of the posts table and I added this in post.rb

     ########## VOTE ########## 
      #check if a user has already voted on a post
      def already_voted_by_user?(current_user)
        !post_vote_array(current_user).empty?
      end

      #return the id of the vote after it's confirmed that a user has already voted on a post
      def vote_object(current_user)
        post_vote_array(current_user).first.id
      end

      def post_vote_array(current_user)
        self.votes.where(["user_id = ? and voteable_id = ? and voteable_type = ?", current_user.id, self.id, self.class.name])
      end
    ##########  END VOTE ##########

##Ajax

Handling the Ajax requests were fairly simple in the PostIt! application because I only had to get a handle on the number of votes to change it.  In this case I had to use Ajax to reload the whole block of code associated with the like button as seen above.  I was able to to get the heart image to change without any problems and that would hit the database but the problem would occur when I hit the button again.  Say I had issued a POST request on the first button press, it would then expect a DELETE request on the second button press but that code hadn't changed and so it was just staying as a POST request.  That's why I had to reload the whole block.  I have to admit I had some help with this from a Rails developer here in Edinburgh!  What I did in the end was move my like_button code into a ```_like_button.html.erb``` partial and then handled it in a ``change.js.erb``` file:

    $('#like_button_<%= @post.slug %>').replaceWith("<%= escape_javascript render('posts/like_button', post: @post) %>");
    
My actions in the VotesController looked like this with a call to render the js file:

    def create
      @vote = Vote.create(voteable: @post, creator: current_user)

      respond_to do |format|
        format.html do
          redirect_to :back
        end
        format.js { render 'change' }
      end
    end

    def destroy
      @vote = Vote.find_by(voteable: @post, creator: current_user)
      @vote.destroy

      respond_to do |format|
        format.html do
          redirect_to :back
        end
        format.js { render 'change' }
      end
    end

Now the button works seamlessly!

##Book Marking

The idea behind book marking a post is pretty much identical to voting on a post although there was a little more work to do for this.  After a user clicks on the bookmark link they can then look at all their bookmarks in their profile page.  The problem in this case is that when the user decides they no longer want that post to be bookmarked I want it to disappear from the bookmarks page without having to reload the page.  All that currently happens is the image changes to show that it is no longer bookmarked.  Therefore I had to add an extra handler around it just for the bookmarks page:

    <% @user.list_of_user_saved_posts.each do |post| %>
      <div id='user-profile_<%= post.slug %>' class='item'>
        <%= render 'posts/post', post: post %>
      </div>
    <% end %>
    
and then I handled this in a js file:

    $('#user-profile_<%= @post.slug %>').remove();
    
Done!

##Delete Posts And Comments

Another piece of functionality I added was to be able edit and delete posts and also to just delete comments.  Editing a post was something I did in the PostIt! application but the delete was new for me.  For example, to handle the delete for a post I needed to add an action in my PostsController

    #all comments associated with post are automatically destroyed by dependent: :destroy in model
    def destroy
      @post.destroy
      redirect_to posts_path
    end
    
You'll notice my comment on this action and this takes advantage of another rails convention because if I delete a post then I obviously no longer want comments associated with that post in the database so I added this to my Post model;

    has_many :comments, dependent: :destroy #removes all associated comments automatically
    
So now when I delete a post from the database, all associated comments are automatically deleted from the comments table.  Nice!

##Masonry Grid

I wanted to add a bit of styling to my application and you'll notice it takes a bit of inspiration from Pinterest.  I achieved the look by using [Masonry](http://masonry.desandro.com/) which was pretty straight forward to use although there was one problem that I had to fix due to the images.  When I made the first request to my application the posts would all overlap but then any subsequent requests would be fine.  After a bit of studying I found a fix that required first installing ```gem 'imagesLoaded_rails'``` and then I added the following jQuery to ```application.js```

    $(function(){

      var $container = $('#container');
      $container.imagesLoaded( function() {
          $container.masonry();
      });

    });  
    
and this essentially triggers a callback after all child images have been loaded.

##Generate Images From Url

To improve the look of the application I wanted to add some images and I found a great gem called [LinkThumbnailer](https://github.com/gottfrois/link_thumbnailer) which does just that by returning an object that contains images and website information.

In my HTML I added code above the rest of the post to display the image:

    <% url = generate_url_attributes_preview(post.url) %>

    <% if !url.empty? %>
      <%= image_tag(url, class: "post-box-images") %>
      <br>
      <br>
    <% end %>
    
and then in ```application_helper.rb``` I implemented the methods:

    def generate_url_attributes_preview(post_url)
      url = url_with_protocol(post_url.to_s)
      begin
        url_attributes = LinkThumbnailer.generate(url, attributes: [:images], http_timeout: 2, image_limit: 1, image_stats: false)
        if !url_attributes.images.empty? && valid_image_url(url_attributes)
          url_attributes.images.first.src.to_s
        else
          ''
        end
      rescue =>e
        ''
      end
    end
  
    #return false if url starts with a / character
    #I want to ignore these urls as it results in a localhost lookup
    #
    #example: /images/sample.jpg would be false
    def valid_image_url(url)
      !url.images.first.src.to_s.starts_with?('/')
    end
    
In order to speed things up I only retrieved the first image for a url and didn't retrieve any info about the image.  I also set a time limit for the request.  You can see that I also handle exceptions and this is basically in the cases where the url cannot be found.  I wasn't too sure how to get this working as stated in the documentation because it says that the rescue should be ```LinkThumbnailer::BadUriFormat``` rather than what I have, ```=>e```.  I couldn't get this to work so from what I understand I have just implemented a general handler that will return an empty string if there are any problems and therefore no image will show.  To be honest this is actually how I want it to work anyway so this suits my purposes but I'd appreciate any feedback regarding any issues with doing it this way.

##Caching

The way I have things works now but I was working on a way to cache the pages so a first request would only take a long load time and then subsequent requests would be nice and quick.  If I keep things how they are now then I will need to put a strict limit on how many posts I load initially otherwise the request will take ages!

To solve it I first looked at [actionpack-page_caching](https://github.com/rails/actionpack-page_caching) but after reading the documentation it was clear that it wasn't suitable for applications such as mine where users logged in and the information was dynamic.

I then came across another way of doing it with an application called [Dalli](https://github.com/mperham/dalli) and this also works really well for static content due to a complete page cache but I need to figure out how to handle the dynamic sections to either delete or alter the cache.  Some reading needed I think!

##Conclusion

I have a great time building this application and I can't believe I could build something like this in 4 days (I actually had the bulk of it done in 2 but the rest of the time was fixing some of the extra features)!  When I finish the final Tealeaf Academy course I want to come back to this and build up the rest of the application and release it as a production application.  Lots to learn for the time being though!