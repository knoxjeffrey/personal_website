---
layout: post
title:  "Tealeaf Academy Course Three/Week Three - Dynamic CSS Elements"
date:   2015-02-24 16:24:00
categories: Tealeaf Academy
banner_image: ""
featured: false
comments: true
---

For my third week of course three in the Tealeaf Academy course I have been learning how to implement feature tests using Capybara.  One of the feature tests involved checking that a user could successfully change the order of a list of videos.  The list had several columns, one of which had text fields to allow the user to input numbers to change the list order.

<!--more-->

The section of view code for this was as follows:
``` ruby
= form_tag sort_queue_items_path do
  %table.table
    %thead
      %tr
        %th(width="10%") List Order
        %th(width="30%") Video Title
        %th(width="10%") Play
        %th(width="20%") Rating
        %th(width="15%") Genre
        %th(width="15%") Remove
    %tbody
      - @queue_items.each do |queued_item|
        %tr
          %td
            = text_field_tag "queue_array[][position]", queued_item.list_position
            = hidden_field_tag "queue_array[][id]", queued_item.id
          %td
            = link_to queued_item.video_title, queued_item.video
          %td
            = button_to "Play", nil, class: "btn btn-default"
          %td
            = select_tag "queue_array[][rating]", options_for_select(star_rating, queued_item.rating), { include_blank: true, class: 'form-control' }
          %td
            = link_to queued_item.category_name, queued_item.category
          %td
            = link_to queue_item_path(queued_item), { method: :delete, data: { confirm: "Are you sure?" } } do
              %i.glyphicon.glyphicon-remove
  = submit_tag "Update Instant Queue", class: "btn btn-default"
```

In order to simulate the user changing the order of the list items I needed to have some sort of CSS selector to get a handle on it with Capybara.  One way to do it would be to add an id to the text_field_tag:

``` ruby
%td
  = text_field_tag "queue_array[][position]", queued_item.list_position, id: "video_#{queue_item.video.id}"
```

or another possibility if you couldn't alter the id's would be to add data attributes:

``` ruby
%td
  = text_field_tag "queue_array[][position]", queued_item.list_position, data: { video_id: queue_item.video.id }
```

Both of these options work perfectly well but I found another way using content_tag_for that I think makes for slightly cleaner code in the view:

``` ruby
= content_tag_for :td, queued_item do
  = text_field_tag "queue_array[][position]", queued_item.list_position
```

and this produces the following sample of html code:

``` html
<tr>
  <td class="queue_item" id="queue_item_21">
    <input id="queue_array__position" name="queue_array[][position]" type="text" value="1">
    <input id="queue_array__id" name="queue_array[][id]" type="hidden" value="21">
  </td>
```

The content_tag_for has produced a dynamic id of ```queue_item_21``` where the number is based on the id of the queued item.  The numbers will obviously be different for each video in the queue.  

The end result is different to the first approaches because the id is wrapped around the input field rather than being on the input itself.  This means that the capybara testing has to change in order to get a handle on the input field.  For the data attributes example, to find and change the value in the input field you would write the following:

``` ruby
find("input[data-video-id='#{the_video.id}']").set(3)
```
whereas using the content_tag_for you have to do a little more

``` ruby
within "#queue_item_#{QueueItem.first.id}" do
  find('input[type=text]').set('3')
end
```

Checking the value had changed in the data attribute example would look like this:

``` ruby
expect(find("input[data-video-id='#{the_video.id}']").value).to eq('3')
```

and for content_tag_for the code is maybe a little easier to read:

``` ruby
within "#queue_item_#{QueueItem.first.id}" do
  expect(find('input[type=text]').value).to eq('3')
end
```

So there you have it, many examples of how to dynamically add css elements but I think I prefer the option of keeping the view code a little cleaner even though it means slightly more code in the feature testing.

If you want to read more, content_tag_for is a RecordTagHelper and the documentation can be found [here](http://api.rubyonrails.org/classes/ActionView/Helpers/RecordTagHelper.html). You will notice that there is another option to wrap a div around the object called ```div_for``` and the div will also have a dynamic class and id.

In my [next post](../../../../2015/02/25/course-three-week-three-capybara-and-xpath/) I'll demonstrate how to get a handle on data within a list using capybara without needing any additional css elements.
