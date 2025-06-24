# Direct File Development 2024

Date: 06/14/2024

## Status

## Context

In our current state, Direct File cannot support filing taxes for two different tax years. That is, we cannot
make changes that expand our tax scope or prepare us for TY 2024 without causing breaking changes to TY 2023 functionality.

As an example of this, we've added a new required question for schedule B that asks every taxpayer, "Do you have a foreign bank account?". Since that question is new and required, every person who submitted a tax return for 2023 now has an incomplete tax return against main. 

We essentially have two options:
1. We can build a new system where we maintain multiple versions of the flow, fact dictionary, mef, and pdf that support multiple tax years and scopes at one time. This is a lot of work to do.
2. We can not worry about backcompatibility and block production users from accessing the flow/fact graph. We use generated PDFs to expose last year's answers to the user. We have to build a way to block users from accessing the flow in production, but don't need to maintain multiple versions of the app. There is still a consequence that users will never be able to re-open last year's tax return in the flow. 


## Decision 
- Next year, we will probably have to deal with multi-year support and multiple fact dictionaries/flows/etc. But this year, we're concentrating on expanding our tax scope to expand to more users. That is the priority, rather than providing a good read-experience for last year's 140k users.
- We are ok to make non-backwards compatible changes. We can make changes that will break an existing user's fact graph. We will never try to open last year's users returns in a fact graph on main.
- We're going to continue deploying 23.15 to prod through late June 2024, possibly into Q3 2024, until a point where:
    - We have generated all existing users tax returns into PDFs
    - We have a feature flagging method so that existing users in prod will be able to download their tax return as a PDF in prod
    - Users in other test environments will be able to run with the new enhanced scope and we'll be building for next year. 

There's additional product thought that needs to go through what the TY2024 app looks like for users who filed in TY2023 through Direct File.



## Consequences
- This means that we will need to apply security patches to 23.15 separately from main. We should probably also set it to build weekly/regularly.
- Main is going to move ahead for TY2024. The next version of Direct File will always be the best one. 
- We have work to do to put in a feature flag for last year's filers' experience in production so that those users will be able to download last year's tax return as a PDF. 
