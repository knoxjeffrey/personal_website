---
layout: post
title:  "Middleman Deploy"
date:   2018-02-01 00:00:00
categories: Ruby
featured: false
comments: true
---

I was recently developing a single page application with Middleman and found there was no ready made deployment code that I could use to upload the site to our Linode servers. Hopefully this rake task will help others out.

<!--more-->

## Rake task

Simply create a new ```Rakefile``` in the root of your project and paste the below code, changing the constants at the top (everything inside the '') to suit your needs.  This will deploy the site, keep the latest 3 uploads and symlink the latest deploy to the live version.

```bash
SSH_USER = '< your user >'
SSH_HOST = '< your ssh host >'
SSH_PORT = '< your port >'
SSH_DIR  = '< your ssh directory >'

desc "Run the preview server at http://localhost:4567"
task :preview do
  system("middleman server")
end

desc "Remove the build folder"
task :clean do
  puts "-----> Remove old build folder"
  rm_rf "build"
end

desc "Build the website from source"
task :build => :clean do
  puts "-----> Building website"
  status = system("middleman build --clean")
  puts status ? "OK" : "FAILED"
end

desc "Build and deploy the website"
task :deploy => :build do
  puts "-----> Build timestamped folder in releases with permissions and then delete all other folders except latest 3"
  timestamp = Time.now.to_i
  releases_folder = "#{timestamp}/build"
  status = system("ssh -t #{SSH_USER}@#{SSH_HOST} -p #{SSH_PORT} 'cd #{SSH_DIR}; sudo mkdir -p #{releases_folder}; sudo chown -R #{SSH_USER}:#{SSH_USER} #{releases_folder}; sudo chmod 775 #{releases_folder}; ls -t | tail -n +4 | sudo xargs rm -rf'")
  puts status ? "OK" : "FAILED"

  puts "-----> Deploying website via scp to #{SSH_HOST}"
  status = system("scp -P #{SSH_PORT} -r build/* #{SSH_USER}@#{SSH_HOST}:#{SSH_DIR}/#{releases_folder}")
  puts status ? "OK" : "FAILED"

  puts "-----> Symlinking latest release to live version"
  status = system("ssh -t #{SSH_USER}@#{SSH_HOST} -p #{SSH_PORT} 'cd #{SSH_DIR}; cd ..; sudo ln -nfs #{SSH_DIR}/#{releases_folder} current'")
  puts status ? "OK" : "FAILED"
end
```
