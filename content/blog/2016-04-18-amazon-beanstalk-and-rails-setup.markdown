---
layout: post
title:  "Amazon Beanstalk and Rails Setup"
date:   2016-04-18 23:15:00
categories: Rails
banner_image: "/media/amazon_web_services.png"
featured: true
comments: true
---

I've recently had to setup an existing Ruby on Rails application to run on Amazon Beanstalk. The application uses a PostgreSQL database but also needed support for PostGIS which is a spatial database extender for a PostgreSQL object-relational database. It adds support for geographic objects allowing location queries to be run in SQL. It has taken me quite a while to get the application up and running so I thought it would be a good idea to document the whole process here to hopefully help others (and myself when I need to setup another application on Beanstalk!).

I'm pretty much a total newbie to setting up servers so I'd really appreciate tips on how to automate the steps below to speed up the process.

<!--more-->

## Initial Steps

As mentioned above, I already had a Rails app up and running but you can also follow along with a lot of the steps if you scaffold a very basic Rails app using sqlite. In fact a lot of the resources I found online were for setting up a basic app but I wrote this article to go into more depth for some of the complicated issues you might find.

Obviously the first thing to do is to sign up for an AWS account and you also need to download the Elastic Beanstalk Command Line Tools via Homebrew:

```
brew update
brew install aws-elasticbeanstalk
```

From the terminal, type ```eb init``` to get things started and you will be presented with a series of options.  Choose the most suitable location for your app, then type your application name. I choose Ruby as my language and Ruby 2.2 (Passenger Standalone) for my platform. Finally select yes for SSH setup and create a new keypair by following the instructions and setting a passphrase.

If this is your first time using Beanstalk you will be asked to enter your Access Key ID and Secret Access Key.  Follow [this guide](http://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSGettingStartedGuide/AWSCredentials.html) to see how to do this. Note that you can find these details from the root of the terminal by going to ```cd .aws``` and looking in the ```config``` file.  Your default profile is ```eb-cli``` but you can add others if you work with with other Beanstalk setups on various accounts and you have the necessary keys.

You will notice that you now have a new ```.elasticbeanstalk``` directory that has been automatically added to your ```.gitignore```.

I also add another directory in the root of the application called ```.ebextensions``` with a file name called ```ruby.config```. My basic setup for this file is as follows:

``` ruby
option_settings:
  - option_name: RAILS_ENV
    value: "test:development"
  - option_name: RACK_ENV
    value: production
  - option_name: RAILS_ENV
    value: production

packages:
  yum:
    git: []
    postgresql94-devel: []
```

It's a good time to now commit your changes to your git repo.  With that done it's time to setup your environment. You can setup as many environements as you need, most likely a staging and production environment.  Just change the ```RAILS_ENV``` and ```RACK_ENV``` values to suit.  For this example I'll just setup the one environment.  Type ```eb create app-production``` from the terminal, replacing 'app-production' with anything you like.

You can now visit your application at the address given by Elastic Beanstalk but if it's an existing application with PostgreSQL there's a good chance you'll be presented with a 403 screen which needs further setup in Beanstalk.

## Extra Setup Steps

The first thing I have to do is setup more environment variables that are used in my application. From your Beanstalk application dashboard choose 'Configuration'  and then 'Software Configuration'.

First up is to set ```RAILS_ENV: production``` and make sure to click the plus symbol and not the Apply button in order to add more variables otherwise it'll take you a long time to add all the variables!  Then you will need to set ```SECRET_KEY_BASE``` and ```SECRET_TOKEN```.  To get values for these you will need to type ```rake secret``` from the terminal for each one and then copy across the values. Also add any other environment variables you need in your application such as Facebook keys, etc. In my case these variables will be referenced from my secrets.yml file in my Rails applications.  Here is an example of my setup for production:

``` ruby
production:
  google_maps_key: <%= ENV["GOOGLE_MAP_KEY"] %>
  facebook_oauth2_id: <%= ENV["FACEBOOK_ID"] %>
  facebook_oauth2_secret: <%= ENV["FACEBOOK_SECRET"] %>
  twitter_api_key: <%= ENV["TWITTER_KEY"] %>
  twitter_api_secret: <%= ENV["TWITTER_SECRET"] %>
  s3_key: <%= ENV["S3_KEY"] %>
  s3_secret: <%= ENV["S3_SECRET"] %>
  s3_region: <%= ENV["S3_REGION"] %>
  s3_bucket: <%= ENV["S3_BUCKET"] %>
  mandrill_username: <%= ENV["MANDRILL_USERNAME"] %>
  mandrill_password: <%= ENV["MANDRILL_PASSWORD"] %>
  secret_token: <%= ENV['SECRET_TOKEN'] %>
  secret_key_base: <%= ENV['SECRET_KEY_BASE'] %>
```

When all the environment variables are added you can press Apply and wait for the settings to take place.

## PostgreSQL

The application I am working with is already running PostgreSQL and I need to get this running with Elastic Beanstalk. Go back to ```Configuation``` from your dashboard and at the bottom you will see an option to create a new RDS database.  Click that and then the settings I chose to change were:

```
DB Engine: postgres
Master username: set what you want here
Master password: set your password
```

Then apply the settings.  This can take quite a while to run and set everything up.

In your application you also need to apply the settings for your production database in ```database.yml```.  As mentioned before, I am using postgis so mine will look slightly different to the standard:

``` ruby
production:
  adapter: postgis
  encoding: unicode
  database: <%= ENV['RDS_DB_NAME'] %>
  username: <%= ENV['RDS_USERNAME'] %>
  password: <%= ENV['RDS_PASSWORD'] %>
  host: <%= ENV['RDS_HOSTNAME'] %>
  port: <%= ENV['RDS_PORT'] %>
  postgis_extension: postgis
  su_username: postgres
  schema_search_path: public,postgis
```

Note that if you decide to change your database password for example you need to go into your environment variables in AWS and add a ```RDS_PASSWORD``` variable with the password you want.  You can change the password by going to Configuration from the dashboard.

When all the settings have been applied, go back to the terminal and type ```eb deploy```.  Note, you can add your environment name after the ```eb deploy``` if you have a few environements setup.

## Postgis

On this deploy I had an error during the migration process and I checked ```eb logs``` followed by my environment name.  In the logs sroll down to activity.log and I came across the error, 'PG::UndefinedTable: ERROR:  relation "geometry_columns" does not exist'.

In order to fix this I have to log into my PostgreSQL database and add extensions for postgis. To log in run this command from the terminal:

```
psql --host=a**********0a3.cne3quychuit.eu-west-1.rds.amazonaws.com --port=5432 --username=********* --password --dbname=ebdb
```

I've hidden some details above for security.  You can get the host from the RDS Endpoint by going to Configuration from the Dashboard. The username is the one you set when creating the database and then you will be asked for your password that you setup.

If your operation times out you probably need to add some extra setting to be able to log in.  In order to fix it you'll need to work from the EC2 Dashboard by going to Congiguration and then RDS. From there click 'View in RDS console' under Connectivity Information. On the next screen click the 'Instance Actions' drop down and select 'See Details. Then click on the first link in 'Security Groups'. I got a warning that 'Your account does not support the EC2-Classic Platform in this region' so I clicked the 'Go to EC2 console' link.

Click on the RDS group name, then click on the 'Inbound' tab below , click 'Edit' and 'Add Rule'. Copy the setting for the exisiting PostgreSQL except for the source. I chose my source as anywhere so I can log in from any location but you may want to only allow certain IP addresses.

If you try logging into your database again from the terminal you should be successful. Now, to add the Postgis extensions type:

```
CREATE EXTENSION postgis;
CREATE EXTENSION postgis_topology;
```

Exit that and run the deploy again from the terminal.

The migrations should run smoothly this time but there is a little more setup involved to install Postgis. I need to ssh into my application in order to run a script that will install Postgis and its dependencies: ```eb ssh``` followed by the environment name. This will take quite a bit of time.

```
sh -c 'curl -L https://gist.githubusercontent.com/knoxjeffrey/02e624ec07350176b92540886d7550d1/raw/939263c41772c9fe4175be349eb4711f56af69d7/aws-postgis.txt | bash'
```

Just in case this gist disappears, the script is as follows:

```
#!/bin/bash
#
# Script to setup a Elastic Beanstalk AMI with geospatial libraries and postGIS
#
# sh aws_ami_prep.sh > aws_ami_prep.log 2>&1 &
# See orig here: https://gist.github.com/whyvez/8d19096712ea44ba66b0

# Go to ec2-user home directory
cd /home/ec2-user

# yum libraries
sudo yum -y install gcc gcc-c++ make cmake libtool libcurl-devel libxml2-devel rubygems swig fcgi-devel libtiff-devel freetype-devel curl-devel libpng-devel giflib-devel libjpeg-devel cairo-devel freetype-devel readline-devel openssl-devel python27 python27-devel

# PROJ
wget http://download.osgeo.org/proj/proj-4.8.0.tar.gz
tar -zxvf proj-4.8.0.tar.gz
cd proj-4.8.0
./configure
make
sudo make install
cd ..

# GEOS
wget http://download.osgeo.org/geos/geos-3.4.2.tar.bz2
tar -xvf geos-3.4.2.tar.bz2
cd geos-3.4.2
./configure
make
sudo make install
cd ..

# GDAL
wget http://download.osgeo.org/gdal/1.10.1/gdal-1.10.1.tar.gz
tar -zxvf gdal-1.10.1.tar.gz
cd gdal-1.10.1
./configure
make
sudo make install
cd ..

# PostGIS
export LD_LIBRARY_PATH=/usr/local/pgsql/lib/:LD_LIBRARY_PATH
wget http://download.osgeo.org/postgis/source/postgis-2.1.0.tar.gz
tar -xvf postgis-2.1.0.tar.gz
cd postgis-2.1.0
./configure
make
sudo make install
cd ..
```

Told you it would take a while! All being well the script ran without any glitches and you should have Postgis working.

## Https

One other thing I needed to setup for this application was to configure https. [This documentation](http://docs.aws.amazon.com/elasticbeanstalk/latest/dg/configuring-https.html) talks you through how to set it up and in this example I'll simply use a self signed certificate. Do not use this production though, it's just for simplicity in this example!

Follow the steps to create private key, CSR and certificate, but I found I couldn't follow the rest of the steps to upload the certificate because the command line interface had changed from what the docs were describing so I had to hunt around for another way to do it.

Once again I had to go back to the EC2 Dashboard and on the list of options on the left hand side you'll see and option for 'Load Balancers' which you need to click.

Select your load balancer name and from the 'Actions' drop down select 'Edit listeners'.  Add a new protocol for HTTPS and then click to change the SSL certificate.

Now copy everything in your private key and certificate across to the relevant fields and your changes will be applied.  Now, go to Configuration once again, scroll to Load Balancing and click the gear icon.  From the next screen refresh the drop down for the SSL certificate ID and then choose your newly created certificate and apply the changes.

The final step I had to make was to go back to the EC2 Dashbaord and from there click 'Security Groups' on the left hand side. Then click the description with 'Elastic Beanstalk created security group used when no ELB ...' and from the options at the bottom of the screen select the 'Inbound' tab and then Edit. Now add a HTTPS protocol with any source.

## Finally

If you ```eb deploy``` now you should run through without errors.  You'll no doubt get an error about the certificate not being trusted when you visit your site but that's just because it's self signed and you can skip the warning. Just make sure to use a proper certificate in production.

I'm sure there's a much better way to add options in ```.ebextensions``` that would automate a lot of these steps and I'd really appreciate any feedback on how to do it because as things stand it's quite a cumbersome process that will be quite prone to error.

## Extra Notes

As a quick extra, if you ever need to pull a copy of your database from the server you can run the following from your instance:

```
pg_dump --host <enter your ec2 host> -p 5432 --username myusername --dbname mydbname > name_your_downloaded_db_file
```

and to get it onto your local host:

```
scp <enter your ec2 host>:/var/app/current/name_your_downloaded_db_file.sql
```

To go the other way and load a local db you can do the following:

```
sudo /etc/init.d/passenger stop
sudo su
RAILS_ENV=production bundle exec rake db:drop
RAILS_ENV=production bundle exec rake db:create
RAILS_ENV=production bundle exec rake db:migrate
```
and then from the terminal :

```
psql --host=<enter your ec2 host> --port=5432 --username=myusername --password ebdb < ~/Desktop/your_database.sql
```

and restart passenger from your instance:

```
sudo /etc/init.d/passenger start
```
