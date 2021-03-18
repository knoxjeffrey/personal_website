---
layout: post
title:  "Keep Your Controllers Skinny"
date:   2015-02-05 11:32:00
categories: Web Development
banner_image: ""
featured: false
comments: true
---

You'll hear it lots, fat models/skinny controllers but I was working on a project recently where my controller code was putting on a bit of weight!

The requirement was that when a post was saved with a url, a gem I had installed called LinkThumbnailer would visit that url to find the first image on the page and return the image url.

<!--more-->

I implemented this within the create and update actions in my controller. The problem was that it involved quite a few steps such as checking if it was a valid url and handling exceptions.  My controller code at this point was expanding and it didn't feel like this was the correct place for the code.  I had a similar issue with placing the code in the model layer because all of the code for generating the image url didn't have interaction with table data and would therefore be unnecessarily bloating the model layer.

My solution after some reading was to create an ```app/services``` folder with a class ```GenerateImageUrlFromPostUrl``` that was a plain old Ruby object (PORO).

Now my update action for example looked at follows:

    def update
      @post.image_url = generate_image_url_from_post_url(post_params[:url])

      if @post.update(post_params)
        flash[:notice] = "You successfully updated your post!"
        redirect_to post_path(@post)
      else
        render :edit
      end
    end
  
with a private method:

    def generate_image_url_from_post_url(url)
      GenerateImageUrlFromPostUrl.new(url).return_url_string
    end
    
That's all that was needed in the controller which made it a lot cleaner with the bulk of the work done in my ```GenerateImageUrlFromPostUrl``` class within the services folder:

    class GenerateImageUrlFromPostUrl
  
      attr_reader :post_url

      def initialize(post_url)
        @post_url = post_url
      end

      def return_url_string
        image_url_object = open_graph_protocol_object(post_url)
        begin
          if image_url_object.images.any? && valid_image_url(image_url_object)
            image_url_object.images.first.src.to_s
          end
        rescue =>e
          Rails.logger.warn("Couldn't parse OG data for post #{post_url}")
        end
      end

      private

      def open_graph_protocol_object(url)
        LinkThumbnailer.generate(url_with_protocol(url), attributes: [:images], http_timeout: 2, image_limit: 1, image_stats: false)
      end

      #prepend http:// to url if it is missing
      def url_with_protocol(url)
        url.starts_with?('http://') ? url : "http://#{url}"
      end

      #return false if url starts with a / character
      #I want to ignore these urls as it results in a localhost lookup
      #
      #example: /images/sample.jpg would be false
      def valid_image_url(url)
        !url.images.first.src.to_s.starts_with?('/')
      end

    end
    
I actually want to take this one step further now and hand it off as a background job so there is no delay in saving the post, with the image url fetching being handled in the background.  I think this will be covered in the third Tealeaf Academy course so I will implement it at that time.

That's all there is to it, now I'm back to having a skinny controller with an added bonus that it should be nice and easy to test!