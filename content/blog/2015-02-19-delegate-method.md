---
layout: post
title:  "Delegate Method"
date:   2015-02-19 11:55:00
categories: Rails
banner_image: ""
featured: false
comments: true
---

I want to make a quick post about a new Rails method, delegate, that I came across recently.  It's a really useful way to refactor code in order to cut down on the number of public object methods that you have to explicitly define. You can read the documentation for the delegate method [here](http://api.rubyonrails.org/classes/Module.html#method-i-delegate)

<!--more-->

Take this code for a QueueItem model

    class QueueItem < ActiveRecord::Base
      belongs_to :user
      belongs_to :video

      def video_title
        video.title
      end

      def rating
        review = Review.where(user_id: user.id, video_id: video.id).first
        review.rating if review
      end

      def category_name
        video.category.name
      end

      def category
        video.category
      end
    end

There are several simple methods here and this is where delegate comes in handy to tidy this up.  By using delegate my code will look as follows:

    class QueueItem < ActiveRecord::Base
      belongs_to :user
      belongs_to :video

      # This means I don't need a category method to return video.category.
      # When QueueItem.category is called it automatically looks for video.category
      # Also, for category_name I don't need video.category.name because video.category is already delegated as category
      delegate :category, to: :video

      # This means I do not need a video_title method to return video.title
      # When QueueItem.video_title is called it automatically looks for video.title
      delegate :title, to: :video, prefix: :video

      def rating
        review = Review.where(user_id: user.id, video_id: video.id).first
        review.rating if review
      end

      def category_name
        category.name
      end
    end

I've commented the code to further explain how the delegate method works in this case. Now I have a much neater model!
