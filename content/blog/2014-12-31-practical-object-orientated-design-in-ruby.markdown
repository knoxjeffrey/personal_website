---
layout: post
title:  "Practical Object-Orientated Design In Ruby"
date:   2014-12-31 11:23:00
categories: Ruby
banner_image: "/media/book.jpg"
featured: true
comments: true
---

Just a quick post about a book I got for Christmas called [Practical Object-Orientated Design In Ruby](http://www.poodr.com/).  I've only just read the first chapter but already I'm seeing ways I could have improved the Blackjack game that I wrote in OO style.

<!--more-->

The main area for change that stood out was due to the array structure of holding the suit and value of each card.  Essentially I had a deck of cards with an array structure of [[suit, value], [suit, value]...].  The problem is that methods would need to know the exact details of the array structure to be able to access it properly and this breaks the rules of encapsulation.  It is also not DRY because the knowledge that suits are at index 0 and values at index 1 should not be repeated throughout the program.

Although with cards the structure is unlikely to change and wasn't such a big issue in this case, there will be other times where the structure could change a lot and would require me to make array reference changes all over the program.

A better way would have been to have only one place in the code that has knowledge of the structure of the array. So as an example I could have done this:

    class Card

      SUITS  = ['♥', '♦', '♠', '♣']
      VALUES = [ 2, 3, 4, 5, 6, 7, 8, 9, 'J','Q','K','A']

      attr_reader :suit, :value

      def initialize(suit, value)
        @suit  = suit
        @value = value
      end
      
    end
    
    class Deck

      require_relative 'card'
      attr_reader :cards

      def initialize
        suits_and_values = Card::SUITS.product(Card::VALUES)
        @cards = suits_and_values.map { |suit_and_value| Card.new(suit_and_value[0], suit_and_value[1]) }
      end

    end
    
Now I have an array of Card objects and can just call cards.suit and cards.value without having to know anything about the structure of the array and if the order of the array structure is changed or new things added then my code will not break.

Anyway, thought I'd post the name of the book on here for anyone else that might be interested in reading it.  It's written in a really straight forward way with examples that I can follow quite easily even at my early stages of learning Ruby.