---
# Configuration for the Jekyll template "Just the Docs"
parent: Decisions
nav_order: 100
title: "Pseudolocalization"

# These are optional elements. Feel free to remove any of them.
status: "Proposed"
date: "2023-07-21"
---
<!-- we need to disable MD025, because we use the different heading "ADR Template" in the homepage (see above) than it is foreseen in the template -->
<!-- markdownlint-disable-next-line MD025 -->
# Pseudolocalization

## Context and problem statement

Currently the frontend is using a spanish language translation file as an alternate translation. However, we do not have translations so all strings translate to TRANSLATEME. Also, we will likely always be behind in sourcing the translations.

Pseudolocalization generates a translation file that translates “Account Settings” to  Àççôôûññţ Šéţţîñĝš !!!

It allows us to easily catch:

* where we’ve missed translating a string
* where we’ve missed internationalizing a component
* where a 30% longer string would break ui
* where a bidirectional language would break the layout (perhaps not needed right now)

Developers can test the flow and read the pseudolocalized strings as they navigate the UI. Basically errors become really easy to catch during normal development. 

## Desirable solution properties

We'd like the solution to this problem to

1. Highlight issues for developers and design to catch early and often
2. Not add additional load to development and design

## Considered options

1. Don't change anything, use fixed string for all translations
2. Use a package to generate a new translated set of strings
3. Use a package to hook into react and translate strings dynamically

## Decision Outcome

Chosen option: Use a package to generate a new translated set of strings.
Update 20240417: Now that we have Spanish, we are removing the pseudolocalization

Reasoning: Using a set of translated strings is the best way to catch if we've forgotten to hook something up correctly. Given our unusual use of the dynamic screens, FactGraph and translations, there's a possibility of bugs as we source translations for strings, facts, enums, etc. 

If we don't change anything, we will continue to introduce more technical debt that will need to be fixed at a later date.

Package chosen: https://www.npmjs.com/package/pseudo-localization

### Consequences

1. Good: Easy way to ensure we are keeping our codebase properly internationalized.
2. Good: Devs can test the whole flow quickly without switching languages to understand what each field means.
3. Good: We can automate updating the translation so it's even less load on the developers.
4. Bad:  Maybe we run into an issue with the pseudotranslation that won't be an issue with a real translation?
4. Bad:  Spanish will not be our second language in the UI switcher.

## Pros and Cons

### Don't change anything, use fixed string for all translations

#### Pros

* Straightforward, it's what we have already.

#### Cons

* We can't tell which fields are which and testing is harder.
* May hide (or cause) issues that exist (or don't) with actual translations - For e.g. if 'Single' is selected but later 'Married' is shown, there's no way to tell if both strings are translated to 'TRANSLATEME'.
* All strings are same length.

### Use a package to generate a new translated set of strings

Package chosen: https://www.npmjs.com/package/pseudo-localization

#### Pros

* Devs can test the whole flow quickly without switching languages to understand what each field means.
* We can automate updating the translation so it's even less load on the developers.
* Tests the UI with +30% string length.
* This package appears to be the most flexible and popular option on npm. It has an MIT license.

#### Cons

* Requires ticket and work to update the translation script
* Spanish will not be the second language (although once the language switcher supports more languages we can just have both)
* This package was last updated in 2019 - so although popular enough, prefer to use it just as tooling vs hooking it directly into our codebase.

### Use a package to hook into react and translate strings dynamically

#### Pros

* Can be hooked into frontend dynamically.

#### Cons

* Doesn't actually exercise our own flow and the aggregation and intrapolation of strings from flow.xml and translation JSON files. 
* Could appear to "fix" strings that aren't actually properly internationalized.

## References

* More on pseudolocalization: <https://www.shopify.com/partners/blog/pseudo-localization>
