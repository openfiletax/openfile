ADR: Front-end client
=====================

Updated: 3Jan2023

Background
----------

   There are two general approaches to building web applications today:
   traditional web applications that perform most of the application
   logic on the server to produce multiple web pages (MPAs), and
   single-page applications (SPAs) that perform most of the user
   interface logic in a web browser, communicating with the web server
   primarily using web APIs (Application Programming Interfaces).

There’s a 3rd option of having some lightweight javascript interation on
just a few pages, but these fall into the MPAs. An example is a mostly
static sites with self-contained form pages that need client side
validation of input before submitting.

This document assumes the 2024 scope ONLY.

REQUIRED features
~~~~~~~~~~~~~~~~~

In no particular order: (todo: reorder based on priority 1. Produces
static website that interacts via Secure API 1. Support for the top 98%
of browsers at time of launch 1. 508 Accessiblity compilant / USWDS
style library 1. Multi-langage support (English and Spanish) aka “i18n”
(internationaliazation => i…\ *(18 chars)*\ …n) 1. Mobile friendly
(format and load speed) 1. Secure/Trusted client libraries 1. Deals with
PII and so privacy/security is important 1. Safe to use from shared
computer (such as a public library) 1. Security best practices.
e.g. CORS and CSP (Content Security Policy) 1. Support for multiple
pages and complex links between them. 1. Agency familiarity with
libraries

NOT REQUIRED features
~~~~~~~~~~~~~~~~~~~~~

1. Offline/sync support
2. Not building a Full CMS (Content management system) like
   WordPress/Drupal
3. Not supporting older browsers or custom mobile browsers
   (feature-poor, less secure)

Client code library
-------------------

There are many choices for client-side code libraries to help reduce
custom code.

Using one of these libraries increases security since they have been
widely vetted and follow many best-pratices. It also reduces the cost of
development/maintenance since the more popular a client library is, the
more coding talent and tooling is available. The most popular libraries
also allow for a common, shared knowledge for the correct way to solve a
problem.

One issue with larger client-side code libraries is that they have
deeper “supply chains” of software. This is where a top-level library
uses features of some other library, which in turn, includes even more
3rd party libraries. This nested approach continues until there are 50k+
files needed to build even the most simple application. This dependency
amplification tends to make common functions more shared, but can also
greatly increase complexity when an update is needed in a deeply nested
package libraries, especially when there are multiple revisions
depenencies (higher level libraries explicietly require different
versions of the same package).

Code scanners can find and automatically patch these nested packaged
library updates (example: github’s dependabot) to reduce constant
workload overhead of updating. Fully automated unit tests are used to
verify updating a dependency didn’t break anything; therefore, creating
rich unit tests becomes a crutial aspect of modern projects.

Evaluation criteria
~~~~~~~~~~~~~~~~~~~

1. **Supports required features from above**
2. popularity
3. static build output (easier ATO, “serverless”)
4. support for unit tests

There’s an added wrinkle that many libraries (React, Angular, etc) have
a “add-on” approach and use *other* libraries to get features. NextJs
and Gastby are examples for the React ecosystems.

Combos
~~~~~~

+--------------------+---------------------------+---------------------+
| Libary + AddOn     | Pros                      | Cons                |
+====================+===========================+=====================+
| React v18 +        | Minimal complexity - full | None?               |
| i18Next            | featured                  |                     |
+--------------------+---------------------------+---------------------+
| React + Gastby     | Good at i18l. Great       | Uses GraphQL not    |
|                    | plugins                   | REST. Larger output |
+--------------------+---------------------------+---------------------+
| React + NextJS     | More like a CMS           | Mostly SSR, recent  |
|                    |                           | static site         |
|                    |                           | support. Larger     |
|                    |                           | output              |
+--------------------+---------------------------+---------------------+
| React +            | Great for mobile/offline  | More complex deploy |
| Progressive Web    |                           |                     |
| App                |                           |                     |
+--------------------+---------------------------+---------------------+
| Angular v13        | Popular                   | Not as efficent /   |
|                    |                           | popular as React    |
+--------------------+---------------------------+---------------------+
| VueJS              | Smaller than react.       | Less popular        |
+--------------------+---------------------------+---------------------+
| Svelte             | Minimal size. Few         | Not widely used.    |
|                    | plugins.                  |                     |
+--------------------+---------------------------+---------------------+
| JQuery             | Minimal size.             | Requires lots of    |
|                    |                           | custom code to do   |
|                    |                           | things              |
+--------------------+---------------------------+---------------------+
| Vanilla JS         | Minimal size.             | Requires lots of    |
|                    |                           | custom code to do   |
|                    |                           | things              |
+--------------------+---------------------------+---------------------+

Tooling
-------

1. Code quality scanners: for quality, security issues
2. Dependency scanners: for 3rd party libraries and their nested
   includes that alerts for outdated dependencies
3. Unit testing: automated tests to verify deep core functionality
4. Integration testing: aka end-to-end testing

Microsoft’s Github toolchain
~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Correct tooling is critical. Github offers a complete CI/CD ecosystem
for automating: code quality scans, secrets scans, unit tests, library
updates, deployment, 508 compliance scans. It’s widely used recieving
constant updates and improvements.

It also has a ticketing/tracking system for code bugs/improvements that
integrates with code changes. It can be configured to only submit code
once all automated checks have passed and another team member has review
and approved changes.

Many of these features are free for open source projects.

If we do NOT use github’s CI/CD toolchain, then we’ll need to find other
products to fill these needs and staff expertise for these alternate
tools.

This tightly couples the project to github, but offers so many benefits
for starting projects, that it’s probably the correct path.

Non-public (Open Source) projects
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Many quality/security scanning tools need access to the source to work.
This is trivial for open source projects, but require more work for
closed source. These may have licensing costs for non-open source
projects or concerns about exposing sensitive code to 3rd parties.

The FE project will **heavily** leverage existing open source projects:
React, typescript, USWDS, etc.

#####Opinion The Front End code should be open sourced.

Rational: 1. All FE “source” is “client-side script” (javascript). This
means the transpiled source script is downloaded into the public
browsers to run. It is **not** possible to “hide” this code since it
runs in the end user’s browser. 1. Tax payers funded the development of
this source (aka the American Public); therefor, the result of that work
should be public unless there’s some reason for it not to be. 1. Open
source can be more widely vetted for bugs/issues. 1. If designed
accordingly, the Front End could be just a presentation layer that
interacts with the user and that uses a verified server-side API to do
proprietary work.

Libraries
~~~~~~~~~

Libraries to support common functionality allows for quicker development
AND avoiding common security mistakes. Popular open source libraries are
widely vetted and patched frequently.

Decision
--------

The early Usability Study portion of the initial product cycle (meaning
as we’re creating the first iteration of the product) is a good time to
try out different libraries and drive a decision.

[Updated: March 8th, 2023:] For the first batch the technologies tried
out: 1. ``React v18 with Hooks`` 1. ``typescript`` everywhere 1.
``i18Next`` for multilingual / localization 1. ``Redux`` for state
machine needs 1. Trussworks’s ``react-uswds`` for USWDS+React 1.
``jest`` for unit tests 1. ``cypress`` for functionality testing

Rationale
---------

**React v18**

A standard reactive UX library that’s used widely by various Government
agencies. It’s well documented and easy to hire sofware developer talent
with prior experience.

**typescript**

A modern standard that “levels up” javascript from a loosely typed
scripting language to a strictly typed compiled (transpiled) language.
Helps catch bugs at compile time versus runtime, enforces that types are
correct, etc

**i18Next**

One possible multilanguage (translation/internationalization) library to
make translation into Spanish

**Redux**

…

**react-uswds**

…

**jest**

…

**cypress**

…

Rejected
--------

Assumptions
-----------

Constraints
-----------

Status
------

Pending

Consequences
------------

Open Questions
--------------
