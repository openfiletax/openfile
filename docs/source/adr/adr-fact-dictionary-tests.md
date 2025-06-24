---
# Configuration for the Jekyll template "Just the Docs"
parent: Decisions
nav_order: 100
title: "Fact-dictionary Testing"

# These are optional elements. Feel free to remove any of them.
status: "Proposed"
date: "2023-07-21"
---
<!-- we need to disable MD025, because we use the different heading "ADR Template" in the homepage (see above) than it is foreseen in the template -->
<!-- markdownlint-disable-next-line MD025 -->
# Fact-dictionary testing

## Context and problem statement

The core logic for how we calculate taxes is expressed through the Fact Dictionary, a configuration of the Fact Graph akin to a database schema (including something akin to views, via our derived facts). Currently, however, we have no direct way to test these configurations; we can test the client and then get at values, but the dictionary is used in more than just the client, and tests for it don't naturally belong there.

## Desirable solution properties

We'd like the solution to this problem to

1. Create test artifacts that can be verified by non-programmer tax experts
2. Allow for quick feedback cycles for developers editing the fact dictionary
3. Alert developers to regressions or new bugs while editing the fact dictionary
4. Identify calculation differences between the frontend and backend

## Considered options

1. Testing via the client directly, by writing vitest tests
2. Testing via calls to the spring API
3. Testing via spreadsheets, using the client test runner as a harness
4. Tests via spreadsheets, using a new scala app that runs tests against the JVM and Node

## Decision Outcome

Chosen option: Test via spreadsheets that are parsed by the client, using the client test runner as a harness. The spreadsheets will test common and edge tax scenarios, to identify possible errors in the fact dictionary.

In some detail, we will
- Create a series of workbooks that have a sheet of "given facts" full of paths to writable facts and their values and a sheet of "expected facts" of derived facts and their expected values.
- Create a test harness (using the JS libraries we use for the client) to watch and execute tests against these spreadsheets, effectively setting everything in the given sheet on a factgraph and then asserting each path in the expected sheet equals its value

### Consequences:

1. Good: If we get the spreadsheet format to be readable enough, we should be able to have the spreadsheets reviewed by someone at the IRS to check for correctness
2. Good: The client APIs are pretty quick to work with, and the vitest runner is familiar and fun
3. Good: Most of the fact dictionary edits happen while building out client code, so the feedback happens where we want it, during the normal development workflow
4. Good: Assuming we get a format we like, it wouldn't be too outlandish to run the same tests against the JVM by rewriting the test harness --- creating the test cases is the really hard part
4. Less good: We're going to be abusing vitest
5. Less good: We won't identify differences between the backend and frontend
6. Neutral but I don't like it: coming up with examples is both subjective and difficult, since you have to do taxes correctly

### Discussion

During the discussion in despair, we decided that looking for differences in the frontend and backend was distinctly secondary and could come later.

Chris made two helpful suggestions:

- We can mine VITA Volunteer Assistors test ([pub 6744](https://www.irs.gov/pub/irs-pdf/f6744.pdf)) for scenarios to test. Sadly, there is no answer key included.
- We will likely want to be able to base scenarios on one another (which I called spreadsheet inheritance to make everyone sad), so that we can test variations

## Pros and Cons of other options

### Testing via the client directly, by writing vitest tests

#### Pros

- Really straightforward, since we just write some tests
- Gets us tests

#### Cons

- Not easily reviewable by non-programmers
- Checking the tests on the JVM requires rewriting all of them

### Testing via calls to the spring API

#### Pros

- Probably good tooling exists --- it's spring
- Checks the test cases against the JVM

#### Cons

- Requires new Java APIs just for this
- Requires running the backend just to run the tests, which isn't where most fact dictionary changes happen

### Tests via spreadsheets, using a new scala app that runs tests against the JVM and Node

#### Pros

- All the pros of the chosen approach, plus gives us Node and JVM testing

#### Cons

- Just literally harder --- we have a lot of what we need in the client already, we'd be spinning up another scala app just for this
- Outside of the usual workflow, since devs would need to run a separate scala build tool just for testing fact dictionary changes

