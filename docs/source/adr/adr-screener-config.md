---
# Configuration for the Jekyll template "Just the Docs"
parent: Decisions
nav_order: 100
title: "Screener static site"

# These are optional elements. Feel free to remove any of them.
status: "Decided"
date: "2023-08-08"
---
<!-- we need to disable MD025, because we use the different heading "ADR Template" in the homepage (see above) than it is foreseen in the template -->
<!-- markdownlint-disable-next-line MD025 -->
# Screener static site

superceded by: [adr-screener-config-update](../adr-screener-config-update.md)

## Context and problem statement

The screener is a set of four to five pages that serve as the entry point to the direct file. They will contain a set of simple questions with radio buttons that advance the user to the login flow or "knock" them out if any answers indicate they do not qualify for direct file.

Since the frontend will not be saving the user's answers to these questions, we have an architectural choice on how to create these pages. These will be unprotected routes not behind our login so the SADI team recommends hosting static pages for this content.

Also, we need a way to make changes to content, order of questions, and add or remove pages.

## Desirable solution properties

We'd like the solution to this problem to:

1. Allow the team to edit the config to change the order of questions and add or remove pages entirely.
2. Allow the team to make changes to content of the screener.
3. Allow the team to deploy the app with high confidence that no regressions will occur.
4. Have the static site support i18n and possibly reuse keys from existing client translation files.

## Assumptions

- We can change content and the config after the code freeze (will most likely require policy changes)
- No answer to a question in the screener is derived from a previous one with the exception of the initial state dropdown
- Every question (except the first state selection dropdown) will be a set of radio buttons with either:
    - "Yes" or "No"
    - "Yes," "No," or "I don't know" (and more content specific answers for the third option)
- The static site generator (SSG) will live in the same repo, just within another folder.

## Considered options

1. Use an SSG (static site generator) to create static HTML pages
2. Create another React SPA with a custom JSON or TS config
3. Integrate existing into existing direct file React SPA

## Trying to answer feedback

### Why not just plain HTML and JS?

The library we're currently using in the DF client for i18n is i18next. It's certainly possible to use i18next in a Vanilla JS and HTML site, but I think it's worth trying to reuse our existing approach using the react-i18next library. SSG libraries also provide a better developer experience in updating this content.

### Ok. Why not another Vite/React SPA?

The site is limited and fairly static so creating a SPA doesn't seem to fit the use case. Content largely drives the screener so a static site with a multi-page architecture fits the use case better than a fully-fledged SPA where lots of app-logic would be necessary.

## Decision Outcome

**Chosen option**: Use an SSG to build the app.

**Reasoning**: Using an SSG library, we can safely deploy the screener pages outside of the main direct file app. This allows us to have the unprotected routes of the app separate from the protected ones. This allows us to integrate with SADI more easily and also support changes to content quickly.

Also, with an SSG library (instead of plain HTML and JS) we can use the features of i18next more easily like we are doing in the DF client.

If we choose to integrate the screener into the React SPA, this will make it more complicated to secure these routes.

**Library Chosen**: Astro. We can revisit this choice if it proves not to work for us, but it's focused on content, ships as little JS as possible, provides React support if we need it, and provides good i18n support with an i18next library.

Consequences

- Good: Astro supports React so we can reuse components from the client
- Good: Astro has i18next libraries specific and we may even be able to use react-i18next
- Good: Creating all the pages at build will result in separate pages/paths for each language (i.e. /en/some-page, /es/otra-pagina).
- Good: We can can make changes to the questions, content, and pages fairly easily.
- Good: We can use snapshot testing to have a high degree of certainty that the UI doesn't change unexpectedly.
- Good: Easier to integrate with SADI if these pages are separate.
- Good: Can use i18next with the library to keep our translation mechanism the same, perhaps use one source of translation files.
- Bad: Will require separate CI/CD build pipeline.
- Bad: Another place to maintain content and possibly a config.
- Bad: Another tool for frontend developers on the team to learn.

## Overview of SSGs

### Astro

- Focused on shipping less JS, focus on static HTML output
- High retention in [state of JS survey](https://2022.stateofjs.com/en-US/libraries/rendering-frameworks/)
- Support for multiple frameworks including React
- Support for TypeScript
- Good i18next integration

### Vite

- Already have this tool in the codebase
- Provides TS support, React, i18n
- More inline with an SPA in mind
- SSG support doesn't appear to come "out of the box," [but it is possible](https://ogzhanolguncu.com/blog/react-ssr-ssg-from-scratch).

### Gatsby

- Support for React
- Large plugin ecosystem
- Support for TypeScript
- Seems unnecessarily complex given our needs (GraphQL features)

### Next.js

- Support for React
- SSR tools on pages if necessary
- Support for TypeScript
- Seems unnecessarily complex given our needs (SSR)

### Eleventy

- Multiple template languages
- Supports vanilla JS
- Flexible configuration
- Very fast build time
- Good for sites with a lot of pages
