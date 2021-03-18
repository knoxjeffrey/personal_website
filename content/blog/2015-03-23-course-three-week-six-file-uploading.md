---
layout: post
title:  "Tealeaf Academy Course Three/Week Six - File Uploading"
date:   2015-03-23 13:32:00
categories: Tealeaf Academy
banner_image: ""
featured: false
comments: true
---

One of the things I've been excited to get to in the Tealeaf Academy course is the section on uploading images and saving to Amazon S3.  This post will walk through the steps to get this working in a Rails application.

<!--more-->

The first step is to create a form in your application where a user can select a file to upload.  In the MyFliX application I need an admin to be able to upload cover images for various videos.  I won't layout the whole form below but I have included the snippet for selecting files below:

    .form-group
      .control-label.col-sm-3
        = f.label :large_cover, "Large Cover"
      .col-sm-6
        = f.file_field :large_cover, class: "btn btn-file form-control"

    .form-group
      .control-label.col-sm-3
        = f.label :small_cover, "Small Cover"
      .col-sm-6
        = f.file_field :small_cover, class: "btn btn-file form-control"
    
I don't yet have ```large_cover``` and ```small_cover``` columns in my database so I have to generate a migration (I am adding this to my videos table):

    class AddLargeCoverAndSmallCoverToVideos < ActiveRecord::Migration
      def change
        add_column :videos, :large_cover, :string
        add_column :videos, :small_cover, :string
        remove_column :videos, :large_cover_url
        remove_column :videos, :small_cover_url
      end
    end

I'm using the [CarrierWave](https://github.com/carrierwaveuploader/carrierwave) gem for file uploading in my application and the files will stored be in my [Amazon S3](http://aws.amazon.com/s3/) account.  A useful RailsCast video can be found for CarrierWave at [this link](http://railscasts.com/episodes/253-carrierwave-file-uploads).  Also checkout [this post](http://blog.danielle.tuckerlabs.com/post/60491757671/creating-a-simple-aws-s3-bucket-with-iam-access) about adding permissions for S3 but I will get to that later in the post.

The next step is to create references to uploader classes in the Video model.  The uploader class is used by CarrierWave to hold the logic for uploading and processing and means that this can be kept separate from my Video model class.  To do this add the following in the ```video.rb``` file:

    mount_uploader :large_cover, LargeCoverUploader
    mount_uploader :small_cover, SmallCoverUploader

Obviously I don't have these classes yet so that's the next step.  Create files in the following locations, ```app/uploaders/large_cover_uploader.rb``` and ```app/uploaders/small_cover_uploader.rb``` and the basic template for one of them should look as follows:

    class LargeCoverUploader < CarrierWave::Uploader::Base

    end
    
One extra piece of functionality I would like to have in my application is to be able to manipulate my images to resize them to fit the layout of my application.  If you read the documentation for CarrierWave you will see there are choices for using RMagick or MiniMagick.  I have opted to use MiniMagick so firstly I have to include ```gem 'mini_magick'``` and then ```bundle install```.

It's very easy for me to use this and for example my LargeCoverUploader class will now look as follows:

    class LargeCoverUploader < CarrierWave::Uploader::Base
      include CarrierWave::MiniMagick

      process resize_to_fill: [665, 375]
    end
    
I am almost ready to use the form on my application to start uploading images.  For file storage I am using Amazon S3.  It's a little tricky to set up S3 for uploading files so I suggest reading the post I linked to at the start of the post for adding permissions to S3.

There is helpful documentation in CarrierWave about using Amazon S3 and the first thing they mention is to add ```gem "fog-aws"``` because Fog AWS is used to support S3.  I had problems just using this gem and actually also had to add ```gem 'fog'``` to properly read my credentials.

The credentials are stored at ```config/initializers/carrierwave.rb``` and my file looked as follows:

    CarrierWave.configure do |config|
      config.storage = :fog
      config.fog_credentials = {
        provider:              'AWS',
        aws_access_key_id:     ENV['AWS_ACCESS_KEY_ID'],
        aws_secret_access_key: ENV['AWS_SECRET_ACCESS_KEY'],
        region:                ENV['AWS_REGION']
      }
      if Rails.env.production?
        config.fog_directory  = ENV['AWS_S3_BUCKET_PRODUCTION']
      elsif Rails.env.staging?
        config.fog_directory  = ENV['AWS_S3_BUCKET_STAGING']
      else
        config.fog_directory  = ENV['AWS_S3_BUCKET_DEVELOPMENT']
      end
    end

You will notice that I have setup 3 separate buckets so I can test the functionality with S3 in development and staging as well as having a production bucket.  Now, if you don't want to require your development setup to have an internet connection and have files saved to local file storage instead then this is an alternative setup:

    CarrierWave.configure do |config|
      if Rails.env.staging? || Rails.env.production?
        config.storage = :fog
        config.fog_credentials = {
          provider:              'AWS',
          aws_access_key_id:     ENV['AWS_ACCESS_KEY_ID'],
          aws_secret_access_key: ENV['AWS_SECRET_ACCESS_KEY'],
          region:                ENV['AWS_REGION']
        }
        if Rails.env.production?
          config.fog_directory  = ENV['AWS_S3_BUCKET_PRODUCTION']
        else
          config.fog_directory  = ENV['AWS_S3_BUCKET_STAGING']
        end
      else
        config.storage = :file
        config.enable_processing = Rails.env.development?
      end
    end

This is what I will do from now on but having a bucket for testing was useful for me when I was learning what to do and made things easier to debug.  Obviously change your environment variables to match your credentials and you should now be all set.

This is obviously a fairly basic setup for uploading images but it's a good base to work from to add more complexity to the application.  Happy uploading!

## Bonus Section!

As I finished this post I thought I'd write about one other little issue I had when I was writing tests.  Here's a quick overview of what I needed to test.  When a user clicks on a video, they are taken to a page that displays a large cover image of the video if one is available.  However, if there isn't a cover image then I display a dummy image.  I have a method in my ```video.rb``` model that tests for the presence of a large cover:

    # If large_cover is present then return image url,  otherwise disply dummy image
    def display_large_video_image
      self.large_cover.present? ? self.large_cover_url : "http://dummyimage.com/665x375/000/fff.png&text=No+Preview+Available"
    end
    
```self.large_cover_url``` then takes advantage of the ```_url``` helper which provides an absolute path for ```large_cover```, including protocol and server name.

That all works well in my application but I was having trouble getting my test for this method working properly.  I won't write out all of the tests but this is the one I was using to test if the method would display the large cover image:

    describe :display_large_video_image do

      it "should display a large video image if one is available" do
        video2 = object_generator(:video, large_cover: './spec/support/uploads/monk_large.jpg')
      expect(video2.display_large_video_image).to eq("https://knoxjeffrey-myflix-development.s3.amazonaws.com/uploads/monk_large.jpg")
      end
      
    end
    
I'm using Fabricator to generate my objects and I had been using this to generate my video objects until now:

    Fabricator(:video) do
      title { Faker::Lorem.characters(5) }
      description { Faker::Lorem.sentence }
    end
    
As you can see from the test I was then trying to add an image from a location on file but I was getting the following error:

    CarrierWave::FormNotMultipart:
    You tried to assign a String or a Pathname to an uploader, for security reasons, this is not allowed.

    If this is a file upload, please check that your upload form is multipart encoded.
    
To solve this I added to the video fabricator:

    Fabricator(:video) do
      title { Faker::Lorem.characters(5) }
      description { Faker::Lorem.sentence }
    end

    Fabricator(:video_upload, from: :video) do
      large_cover { File.open("./spec/support/uploads/monk_large.jpg") }
    end
    
Now my test was as follows:

    it "should display a large video image if one is available" do
      video2 = object_generator(:video_upload)
      expect(video2.display_large_video_image).to eq("https://knoxjeffrey-myflix-development.s3.amazonaws.com/uploads/monk_large.jpg")
    end

Now the test is working perfectly, although just make sure to put your test image in the file location specified.