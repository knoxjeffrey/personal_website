---
layout: post
title:  "Tealeaf Academy Course Three/Week One - Red-Green-Refactor"
date:   2015-02-10 13:00:00
categories: Tealeaf Academy
banner_image: ""
featured: false
comments: true
---

Red-green-refactor is an important concept in TDD when you are using tests to drive your code and I'll use an example to demonstrate how this works.  First I start off with a series of descriptions about what I want my code to do.  As an example, I have a todo list that has a name and description and I want to write a method that checks if my object only has a name defined. So my initial test setup would be:

    describe :name_only do
      it "returns true if the description is nil"
      it "returns true if the description is an empty string"
      it returns false if the description is a non empty string"
    end
    
<!--more-->
    
Next up I need to flesh out the code for my first test which would look as follows:

    it "returns true if the description is nil" do
      todo = Todo.new(name: "finish coursework")
      expect(todo.name_only?).to be true
    end

    
From this I need to create the basic structure of my name_only method:

    class Todo < ActiveRecord::Base
      def name_only

      end
    end
    
When I run the test I will get a fail saying expected true, got nil.  This is the red part of the Red-Green-Refactor.  What I have to do now is implement the bare minimum of code in order to make my test pass.  This is pretty simple for my first test:

    class Todo < ActiveRecord::Base
      def name_only
        true
      end
    end
    
Easy! The first test will now pass so I move onto the next test:

    it "returns true if the description is an empty string"
      todo = Todo.new(name: "finish coursework", description: "")
      expect(todo.name_only?).to be true
    end
    
Once again, running the test will give me a pass. So far so good and onto the last test:

    it "returns false if the description is a non empty string"
      todo = Todo.new(name: "finish coursework", description: "finish by Friday")
      expect(todo.name_only?).to be false
    end
    
As expected, this puts a spanner in the works and I get a failure when I run my tests.  It's at this point I need to do more work in my method in order to make all the tests pass:

    class Todo < ActiveRecord::Base
      def name_only
        description.present?
      end
    end

This will now make all of the tests pass. Note that description.present? is equivalent to:
  
    description.nil? || description == ""

but it's another Rails method that makes my code nice and concise.

What you have seen is the red-green part of the process.  I just kept working until I got rid of all the fails to the point that all of my tests were passing.  At this stage it is possible to refactor my code because I can make improvements and still be sure that the new code satisfies my tests. There's no need to refactor this code of course because it's a simple example but you get the idea!

That's Red-Green-Refactor in a nutshell.