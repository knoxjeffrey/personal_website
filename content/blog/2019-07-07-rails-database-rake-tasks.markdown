---
layout: post
title:  "Rails database rake tasks"
date:   2019-07-07 00:00:00
categories: Rails
featured: false
comments: true
---

In my previous job I found myself regularly having to copy the database for a Rails site on staging or production
to my local machine to make it easier to work through issues.

<!--more-->

## Pull database to development

This is a simple example you can adapt to your needs to quickly pull down a database to your local machine.

```bash
# rake db:pull[<environment to pull from>,<your local db username>]
# eg. rake db:pull[staging,postgres]
namespace :db do
  desc 'Pull specified db to development'
  task :pull, :environment, :dev_db_user do |_t, args|
    environment = args[:environment].to_sym
    dev_db_user = args[:dev_db_user]
    dev = Rails.application.config.database_configuration['development']
    dumpfile = "#{Rails.root}/tmp/latest.dump"

    ssh = Rails.application.credentials[environment][:ssh]
    ssh_port = Rails.application.credentials[environment][:ssh_port]
    db_user = Rails.application.credentials[environment][:db_user]
    db_password = Rails.application.credentials[environment][:db_password]
    db_name = Rails.application.credentials[environment][:db_name]
    db_host = Rails.application.credentials[environment][:db_host]
    pg_command = Rails.application.credentials[:pg_command]

    puts 'PG_DUMP on specified database...'
    system "ssh #{ssh} -p #{ssh_port} 'PGPASSWORD=\"#{db_password}\" #{pg_command}/pg_dump -U #{db_user} #{db_name} -h #{db_host} -F t' > #{dumpfile}"
    puts 'Pulled!'

    puts 'PG_RESTORE on development database...'
    system "pg_restore --verbose --clean --no-acl --no-owner -h localhost -U #{dev_db_user} -d #{dev['database']} #{dumpfile}"
    puts 'Done!'
  end
end
```

## Copy database from staging to production

Another frequent task would be when setting up the site with a client on a staging environment and then needing
to copy across all of their content to the production database when the site was ready to go live. Below is
another example that helps with just that.

```bash
# rake db:staging_to_production
# eg. rake db:staging_to_production
namespace :db do
  desc 'Pull specified db to development, move to production'
  task :staging_to_production do
    dumpfile = "#{Rails.root}/tmp/latest.dump"

    ssh = Rails.application.credentials[:staging][:ssh]
    ssh_port = Rails.application.credentials[:staging][:ssh_port]

    db_staging_user = Rails.application.credentials[:staging][:db_user]
    db_staging_password = Rails.application.credentials[:staging][:db_password]
    db_staging_name = Rails.application.credentials[:staging][:db_name]
    db_staging_host = Rails.application.credentials[:staging][:db_host]

    db_production_user = Rails.application.credentials[:production][:db_user]
    db_production_password = Rails.application.credentials[:production][:db_password]
    db_production_name = Rails.application.credentials[:production][:db_name]
    db_production_host = Rails.application.credentials[:production][:db_host]

    pg_command = Rails.application.credentials[:pg_command]

    puts 'PG_DUMP on staging database...'
    system "ssh #{ssh} -p #{ssh_port} 'PGPASSWORD=\"#{db_staging_password}\" #{pg_command}/pg_dump -U #{db_staging_user} #{db_staging_name} -h #{db_staging_host} -F t' > #{dumpfile}"
    puts 'Pulled!'

    puts 'SCP database from local to server'
    system "scp -P #{ssh_port} #{dumpfile} #{ssh}:"
    puts 'Transferred!'

    puts 'PG_RESTORE on production database...'
    system "ssh #{ssh} -p #{ssh_port} 'PGPASSWORD=\"#{db_production_password}\" #{pg_command}/pg_restore --verbose --clean --no-acl --no-owner -h #{db_production_host} -U #{db_production_user} -d #{db_production_name} latest.dump'"
    puts 'Done!'
  end
end
```
