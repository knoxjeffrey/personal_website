---
layout: post
title:  "URL and HTTP Reminder"
date:   2015-01-20 14:52:00
categories: Web Development
banner_image: ""
featured: false
comments: true
---

This is just a quick reminder on the make up of a URL and basic details of a HTTP request/response cycle.

<!--more-->

##URL

The following Uniform Resource Locator (URL), http://www.example.com/new, can be split into 3 parts

1. http - The URL scheme

2. www.example.com - the resource path or host

3. /new - URL path

Additionally URL's contain a port number which the host uses to listen to HTTP requests eg. http://www.example.com:80/new.  The port is not always specified and port 80 will be used by default in normal HTTP requests.

##HTTP

####Request


- Verb/Method: GET, POST

- URL

- parameters
  
####Response

- Status code
  - 200 OK
  - 302 Redirect
  - 404 File not found
  - 500 Application error
  
- payload/body
  - HTML, XML, JSON, etc
    
Remember that the request/response is stateless, ie requests are not connected.
  
For example
  
GET /page_with_form_on_it
  - render a view: 200 and an HTML payload (completes the response).
  - form is displayed for the user to enter data.

POST /page_with_form_on_it
  - save the data somewhere, say a database.
  - display the next thing. Redirect to another URL: 302 and next URL (completes the response). May also render again if there are errors on the form.

GET /the_next_thing

That's it just a quick blog post as a reminder of some of the basics.
  