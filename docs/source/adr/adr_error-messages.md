---
# Configuration for the Jekyll template "Just the Docs"
parent: Decisions
nav_order: 100
title: "Error message types"

# These are optional elements. Feel free to remove any of them.
status: "In review"
---
<!-- we need to disable MD025, because we use the different heading "ADR Template" in the homepage (see above) than it is foreseen in the template -->
<!-- markdownlint-disable-next-line MD025 -->
# Accessibility testing methods

## Context and Problem Statement

We use error messages across the application, many of which follow certain patterns. We also have a challenge of translating all content, including those messages, which increases for each unique string. This decision record seeks to resolve both issues.

YYY and XXX have proposed an initial set of [patterns](#patterns) below guide that could be used for either option 1 or 2 below. Either way, those exact patterns should be considered independent of this decision itself, just presented as a clear example of the outcome of this decision.

## Considered Options

1. Create a set of patterns for all fields to use exactly
2. Create a set of patterns to use as a guide for many unique strings
3. Use any string we want in each error messages

## Decision Outcome

Chosen option: "Create a set of patterns for all fields to use exactly", because it minimizes translation cost, maximizes engineering efficiency, and minimizes content review.

### Consequences

* Good, because it maximizes consistency in implementation
* Good, because only the source strings need content review and translation work
* Good, because all instances of the string can be updated in one code change
* Good, because it sets a consistent content UX
* Neutral, because some fields may still need custom strings
* Bad, because some strings will be ok but not great for some instances

## Pros and Cons of the Options

### Create a set of patterns to use as the sole source for all fields

* Good, because it maximizes consistency in implementation
* Good, because only the source strings need content review and translation work
* Good, because all instances of the string can be updated in one code change
* Good, because it sets a consistent content UX
* Neutral, because some fields may still need custom strings

### Create a set of patterns to use as a guide for field-specific strings

* Good, because it sets a clear expectation for implementation
* Neutral, because similar/same strings may be easily discovered and grouped for content review and translation work
* Bad, because every string needs its own translation work
* Bad, because every string needs engineering work to update it

### Use any string we want in each error message

* Good, because it maximizes flexibility for initial implementation
* Bad, because every string needs its own content review and translation work
* Bad, because every string needs engineering work to update it
* Bad, because it may be confusing if the same type of error has different formulations across fields

## Patterns

| Type           | Formula                           | Examples                                                                                                                                                                                         |
| -------------- | --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Required       | This is required                  | [Same]                                                                                                                                                                                           |
| Match/re-enter | This does not match               | [Same, and the field label should indicate what it matches to]                                                                                                                                   |
| Length maximum | Must have fewer than [x] [y]      | Must have fewer than 8 numbers<br>Must have fewer than 8 numbers and letters                                                                                                                     |
| Length minimum | Must have at least [x] [y]        | Must have at least 16 numbers                                                                                                                                                                    |
| Length target  | Must have exactly [x] [y]         | Must have exactly 10 numbers                                                                                                                                                                     |
| Length range   | Must have between [x] and [y] [z] | Must have between 8 and 16 numbers                                                                                                                                                               |
| Amount maximum | Must be less than [x]             | Must be less than 100                                                                                                                                                                            |
| Amount minimum | Must be at least [x]              | Must be at least 10                                                                                                                                                                              |
| Amount range   | Must be between [x] and [y]       | Must be between 10 and 100                                                                                                                                                                       |
| Date maximum   | Must be [x] or earlier            | Must be December 31, 2023 or earlier;<br>Must be today or earlier;<br>Must be tomorrow or earlier;<br>Must be yesterday or earlier                                                               |
| Date minimum   | Must be [x] or later              | Must be January 1, 2023 or later;<br>Must be today or later;<br>Must be tomorrow or later;<br>Must be yesterday or later                                                                         |
| Date range     | Must be between [x] and [y]       | Must be between January 1, 2023 and December 31, 2023;<br>Must be between January 1, 2023 and today;<br>Must be between today and tomorrow;<br>Must be between yesterday and tomorrow            |
| Allow list     | Must have only [x]                | Must have only English letters;<br>Must have only numbers;<br>Must have only English letters and numbers;<br>Must have only numbers, parentheses, and apostrophes;<br>Must have only !@#$%^&\*() |
| Example        | This should look like [x]         | This should look like username@website.com;<br>This should look like 123-456-7890                                                                                                                |
