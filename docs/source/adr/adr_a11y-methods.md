---
# Configuration for the Jekyll template "Just the Docs"
parent: Decisions
nav_order: 100
title: "Accessibility testing methods"

# These are optional elements. Feel free to remove any of them.
status: "Accepted"
date: "2023-07-11"
---
<!-- we need to disable MD025, because we use the different heading "ADR Template" in the homepage (see above) than it is foreseen in the template -->
<!-- markdownlint-disable-next-line MD025 -->
# Accessibility testing methods

## Context and Problem Statement

Section 508 describes ways we can support people with disabilities, and many accessiblity tech/tools (AT) exist that support various tasks. We on this project team can use those tools to inspect our work, and we can use other tools that can simulate how those tools might work with the code we push to this repository. This decision record sets how we achieve our accessibility target (set in the "Accessibility Target" DR) in an agile way.

## Considered Options

* Review accessibility factors in every PR, where applicable
* Review accessibility factors at least every other sprint (once per month)
* Review accessibility factors in the final stages of this project before release
* Supplement manual review with automated accessibility review using a tool like pa11y

## Decision Outcome

Chosen option: "Review accessibility factors in every PR, where applicable", because our goal is to prioritize accessibility, and this saves us time in the long run by not introducing any problems that could best be fixed at a PR level. 

Per discussion internally and with TKT, team will be shifting towards (1) "Review accessibility factors at least every other sprint (once per month)"; and (2) "Supplement manual review with automated accessibility review using a tool like pa11y." This will ensure more automated coverage for a11y testing, and less designer time spent on manual review. 

### Consequences

* Good, because it is maximizes accessibility compliance opportunities
* Good, because it *prevents* accessibility problems from showing up rather than waiting to fix them
* Good, because it sets a policy that no obvious accessibility problems should ever be merged
* Neutral, because it a critical feature could be held up by a relatively less critical but still significant accessibility problem (exceptions could fix this)
* Bad (ish), because it will add about 10 minutes to each PR to thoroughly check accessibility.
* Bad (ish) because some 508 violations (P0 and P1 bugs) may get merged into test or dev branches, but will never be promoted into production.

### Confirmation

The initial decision was confirmed by the IRS' 508 Program Office (IRAP) and by our Contracting Officer's Representative. Project technical staff will continuously confirm adherence to this decision using a PR template, which includes a checklist of items they need to do before it can be merged. 

The updated decision to supplement manual testing using pa11y or similar automated testing tool.


## Pros and Cons of the Options

### Review accessibility factors in every PR, where applicable

* Good, because it is maximizes accessibility compliance opportunities
* Good, because it *prevents* accessibility problems from showing up rather than waiting to fix them
* Good, because it sets a policy that no obvious accessibility problems should ever be merged
* Neutral, because it a critical feature could be held up by a relatively less critical but still significant accessibility problem (exceptions could fix this)
* Bad (ish), because it will add about 10 minutes to each PR for the submitting engineer and for the (likely designer) accessibility reviewer to thoroughly check accessibility.

### Review accessibility factors at least every other sprint (once per month)

* Good, because it is a relatively frequent check for introduced bugs
* Neutral, because it sets a middle ground between maximizing accessibility compliance and building capacity
* Bad, because reviews may catch a lot of bugs and require prioritization work

### Review accessibility factors in the final stages of this project before release

* Good, because it maximizes our capacity for building *something*
* Bad, because it is the opposite of best practices
* Bad, because problems discovered at that point may be too many to fix for our deadline

### Supplement manual review with automated accessibility review using a tool like pa11y

* Good, because it maximizes coverage by automating executed test cases against our a11y targets
* Good, because it frees up design time spent on manual reviews
* Bad (ish), because it will require some dedicated set up time from devops

## More Information
* Our [PR template](../PULL_REQUEST_TEMPLATE.md) and [design review instructions](../design-review-process.md) are the operational components of this decision. These are based on [documents produced by Truss](https://github.com/trussworks/accessibility) in their past projects.
* In case a PR for some reason needs to be merged without an an accessibility review, an issue should be made and immediately queued up for work so that any potential issues can be caught as soon as possible.
