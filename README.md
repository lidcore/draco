# Welcome to Draco

## What's Draco?

Draco is a framework to write applications running on the `Google cloud` platform using the
Google Functions and Compute Engine.

Draco provides high-level, opiniated abstractions to produce code to be shipped on both services,
with a focus on making developement and production deployment quick and easy.

Draco is developped in the same spirit as the Rails framework and consists of a selection of default
tools and APIs along with pre-defined conventions to help speed up the development process.

## Compoments

Draco is based on the following elements:
- [node.js](https://nodejs.org/)
- [BuckleScript](https://bucklescript.github.io/)
- [Google Compute Node Client](https://github.com/googleapis/nodejs-compute)
- [Firebase Functions](https://firebase.google.com/docs/functions/)
- [Dotenv](https://github.com/motdotla/dotenv)
- [Winston/papertrail](https://github.com/kenperkins/winston-papertrail) (optional)

## Getting started

```
% npm init draco /path/to/code
```

This will initiate a new `draco` project using [create-draco](https://github.com/lidcore/create-draco).
