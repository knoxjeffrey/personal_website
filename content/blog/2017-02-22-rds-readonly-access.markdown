---
layout: post
title:  "RDS Readonly Access"
date:   2017-02-22 15:34:00
categories: AWS
banner_image: ""
featured: false
comments: true
---

I had to give readonly access to my Amazon PostgresSQL RDS today and I thought I'd document the steps here for anyone else that might need and to speed up the process next time I do it. It's pretty quick so this will be a short post.

<!--more-->

## Postgres

The following command structure (replacing the XXXX with your own data) from your localhost should grant you access:

```
psql --host XXXX.XXXX.us-west-2.rds.amazonaws.com --port 5432 --username XXXX --dbname XXXX
```
If you have problems getting access then you might have to make an addition to your RDS Security Group. Visit the EC2 Dashboard and then click Security Groups under Network and Security. Click on the row for your RDS security group and then click the Inbound tab. Click Edit and then Add Rule. The type will be PostgresSQL, protocol TCP, Port Range 5432 and then add your IP address (or whatever other way you want to authenticate) to get access.

Try the psql command again and this time you should get access.

## Readonly Commands

The following command will setup readonly access courtesy of [this blog](https://blog.ed.gs/2016/01/12/add-read-only-postgres-user).  He also has the command for [MySQL here](https://blog.ed.gs/2016/01/06/add-read-only-mysql-user/).

```
CREATE USER readonly_user WITH ENCRYPTED PASSWORD 'readonly_user_password';
GRANT CONNECT ON DATABASE ebdb TO readonly_user;
GRANT USAGE ON SCHEMA public TO readonly_user;
GRANT SELECT ON ALL SEQUENCES IN SCHEMA public TO readonly_user;
GRANT SELECT ON ALL TABLES IN SCHEMA public to readonly_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO readonly_user;
```

Double check the user is in the list of users with:

```
select usename from pg_user;
```

## AWS Security Group

Following the setup, you can test the login with the new username and password.  If all that works well then you might want to remove the security group ip you added.

Following this I granted access to the API which was created on our AWS account by adding another rule and this time using the security group id of the API.

That's all there is to it!
