---
layout: post
title:  "The Bulba Handbook"
date:   2016-11-18 00:00:00
categories: Work
banner_image: "/media/bulba.jpg"
featured: true
comments: true
---

[HAVAmedia](http://www.havamedia.com) wanted to create a handbook for the imminent release of Pokémon Sun & Moon to compliment their existing Bulbapedia wiki and capture a wider user base.

<!--more-->

## Website

[https://bulbahandbook.bulbagarden.net](https://bulbahandbook.bulbagarden.net)

## Technology

Ruby on Rails, PostgreSQL, Elastic Beanstalk, javascript, SCSS

## My involvement

An exciting but challenging project to build a Pokémon Sun & Moon guide in less than 3 months that would cater for 40 million users per year. I was the sole backend developer and had to quickly get up to speed with the game to help me architect a well designed database that could also adapt to easily add more games down the line.

I built the admin system for the content team with Active Admin to allow them to easily update the information but given such short time scales we had to get over 50,000 database entries plus thousands of images uploaded onto the system for launch. I was able to take existing csv files from their main wiki page and use that to seed the database plus scrape the exiting wiki page for the images needed.

I spent a lot of time making the database queries as efficient as possible to increase speed and reduce costs of the Elastic Beanstalk server that I setup.

Things went very well and the site had over 2 millions visitors in the first month who were extremely complimentary about the site.

For more, see the case study at [Primate](https://www.primate.co.uk/clients/bulba).
