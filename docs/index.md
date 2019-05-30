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
- [BsAsyncMonad](https://github.com/lidcore/bs-async-monad)
- [Packer](https://www.packer.io/)
- [Google Compute Node Client](https://github.com/googleapis/nodejs-compute)
- [Firebase Functions](https://firebase.google.com/docs/functions/)
- [Dotenv](https://github.com/motdotla/dotenv)
- [Winston/papertrail](https://github.com/kenperkins/winston-papertrail) (optional)

## Getting started

```
% npm init draco /path/to/code
```

This will initiate a new `draco` project using [create-draco](https://github.com/lidcore/create-draco).

## Basic layout

The basic layout for a draco project is defined in the [create-draco](https://github.com/lidcore/create-draco) repository. Here are the typical directories and their meaning:

* `config/<stage|production`: contains the project's configuration files, `dotenv` for all the variables to add to the environment and `draco.yml` to configure the `packer` build. `draco.yml` is parsed and merged with the default configuration at [lidcore/draco/config.yml](https://github.com/lidcore/draco/blob/master/config.yml)
* `src/functions`: contains all the firebase/gcloud function definitions. Files in this directory are implicitely loaded when required and functions are registered via the `Functions` `API` and should be exported in the `mli` files with type `Functions.fn`.
* `src/instances`: contains all the definitions for the gcloud instances. Files in this directory are implicitely loaded when required. Instances are registered via the `Instances` `API`.
* 

## Draco command

The npm package `draco` ships with a `draco` command line that is used to build and setup your project. Here are its main options:

- `draco functions`: Deploy functions code. See [Functions documentation](functions.html)
- `draco image`: Build instances image. See [Image documentation](image.html)
- `draco import`: Import modules from the `LidcoreDraco` namespace. See [Import documentation](import.html)
- `draco instances`: Manage instance groups. See [Instances documentation](instances.html)

## API documentation

See [Api documentation](api)
