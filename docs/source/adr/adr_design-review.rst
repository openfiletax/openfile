---
# Configuration for the Jekyll template "Just the Docs"
parent: Decisions
nav_order: 100
title: "Design & a11y reviews"

# These are optional elements. Feel free to remove any of them.
status: "Proposed"
---
<!-- we need to disable MD025, because we use the different heading "ADR Template" in the homepage (see above) than it is foreseen in the template -->
<!-- markdownlint-disable-next-line MD025 -->
# Accessibility testing methods

## Context and Problem Statement

In order to work in an agile fashion and ensure code changes meet both design spec and our [accessibility target](adr_a11y-target.md), we should align on a consistent process to achieve this. As part of the [accessibility review](adr_a11y-methods.md) for each PR, the original developer will do a first pass of both design and a11y review. This DR covers how designers will be the second set of eyes on those user-facing changes.

## Considered Options
* Review each PR locally before merging
* Review all merged PRs for the current sprint in the deployment environment at the end of the sprint
* Review entire application in the deployment environment every other sprint
* Review entire application in the deployment environment when designers are available

## Decision Outcome

Chosen option: "Review all merged PRs for the current sprint in the deployment environment at the end of the sprint", because it is the best we can reasonably do given our comfort with the tools and time available.

### Consequences

* Good, because it maximizes coverage
* Good, because it does a decent job of preventing issues from sneaking by for more than a sprint
* Bad, because it requires extra time to create a new issue for each problem discovered
* Bad, because it requires extra time to filter Github PRs by date

### Confirmation

This decision is confirmed by all designers, as they will be doing this work.

## Pros and Cons of the Options

### Review each PR locally before merging

* Good, because it maximizes coverage of changes
* Good, because it prevents almost all issues from sneaking by
* Good, because feedback can go directly into the PR
* Bad, because it requires frequent intervention by designers who may not be comfortable with necessary tools

### Review all merged PRs for the `{current | previous}` sprint in the deployment environment at the `{end | beginning}` of the sprint

* Good, because it maximizes coverage of changes
* Good, because it does a decent job of preventing issues from sneaking by for more than a sprint
* Bad, because it requires extra time to create a new issue for each problem discovered
* Bad, because it requires extra time to filter Github PRs by date

### Review entire application in the deployment environment every other sprint

* Good, because it maximizes coverage of the final user experience (end to end)
* Neutral, because it does a decent job of preventing issues from sneaking by for more than two sprints, but can mean more work is needed to recover from it
* Bad, because it requires extra time and cognitive load to check what was merged and identifying in the environment what to review. It's more likely in two vs one sprint that multiple PRs covered a certain page/feature, so filtering PRs by date is less useful.
* Bad, because it requires extra time to create a new issue for each problem discovered

### Review entire application in the deployment environment when designers are available
* Neutral, because it could maximize coverage of the final user experience (end to end), but only as much as the designer has time for
* Bad, because lingering design/a11y debt can be harder to pay off the longer it lingers
* Bad, because it requires extra time and cognitive load to check what was merged and identifying in the environment what to review. It's higly likely that multiple PRs covered a certain page/feature, so filtering PRs by date is useless.
* Bad, because it requires extra time to create a new issue for each problem discovered

## More Information
* The design review checklist is located in the PR template for the first option and in a [separate document](../design-review-process.md) for all other options.