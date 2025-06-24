Created At: 2, Aug, 2024

RFC: Introducing Javascript/Typescript to DF Backends

# Problem Statement

Currently, all of our backend code is written in Java [^1]. We have a couple use cases where this might not be ideal:
1) One off production remediation code during filing season
2) Logic that is shared between the frontend and the background

[^1] Two exceptions worth noting - (1) we have simulators for development which are in python and (2) our fact graph is written in scala and runs on the JVM.

# Background

## Languages and Toolchains

We want to minimize the number of languages and toolchains in direct file. This has the following benefits:
- Less engineering time spent on configuring linting/ci/testing infrastrcuture
- Easier for an individual engineer to ramp up on the end to end of a product scenario
- Eliminates the need for handoffs between language boundaries

## Shared Frontend <> Backend Logic

Today we have our factgraph logic shared between the frontend and backend. We achieve this by transpiling scala into javascript. Many projects eventually want to share logic between frontends and backends and javascript is the lowest overhead approach to do this. Although we're not sure how the factgraph will evolve over time, one possibility is running in serverside via a javascript lambda.


## One-off Remediations
In production during filing season, we often want to run code in a production environment to fix issues. We do this using lambdas triggered s3 file notifications in production. These can often be written faster in a dynamic language like javascript/python/ruby. Going into filing season 2025 we would like to have the capability to run these type of remediation lambdas on a dynamic language.


# Decisions

Enable lambdas running the most recently available node lts in direct-file, start experimenting with appropriate usage.
