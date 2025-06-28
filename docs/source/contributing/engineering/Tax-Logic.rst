Tax Logic
=========

Scenarios
=========

Validating scenarios
--------------------

Here some images that explain what scenarios are and how we validate
them.

Translations
============

Summary
-------

We use a library called `i18next <https://www.i18next.com/>`__ for
internationalization (i18n).

It creates the ability to use references (keys) to point to translation
values based on various natural languages. Currently we have
translations for English (by default) and Spanish. The translations are
found in en.yaml and es.yaml.

Any content provided by design needs to be added to the en.yaml. All
content is submitted by design to General Counsel (GC). After it is
approved by GC, we do the Spanish translations, which are added to the
es.yaml (Note: we are working on tooling to simplify translations)

Tips and Tricks for adding content
----------------------------------

-  en.yaml is a very long file. See if your IDE has bookmarks, and use
   them to mark your spot
-  en.yaml is organized by content type (subsubsections, headings, info,
   dataviews, fields)
-  When implementing several screens, input by content component type
   rather than screen content. For example, input all the headings of
   each of the screens since they will be next to each other in the yaml
   file. Then do all the InfoDisplay content, then Modal content, etc).
-  You can interpolate any (non-nested) fact value into the content
   using double curly brackets (ex. \`{{/taxYear}})
-  If your content string starts with interpolation (ex
   ``{{/secondaryFiler/firstName}}``), you need to wrap the string in
   double quotes
-  Use a proper apostrophe char ``’``\ instead of a single quote ``'``
   when an apostrophe is needed. On a Mac, the shortcut is
   ``Option + Shift + ]``\ (there is a test for this, and search and
   replace may be the most efficient way to do this when copying and
   pasting from design)
-  To reference existing content within the yaml, use the syntax
   ``$t(path./to-value)``\ (`for
   reference <https://www.i18next.com/translation-function/nesting>`__)
-  ``>-`` basically means ‘newline’ in yaml

Flamingo Fact Checker
=====================

`Link to plugin and instructions <Flamingo-Fact-Checker>`__.

FAQs
====

-  `What is migrateScenarios? <#what-is-migratescenarios>`__
-  `Is there some fact graph 101 I can
   read? <#is-there-some-fact-graph-101-i-can-read>`__
-  `Can someone explain the distinction between categories,
   subcategories, and subsubcategories in the codebase and why i MUST
   have a subsubcategory according to my
   console? <#can-someone-explain-the-distinction-between-categories-subcategories-and-subsubcategories-in-the-codebase-and-why-i-must-have-a-subsubcategory-according-to-my-console>`__
-  `What’s a scenario? <#whats-a-scenario>`__
-  `Why don’t we call scenarios fact graphs or vice
   versa? <#why-dont-we-call-scenarios-fact-graphs-or-vice-versa>`__
-  `What tests should I run if making screen changes or fact
   changes? <#what-tests-should-i-run-if-making-screen-changes-or-fact-changes>`__
-  `What do flowSnapshots do and why do I have 100
   errors? <#what-do-flowsnapshots-do-and-why-do-i-have-100-errors>`__
-  `What are we doing when we
   SetFactAction? <#what-are-we-doing-when-we-setfactaction>`__
-  `Does ``npm run test`` run all the frontend
   tests? <#does-npm-run-test-run-all-the-frontend-tests>`__
-  `When do facts need to be sent “downstream” or sent to
   “mef”? <#when-do-facts-need-to-be-sent-downstream-or-sent-to-mef>`__
-  `Adding new collection aliases are weird
   ? <#adding-new-collection-aliases-are-weird>`__
-  `What’s the deal with
   Placeholders? <#whats-the-deal-with-placeholders>`__
-  `What is the difference between a fact in the dictionary with a value
   put in <Placeholder> tags like this, and a fact in the dictionary
   with just a value assigned but no Placeholder tag like
   this? <#what-is-the-difference-between-a-fact-in-the-dictionary-with-a-value-put-in-placeholder-tags-likethis-and-a-fact-in-the-dictionary-with-just-a-value-assigned-but-no-placeholder-tag-likethis>`__
-  `What about <ExportZero/>? <#what-about-exportzero>`__
-  `How does one deal with the requirement of export zero dollar values,
   sometimes,
   conditionally? <#how-does-one-deal-with-the-requirement-of-export-zero-dollar-valuessometimesconditionally>`__
-  `How are data view created? <#how-are-data-view-created>`__
-  `When can we use which fact types when writing
   facts? <#when-can-we-use-which-fact-types-when-writing-facts>`__
-  `[ERROR] Failed to execute goal
   org.apache.maven.plugins:maven-compiler-plugin:3.13.0:compile
   (default-compile) on project directfile-api: Fatal error compiling:
   error: release version 21 not
   supported <#error-failed-to-execute-goal-orgapachemavenpluginsmaven-compiler-plugin3130compile-default-compile-on-project-directfile-api-fatal-error-compiling-error-release-version-21-not-supported>`__
-  `How to create a knockout? <#how-to-create-a-knockout>`__
-  `What is the difference between ``useDynamicFact`` and
   ``useFact``? <#what-is-the-difference-between-usedynamicfact-and-usefact>`__
-  `Headings vs InfoDisplays? <#headings-vs-infodisplays>`__
-  `When we have a screen where we calculated a bunch of stuff to show
   to the tp, but it isn’t a writable field - these results don’t show
   up in the dataview. it seems weird not to have them. How do we add a
   non-field piece of info to the dataview for that
   subsubcategory? <#when-we-have-a-screen-where-we-calculated-a-bunch-of-stuff-to-show-to-the-tp-but-it-isnt-a-writable-field---these-results-dont-show-up-in-the-dataview-it-seems-weird-not-to-have-them-how-do-we-add-a-non-field-piece-of-info-to-the-dataview-for-that-subsubcategory>`__
-  `My test is failing with \`Invalid UUID string:
   undefined <#my-test-is-failing-with-invalid-uuid-string-undefined>`__
-  `I got a CSP warning in the console. I need to update the CSP. Where
   do I do
   that? <#i-got-a-csp-warning-in-the-console-i-need-to-update-the-csp-where-do-i-do-that>`__
-  `What is All-Screens and where can I find
   it? <#what-is-all-screens-and-where-can-i-find-it>`__
-  `What’s the difference between ``DFAlert``, ``Assertion`` ,
   ``TaxReturnAlert`` , ``MefAlert``, ``FactAssertion``, and
   ``FactResultAssertion``
   ? <#whats-the-difference-betweendfalert-assertion--taxreturnalert-mefalert-factassertion-and-factresultassertion->`__
-  `I have to create some checkboxes and can use MultiEnum or Booleans
   as checkboxes. When should I use one over the
   other? <#i-have-to-create-some-checkboxes-and-can-use-multienum-or-booleans-as-checkboxes-when-should-i-use-one-over-the-other>`__
-  `Why does this Fact error out with
   \`java.lang.UnsupportedOperationException: must use getVect to
   access… <#why-does-this-fact-error-out-with-javalangunsupportedoperationexception-must-use-getvect-to-access>`__
-  `I need to set a limit for a fact based on the value of another fact.
   How do I do
   it? <#i-need-to-set-a-limit-for-a-fact-based-on-the-value-of-another-fact-how-do-i-do-it>`__
-  `How do I format a recent factgraph module that I
   changed? <#how-do-i-format-a-recent-factgraph-module-that-i-changed>`__
-  `How to capitalize an Enum using existing
   CompNodes? <#how-to-capitalize-an-enum-using-existing-compnodes>`__

What is migrateScenarios?
-------------------------

Why? When a change in the codebase requires that all jsons contain new
facts or updates to existing facts, this script can be used to update
all of the files at once.

How? The script does not automatically detect anything or run
automatically.

-  The eng who made the change to the codebase should change this script
   to update the facts as needed.
-  In most cases only the section between MIGRATION START and MIGRATION
   END will need to be updated.
-  Then the eng runs this script and commits the updated jsons.
   ``npm run migrate-scenarios``

Note that even though it is checked in, this script runs only once to
update all the scenario jsons.

Can someone explain the distinction between categories, subcategories, and subsubcategories in the codebase and why i MUST have a subsubcategory according to my console?
-------------------------------------------------------------------------------------------------------------------------------------------------------------------------

-  Categories and subcategories appear in the checklist
-  Each subcategory may have 1-2 items of data in the checklist
-  Each subcategory has a dataview, which is a summary of the
   subcategory.
-  In some cases the dataview might just be a screen within the
   subcategory (``<Screen actAsDataView={true} />``)
-  But in most cases the dataview is a new page which shows all the
   subsubcategories.
-  The subsubcategories in the dataview have multiple items of data and
   an edit button.
-  The subsubcategory edit button takes you to those screens in the
   flow.
-  Then you will be in review mode and on completion of the screens in
   that subsubcategory, get redirected back to the dataview.
-  Every screen must be in a subsubcategory with the following
   exceptions

   -  If a screen is the only screen in a subcategory AND it is marked
      with ``actAsDataview``
   -  If a screen is not editable, can be placed inside a subcategory.
      In this case, the screen will only be shown to a taxpayer on their
      first pass of the screens- it will not show up in review mode.

What’s a scenario?
------------------

As a client enters information in the Direct File (DF) application, the
application accumulates these facts. These accumulated facts is
sometimes called the “client factgraph json”. This json file can
represent almost any situation, and they essentially represent one
user’s tax situation or *scenario*.

So we store them and use them to test different user scenarios. We have
a few hundred pre-defined scenarios. These scenarios lay the foundation
for testing various parts of our app. As we add scope, we may add more
scenarios.

Why don’t we call scenarios fact graphs or vice versa?
------------------------------------------------------

I guess we could, but to allow some distinction between any fact graph
and this set of fact graphs that represent different user tax return
situations, we introduced the concept of scenarios.

Scenarios are a subset of factgraphs as they are required to be complete
- as in, the person got to the sign and submit screen and there were no
submission blocking errors.

What tests should I run if making screen changes or fact changes?
-----------------------------------------------------------------

It kinda depends on what is changing in the screen. If the screen order
changes then the ``flowSnapshots`` tests would capture this. When facts
change there can be a whole cascade of tests that can test this change.
Our recommendation is to follow this
`mural <https://app.mural.co/t/usdigitalservice0135/m/usdigitalservice0135/1722960219541/36%5B%E2%80%A6%5D510295f8a2727fd347e319714a73c?sender=u609b185fbd158566f8103243>`__
and walk through each step when making fact changes. There are 4 steps
and each step has instructions on what tests to run.

What do flowSnapshots do and why do I have 100 errors?
------------------------------------------------------

flowSnapshots are making sure the order of the screens are what we
expect them to be for each scenario.

The way it works is that it runs through the scenario, as though the
user is clicking through screens and stores the sequence of screens
seen. Then that sequence is stored, so that we can test that it doesn’t
change accidentally.

If some new screen was added that will be shown to the users represented
by lots of scenarios, that sequence will now change and not match what
was stored. So when the flowSnapshot test ran it updated all snapshots
and you may be seeing many errors.

If the change you see in the files is what was expected based on the
change you made in your PR, you can simply check in the new sequence.

What are we doing when we SetFactAction?
----------------------------------------

Sometimes we need to set a fact when the tax payer (TP) reaches a
screen, regardless of their input. In other words, “when a TP reaches
this screen, set this fact”.

Does ``npm run test`` run all the frontend tests?
-------------------------------------------------

Yes, ``npm run test`` runs all the frontend vite tests. There are two
other tests that may be helpful:

-  ``npm run test:ci`` - which runs all tests from the CI/CD pipeline
   (ie, when a PR is opened or committed to) except the
   completenessTests and functionalFlowTests.
-  ``npm run test:ci:2`` - runs the completenessTests and
   functionalFlowTests

When do facts need to be sent “downstream” or sent to “mef”?
------------------------------------------------------------

Our fact dictionary is broken into modules. Each fact dictionary module
is an XML fie. Here’s a list of them as of the time of writing this
answer:

.. figure:: uploads/a6af72545ca2a2b0bb18da9eb1f30267/Screenshot_2024-08-21_at_4.02.16_PM.png
   :alt: Screenshot 2024-08-21 at 4.02.16 PM.png
   :width: 281px
   :height: 822px

   Screenshot 2024-08-21 at 4.02.16 PM.png

With ``elderlyAndDisabled.xml`` selected, opening this file, we see:

|Screenshot 2024-08-21 at 4.02.06 PM.png|\ A few things we notice that
the first line of this file designates this to be a fact dictionary. The
first fact has the export statement of:

-  Export mef=“true” downstreamFacts=“true”

Certain facts are needed by other modules, if/when a fact is needed by
another module, you can specify ``downstreamFacts="true"``. Another
advantage is testing. Fact that we’re exporting for reuse in other
modules should probably have tests.

You do not need to set downstreamFacts in order to write the value in a
PDF, that process is just another way of displaying the value and is not
subject to dependency management.

A few things to keep in mind

1. Always run the ``npm run watch-fact-dictionary`` so that any changes
   to any fact dictionary module will automatically re-build the
   dictionary
2. To validate your fact dictionary changes, you can run
   ``npm run verify-module-dependencies``. This will let you know if
   some facts are in error or if you are missing the ``mef`` or
   ``downstreamFacts`` attribute on any fact definition.

Adding new collection aliases are weird
---------------------------------------

Indeed. In the filers.xml fact dictionary module, you will sometimes see
facts with a \_\ ``*`` eg, ``/filers/``\ \_\ ``*/firstName``. This would
be a *collection*. Each collection is made up of *collection items.* In
this case, the filers collection is made up of two items, namely the
primary and secondary UUIDs.

Lets say we wanted to operate on that collection, by e.g., filtering it.
When we filter that collection, the resulting collection could be

1. [primaryUUID, secondaryUUID]
2. [primaryUUID]
3. [secondaryUUID]
4. []

This filtered collection, doesn’t have access to the other facts in the
filers module. For example, ``/filers/*/MiddleInitial`` or
``/filers/*/dateofBirth``. In order to access these other facts, we use
aliases.

There are two files responsible for aliases, ie, aliases.ts and
dependencyGraph.ts

What’s the deal with Placeholders?
----------------------------------

Placeholders help set the value but don’t make a fact complete.To answer
your questions more directly, placeholders mean that a value of a fact
will never be blank. Once a fact is written we generally don’t provide
ways to clear out written facts. The reason they don’t work as a proper
default is that we also end up checking if a fact is complete in a
couple of different spots.

What is the difference between a fact in the dictionary with a value put in <Placeholder> tags and a fact in the dictionary with just a value assigned but no Placeholder tag
-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------

So we have a concept of writable facts and derived facts where writable
facts are those that the user can update and derived facts that are just
“calculated” values. “Placeholders” I believe are only supported for
writable facts as the intention is that the user should potentially
override them with a written value. Derived facts can just be static
values like in the example you gave. I would consider it to be more of a
constant than a default value, but that’s likely just a jargon/pedantic
distinction. This is a default value in the sense that this value will
not really change.

What about <ExportZero/>?
-------------------------

By default, facts with value zero are not sent to PDF or XML generation.
This tag overrides that behavior for a fact, so that the zero will be
included in the outputs.

Note that it is possible to conditionally export zero values by using
this tag on a fact that conditionally leaves its value unspecified
(incomplete). PDF generation automatically ignores incomplete fact
values, producing the effect of a “blank” output. XML mappings can use
the Optional syntax to get a similar result.

How does one deal with the requirement of export zero dollar values, **sometimes**, **conditionally**?
------------------------------------------------------------------------------------------------------

TBD

How are data view created?
--------------------------

Some info `here <flow/dataviews.md>`__

When can we use which fact types when writing facts?
----------------------------------------------------

When creating facts the first question to ask is, is the fact a writable
fact or a derived fact. If the fact is writable. then generally speaking
we will require it to use one of the factTypes, to calculate a new fact
based on some other fact (called a Dependency).

[ERROR] Failed to execute goal org.apache.maven.plugins:maven-compiler-plugin:3.13.0:compile (default-compile) on project directfile-api: Fatal error compiling: error: release version 21 not supported
--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

In the event that anyone else has ran into the issue of ``./mvnw``
ignoring ``JAVA_HOME``, I discovered that at some point in my past, I
created a ``~/.mavenrc`` file that overrode ``JAVA_HOME`` to a specific
version number, but only when running maven. Deleting that file caused
``./mvnw`` to use the correct version.

How to create a knockout?
-------------------------

In summary there are 3 steps:

1. Create the fact that will be responsible to knockout the TP
2. Add the Screen that will use the fact created in Step 1 and set
   ``isKnockout={true}`` on it.
3. Add the newly created fact from Step 1 to the ``/flowIsKnockedOut``
   fact in flow.xml.

Headings vs InfoDisplays?
-------------------------

Every screen has a ``Heading`` and yes they are sometimes long. Every
screen can only have one ``Heading``.

Usually the top most text on every screen is the ``Heading``. I believe
in some cases there is a section header above the header.
``InfoDisplay``\ s handles a lot of flexible content as you can put
“html” inside it. Most explanatory text would use ``InfoDisplay`` by
default.

You can have more than one ``InfoDisplay`` in a screen but not more than
one ``Heading``.

When we have a screen where we calculated a bunch of stuff to show to the tp, but it isn’t a writable field - these results don’t show up in the ``dataview``. it seems weird not to have them. How do we add a non-field piece of info to the ``dataview`` for that ``subsubcategory``?
----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

What you may be be looking for is ``displayOnlyOn`` property. You can
add this to any of the content declaration types we have like Dollar or
String with the corresponding fact and set the ``displayOnlyOn`` to
``data-view`` . We have a handful of examples of this within the
CreditSubsection.

My test is failing with \`Invalid UUID string: undefined
--------------------------------------------------------

You may need to add a a line here in the test file:

.. code:: jsx

   const collectionIdMap = {
       [`/flow/you-and-your-family/about-you`]: primaryFilerId, 
       [`/flow/you-and-your-family/spouse`]: primaryFilerId, 
       [`/flow/you-and-your-family/dependents`]: dependentId, 
       [`/flow/income/jobs`]: w2Id, 
       [`/flow/income/interest`]: interestReportId, 
       [`/flow/income/unemployment`]: formId, 
       [`/flow/income/retirement`]: retirementForm1099Id, 
       [`/flow/income/apf`]: apfForm1099Id,
       [`/flow/income/social-security`]: reportId, };``

What is All-Screens and where can I find it?
--------------------------------------------

All screens is a page that displays every screen in the application and
the conditionals for that page. The URL for local development is at
http://localhost:3000/df/file/all-screens/index.html

What’s the difference between ``DFAlert``, ``Assertion`` , ``TaxReturnAlert`` , ``MefAlert``, ``FactAssertion``, and ``FactResultAssertion`` ?
----------------------------------------------------------------------------------------------------------------------------------------------

``<DFAlert>`` has no special behavior and just renders content on a
screen like normal

``<Assertion>`` is used for alerts that should show up only in the
SubCategory dataview screen

``<TaxReturnAlert>`` is rendered in a specific screen and an aggregated
alert summary on the checklist and dataview pages

-  If ``type='error'`` and the alert’s conditions are true, submission
   will be blocked until the filer makes the necessary updates to fix
   the error.
-  If ``type='warning'`` does not block submission and just directs the
   user to review the data on the screen in which it is present
-  If the type is set to anything else, the alert will not render under
   any conditions (this is likely something we should prevent, but may
   have been unintentional)
-  We currently use these to prompt filers to remove any income items
   associated with a secondary filer if they change their status to
   anything other than Married Filing Jointly.

``<MefAlert>`` are used when an alert is based on the response from MEF
and not something we can determine in advance and the error is
correctable.

-  These will only ever render when a tax return is rejected. They are
   configured with an ``mefErrorCode`` that is returned from MEF and
   linked to the user’s return separately from the fact graph and is a
   required condition for displaying the alert.
-  These alerts also bubble up to the checklist and dataviews just as
   with ``<TaxReturnAlert>`` and have the same behaviors with the
   ``type`` attribute.
-  Additional conditions on ``<MefAlert>`` nodes are used when we are
   able to determine whether the cause of the error has been resolved
   and can hide/remove the alert.
-  As an example, the ``IND-180-01`` MEF error code is set if the user
   submits a return claiming that they have no IP Pin but the IRS has
   records saying that they do. This prompts a blocking ``<MefAlert>``
   to be displayed that will only become inactive once the user answers
   that they do, in fact, have a PIN and enter it.
-  If we have no way know for certain whether the user has corrected the
   problem, we should make sure the alert is set to warning, so the user
   can resubmit once they believe they have corrected the issue.

``<TaxReturnAlert>`` and ``<MefAlert>`` are both aggregated from the
screen config so that we can direct them all the way from the checklist,
down to the specific screen(s) they belong to.

``<FactAssertion>``, ``<FactResultAssertion>``, and the
``outcomeI18nKey``/``resultI18nKey`` keys are used to display alerts
that only bubble up to the dataview and collection screens and are
primarily used in the dependents and qualifying persons section.

Lastly, “Cues & Aggregators” area of this 2023 Mural board does a good
job explaining `how the alerts
work <https://app.mural.co/t/usdigitalservice0135/m/usdigitalservice0135/1679591477411/ca7cc4ebdd42dfd9a3ee5ea57153b0135df9971f?wid=0-1701705425590>`__.
Documentation from Jen in the `design wiki - TODO <>`__, should mirror
what’s on that 2023 Mural.

I have to create some checkboxes and can use MultiEnum or Booleans as checkboxes. When should I use one over the other?
-----------------------------------------------------------------------------------------------------------------------

Use MultiEnum if

-  All your checkboxes need to packaged into a single fact as a Set/List
   and needs to sent to MeF

Use Boolean if

-  You need access to those checkbox values later on in the flow

Why does this Fact error out with \`java.lang.UnsupportedOperationException: must use getVect to access…
--------------------------------------------------------------------------------------------------------

Can you see the problem with the code below?

.. code:: jsx

       <Fact path="/cdccCareProviders/*/isHouseholdEmployeeNo">
         <Name>Is Not a Household Employee</Name>
         <Description>Whether care provider is not a household employee. Used for the f2441 PDF 'No'
           checkbox</Description>

         <Derived>
           <Not>
             <Dependency path="/cdccCareProviders/*/isHouseholdEmployee" />
           </Not>
         </Derived>
       </Fact>

The problem lies in the following fact:
``/cdccCareProviders/*/isHouseholdEmployee``. Is this fact, complete and
true?

To fix this issue, this fact:

.. code:: jsx

   <Dependency path="/cdccCareProviders/*/isHouseholdEmployee" />`

should be

.. code:: jsx

   <Dependency path="../isHouseholdEmployee" />

| The error is telling you, you need to use get vect because the
  original ``/cdccCareProviders/*/isHouseholdEmployee`` is an array
  since we don’t have the context for the ``*``.
| If we use the ``../isHouseholdEmployee`` we are referencing the same
  id in the main fact so we would only get a single value here instead
  of an array.

I need to set a limit for a fact based on the value of another fact. How do I do it?
------------------------------------------------------------------------------------

There’s been some discussion on setting up dynamic fact limits for field
level validation, but field level validation alone would not work
because you could change the limiting fact so ``TaxReturnAlert`` is used
instead. ``<TaxReturnAlert>`` has the advantage that if you go back and
make edits that would change the validity of that fact, you’ll be
directed to the now-invalid fact. The downside is the user is not
immediately notified of the error.

How do I format a recent factgraph module that I changed?
---------------------------------------------------------

Navigate to the project you are working on (backend, submit, etc) and
run \`./mvnw spotless:apply\`

How to capitalize an Enum using existing CompNodes?
---------------------------------------------------

.. code:: jsx

   <ToUpper>
     <AsString>
       <Dependency module="filers" path="/filerResidenceAndIncomeState" />
     </AsString>
   </ToUpper>

.. |Screenshot 2024-08-21 at 4.02.06 PM.png| image:: uploads/d84c34f216cf1c5c4d9fdb53a6eae640/Screenshot_2024-08-21_at_4.02.06_PM.png
   :width: 1063px
   :height: 822px
