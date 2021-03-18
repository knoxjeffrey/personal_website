---
layout: post
title:  "DRY model code"
date:   2015-01-21 10:56:00
categories: Web Development
banner_image: ""
featured: false
comments: true
---

I had a case in my postit application where I needed to add voting for both comments and posts.  This required some code in my models for Post and Comment to count the votes:
    
    has_many :votes, as: :voteable

    def total_votes
      up_votes - down_votes
    end

    def up_votes
      self.votes.where(vote: true).size
    end

    def down_votes
      self.votes.where(vote: false).size
    end
    
<!--more-->
    
This was repeated code in both models that I wanted to DRY up, so after some help from a friend I added this code in a module in the concerns folder under models:

    module ActsAsVoteable

      #self.included is called when this module is included in a model
      def self.included(base)
        #class_eval allows me to define methods at runtime within the model that this module is include in
        #class_eval is useful when the class I want to add methods to is not known until runtime. 
        base.class_eval do
          has_many :votes, as: :voteable
        end
      end

      def total_votes
        up_votes - down_votes
      end

      def up_votes
        self.votes.where(vote: true).size
      end

      def down_votes
        self.votes.where(vote: false).size
      end

    end
    
and then in the Post and Comment model all I had to do was add ```include ActsAsVoteable```.

