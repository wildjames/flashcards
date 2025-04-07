# Flashcards

This is a simple project - I want flashcards, that I can sort into sharable (and searchable) groups, which can be set to get updated from whatever store people are already using.

Essentially, it's intended to be a quasi-scraper that funnels into a flashcard app.
Currently, I have about half the app.
I also want a browser extension, which interrupts requests at random, presents the user with a question, then redirects them on to wherever they were going to before. This will probably be very annoying for 99% of people, but it'd get the learning done in small pieces, so could be effective.

There's a React frontend and a Flask backend, and each has it's own TODO list in its respective readme. I started a little bit of work on the chrome extension, but that's stalled by the larger app needing a lot of work still.

This is dockerised, and hosted [here](https://flashcards.wildjames.com). Account creation works, but there's no password recovery yet so remember your password!

## TODO

- [x] Add people to groups
  - [x] Backend
  - [x] Frontend
- [x] Remove people from groups
- [x] Basic Bulk imports
  - [ ] Google Sheets imports \[WIP\]
  - [ ] Webpage imports?
  - [ ] Confluence imports?
- [ ] Browser Extension
