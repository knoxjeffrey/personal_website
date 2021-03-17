---
layout: post
title:  "Rails, AWS EC2 and Rubber Deployment"
date:   2016-09-19 23:23:00
categories: Rails
banner_image: ""
featured: false
comments: true
---

I'm back onto server setup on AWS and this time I have to setup a Rails application running on an EC2 instance.  After a bit of searching I came across [rubber](https://github.com/rubber/rubber) to help automate the process and followed along with a [Railscast](http://railscasts.com/episodes/347-rubber-and-amazon-ec2) to understand the process better.  It looked straightforward but when I got into it there where a few issues and a bit of work needed to use it in production.

<!--more-->

## Some extra setup

Follow along with the Railscast, create a basic Rails app (lets call it my_easy_deploy) and then install rubber with ```gem install rubber```. In my case I decided to use the complete_passenger_nginx_postgresql template with the command ```rubber vulcanize complete_passenger_nginx_postgresql``` and this should generate a lot of templates under the rubber directory in your application.

This was a new Rails 5 application and in my ```rubber-ruby.yml``` file I added the following:

``` ruby
ruby_build_version: 20160426
ruby_version: 2.3.1
```

I made some additions to the Gemfile that are needed especially rubber and capistrano without which the rubber commands will not work:

``` ruby
gem 'therubyracer', :group => :assets
gem 'rubber', '~>3.2.2'

group :development do
  gem 'capistrano', "~> 2.12"
end
```

I also discovered later that the version of nginx in the template causes errors when you go to deploy so in ```rubber_passenger_nginx.yml``` change the version to:

```ruby
passenger_version: '1:5.0.30-1~`lsb_release -sc`1'
```

## Rubber.yml

You can follow along with the Railscast for a lot of the things needed in the ```rubber.yml``` file as well as setting up in Amazon and adding a new keypair in the newly created ```./ec2``` directory:


```
mkdir ~/.ec2
mv ~/Downloads/my-easy-deploy.pem ~/.ec2/my-easy-deploy
chmod 600 ~/.ec2/my-easy-deploy
ssh-keygen -y -f ~/.ec2/my-easy-deploy > ~/.ec2/my-easy-deploy.pub
```

As you can see I changed the default ```gsg-keypair``` to my customised name ```my-easy-deploy```.  Here is everything in my ```rubber.yml``` file in which I made changes:

```ruby
app_name: my_easy_deploy
app_user: app
admin_email: jeff@primate.co.uk
timezone: UTC
domain: my-easy-deploy.com

rubber_secret: "#{File.expand_path('~') + '/.ec2' + (Rubber.env == 'production' ? '' : '/staging') + '/my-easy-deploy-rubber-secret.yml' rescue ''}"

cloud_providers:
  aws:
    region: us-east-1

    access_key: XXXX
    secret_access_key: XXXX
    account: XXXX

    key_name: XXXX
    key_file: XXXX

    image_type: XXXX
    image_id: XXXX

cloud_provider: aws

prompt_for_security_group_sync: false

staging_roles: "web,app,db:primary=true"
```

The most important aspect of the above code is the ```rubber_secret``` entry. I have a path in ./ec2 which will hold info for both the production and staging sites(```my-easy-deploy-rubber-secret.yml``` and ```staging/my-easy-deploy-rubber-secret.yml```). The data in these files actually takes precedence over the ```rubber.yml``` file which makes it perfect for holding sensitive data like keys, etc. The info in the ./ec2 directory does not get committed to the likes of github which means your sensitive data is safe. It's also great if you want to enter different setting for your production and staging servers. Everywhere I have XXXX above will be overwritten by the data in the ```my-easy-deploy-rubber-secret.yml``` files. Notes also that I limited the staging roles to help save on memory which is quite handy for micro instances.

With the rubber standard config you have to select a Ubuntu Server 14.04 and I initially I chose the following for my staging server:

```
image_type: m3.medium
image_id: ami-2d39803a
```

It turns out you need a [VPC setup](https://console.aws.amazon.com/vpc/home) on AWS to use the free/cheap t2 instances as [described here](http://www.clovescarneirojr.com/2016/02/10/deploy-rails-app-to-aws-vpc-ec2-rds-elb.html). Here's the settings I have used on my staging server:

```ruby
vpc_alias: "#{app_name}_#{Rubber.env == 'production' ? 'production' : 'staging'}"
vpc_cidr: 10.0.0.0/16
private_nic:
  subnet_cidr: '10.0.0.0/24'
  gateway: public
image_type: t2.micro
image_id: ami-2d39803a
```

Once again I put this under my ```my-easy-deploy-rubber-secret.yml``` files in order to use different settings for production and staging.

## Github deployment

Deploying from git was something I had to piece together from various articles online so hopefully this will help someone. Rather than storing any github keys on the server I will take advantage of ssh agent forwarding which will allow my key to be forwarded from my local machine to my server. Github has a [great article to follow to generate the key](https://help.github.com/articles/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent/). This [article](https://developer.github.com/guides/using-ssh-agent-forwarding/) has some useful info, especially at the bottom for permanently adding your key to the keychain.

You will also have to make changes to your ```deploy.rb``` file:

```ruby
set :scm, :git
set :repository, "git@github.com:USERNAME/REPO.git"
set :branch, "master"
set :repository_cache, "git_cache"
set :deploy_via, :remote_cache
set :ssh_options, { :forward_agent => true }
```

Obviously you have to change USERNAME and REPO to suit your application settings. I haven't managed to get round to it yet but I'll set things up to use different branches for production and staging.

One last thing you need to do to allow ssh agent forwarding is to open up ~/.ssh/config and add the following:

```
Host *.amazonaws.com
  ForwardAgent yes
Host *
  ForwardAgent no
```

In my case I've allowed everything from amazonaws.com but you can tighten this security up as much as you like.

## Managing secrets

I normally have my sensitive Rails data under ```config/secrets.yml``` but you must ensure to add this to .gitignore so as not to expose the data on github by adding ```/config/secrets.yml```. This raises the question of how to add it on the server.

First up, add a new file called ```deploy-secrets.rb``` to the rubber directory in your app.  All of the files beginning with ‘deploy’ in the rubber directory are automatically loaded by deploy.rb with this section of code:

```ruby
# load in the deploy scripts installed by vulcanize for each rubber module
Dir["#{File.dirname(__FILE__)}/rubber/deploy-*.rb"].sort.each do |deploy_file|
  load deploy_file
end
```

Code for ```deploy-secrets.rb```:

```ruby
namespace :rubber do

  namespace :secrets do

    rubber.allow_optional_tasks(self)

    desc <<-DESC
      Creates the secrets.yml configuration file in shared path.
    DESC
    task :setup, :except => { :no_release => true } do

      default_template = <<-EOF
      staging:
      production:
      EOF

      config = ERB.new(default_template)

      run "mkdir -p #{shared_path}/config"
      put config.result(binding), "#{shared_path}/config/secrets.yml"
    end

    desc <<-DESC
      [internal] Updates the symlink for secrets.yml file to the just deployed release.
    DESC
    task :symlink, :except => { :no_release => true } do
      run "ln -nfs #{shared_path}/config/secrets.yml #{release_path}/config/secrets.yml"
    end

  end

  after "deploy:setup",           "rubber:secrets:setup"
  after "deploy:finalize_update", "rubber:secrets:symlink"
end
```

This will create a ```secrets.yml``` file in ```/mnt/shared/config ``` on your server during the initial deploy setup. The file is then symlinked to your app folder in ```config/secrets.yml```. This allows us to persist the ```secrets.yml``` file between every deploy.

## Deploying

From the command line run ```cap deploy RUBBER_ENV=staging``` to create your staging site. This will take a while and once it's done if you try to navigate to your site you will find that it doesn't work.

In order to get it working you need to ssh into the server to add some info to your secrets file.

You can ssh by using the following, ```ssh -i ~/.ec2/PRIVATE-KEY ubuntu@PUBLIC-DNS``` and add in your own PRIVATE-KEY and PUBLIC-DNS. Navigate to:

```
cd /mnt/APP_NAME/shared/config/secrets.yml
```

and as this is a staging server add the following:

```ruby
staging:
  secret_key_base: xxxxxxxx
  secret_token: xxxxxxx
```

and once again add your own keys by running ```rake secret``` from the terminal for each one.

Finally, run ```cap deploy RUBBER_ENV=staging``` and your application should be running on your staging server without any issues!  For your production server, the Railscast has more great info in order to get it all working.

## Still not working?

Click on your instance in the ec2 control panel and follow the link for the security group for that instance. Check under the inbound rules that you have rules for:

```
HTTP at port 80 with source 0.0.0.0/0
```

and

```
HTTPS at port 443 with source 0.0.0.0/0
```

## Handy commands

Here's a list of useful rubber commands which your can use for staging or just drop the RUBBER_ENV for production.

To create your staging site:

```
cap RUBBER_ENV=staging rubber:create_staging
```

To kill your staging site:

```
cap rubber:destroy_staging RUBBER_ENV=staging
```

To deploy your code changes:

```
cap deploy RUBBER_ENV=staging
```

To backup your database:

```
cap rubber:util:backup RUBBER_ENV=staging
```

To restore database from cloud:

```
cap rubber:util:restore_cloud RUBBER_ENV=staging
```

To check available memory:

```
COMMAND="free -m" cap invoke RUBBER_ENV=staging
```

## Need to swap out databases?

First run ```cap rubber:postgresql:stop``` to stop postgres. Then ssh into your application and run ```bundle exec rake db:drop```.  In order to create a new database you'll have to open your ```database.yml``` file and add the following line at the bottom, ```template: template0``` otherwise you will get errors. Now you can run ```bundle exec rake db:create``` followed by ```bundle exec rake db:migrate```. Say you have a previously saved database in ```/mnt/db_backups``` then you can unzip this with ```sudo gzip -d staging_dump_2016-09-19_23-38.sql.gz``` for example and then load in the unzipped database with

```
psql -U "my_easy_deploy" "my_easy_deploy_staging" < /mnt/db_backups/staging_dump_2016-09-19_23-38.sql
```

where ```my_easy_deploy``` is the username and ```my_easy_deploy_staging``` is the database as specified in ```database.yml```.

## More to do

I'm still working with EC2 deploys and I'll add more info to this article if I come across anything that might be helpful. Hopefully though this will give you some help to get you started!

## Edit 5th Oct 2016

I mentioned above in the section about swapping out databases that you ssh into your application to run the rake task. If you would like to run any rake task from the terminal then you can add the following to your deploy.rb file:

```ruby
namespace :run_rake do
  desc "Run a task on a remote server."
  task :invoke do
    run("cd #{deploy_to}/current && bundle exec rake #{ENV['task']} RAILS_ENV=#{rails_env}")
  end
end
```
Then run ```cap run_rake:invoke task="db:reset"``` for example.

## Edit 16th Oct 2016

I'm adding a little more info here about uploading images as this took a while for me to complete. I used Carrierwave and Image Magick to upload my images to an S3 bucket. I won't go into that setup too much as it's well documented elsewhere. Howver, one additional thing I wan't to do was to to further reduce my png files and for that I used [pngquant](https://pngquant.org/). This can be installed locally with ```brew install pngquant``` and on your Ubuntu server with:

```
sudo apt-get update
sudo apt-get install pngquant
```

Additionally you will need the following packages on your server:

```
sudo apt-get install libjpeg62
sudo apt-get install libpng-dev
sudo apt-get install imagemagick
```

A further 2 gems were needed for image optimisation:

```
gem 'piet'
gem 'piet-binary'
```

With those gems in place and pngquant all I needed to add to my uploader file was the following:

```
process :resize_to_limit => [600, 600]
process :pngquant
```

One other problem you'll come across when trying to upload to S3 on your server is that the image processing requires an uploads folder to be created so I added the following to the```deploy.rb``` file:

```
# uploads directory
after "deploy:update_code", "create_uploads_dir"
task :create_uploads_dir, :roles => [:app] do
  run "cd #{shared_path} && mkdir -p uploads && cd #{release_path} && ln -s #{shared_path}/uploads #{release_path}/public/uploads"
end
```

Finally, I was having trouble uploading large files on my server as was getting an error from nginx.  I solved this by add the following to the html section of the ```nginx.conf``` file in the rubber directory:

```
client_max_body_size 3M;
```

and obviously change the value to whatever suits you.

The 2 amazing parts of pngquant were that the image process took almost zero extra time but reduced my file sizes from around 400kb down to 100kb with no noticable loss in quality!
