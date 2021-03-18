---
layout: post
title:  "Tealeaf Academy Course Three/Week Three - Capybara And xPath"
date:   2015-02-25 14:18:00
categories: Tealeaf Academy
banner_image: ""
featured: false
comments: true
---

In my last post on Dynamic CSS Elements for feature tests in Capybara I discussed techniques to get a handle on the attribute for an object in a list for example.  The main disadvantage with this however is that it in many cases you have to alter your view code in order to run your feature tests which I don't really like the idea of.

<!--more-->

(Click on the link to read my post on [Dynamic CSS Elements](../../../../2015/02/24/course-three-week-three-dynamic-css-elements/))

Another method is available using xPath selectors in Capybara which means you don't have to touch your view codes and I'll out line the approach below.

In the [previous post](../../../../2015/02/24/course-three-week-three-dynamic-css-elements/) I demonstrated how to get a handle on a text input field and change the value in Capybara with the following code:

    find("input[data-video-id='#{the_video.id}']").set(3)
    
From the code you can see that this involves adding code in the view to create a dynamic id.  Using xPath in the test you can remove the extra code in the view and type:

    within (:xpath, "//tr[contains(.,'#{the_video.title}')]") do
      fill_in "queue_items[][position]", with: 1
    end
    
What this says is to find the ```tr``` tag that has a string containing the title of the video somewhere between the ```<tr>``` and ```</tr>``` tags and enter the value with 1.  It's not as easy to read the test code but the views are much cleaner and I think this is more important.  However, there are ways to tidy up the test code which I'll go into at the end of the post.

The example in the [previous post](../../../../2015/02/24/course-three-week-three-dynamic-css-elements/) on how to test the expected result was as follows:

    expect(find("input[data-video-id='#{the_video.id}']").value).to eq('3')
    
but using xPath the code is as follows:

    expect(find(:xpath, "//tr[contains(.,'#{the_video.title}')]//input[@type='text']").value).to eq('3')
    
This query finds a string containing the title of the video under the ```tr``` tag.  It then looks for an input field of type text to get the value.  Notice that when you query the attributes of input you must use the ```@``` symbol. Again this is not as tidy but the consequence of cleaner code in the view seems to be more code in the feature test in order to get a handle on the attributes you need.

#Tidy Up Feature Code

The aim of the feature test should be to have very readable code so that what you have in your scenario reads very naturally.  Therefore you can push the above code into helper methods so that an example scenario could read as follows:
    
    feature "user amends the queue" do

      scenario "user reorders videos in queue" do

        set_video_position(video1, 3)
        set_video_position(video2, 1)
        set_video_position(video3, 2)

        update_queue

        expect_video_position(video2, 1)
        expect_video_position(video3, 2)
        expect_video_position(video1, 3)

      end

      def set_video_position(video, position)
        within (:xpath, "//tr[contains(.,'#{video.title}')]") do
          fill_in "queue_items[][position]", with: position
        end
      end

      def update_queue
        click_button "Update Instant Queue"
      end

      def expect_video_position(video, position)
        expect(find(:xpath, "//tr[contains(.,'#{video.title}')]//input[@type='text']").value).to eq(position.to_s)
      end
    end
    
Now it's nice and easy to understand what the scenario is testing.  Although using xPath in Capybara is tricky compared to the other ways I prefer to use it in situations were the other alternatives require me to edit my view code.