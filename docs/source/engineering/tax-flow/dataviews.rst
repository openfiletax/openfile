Dataviews
=========

Before we get into Dataviews - here are some captured describing where
this page could use some additional work and if the content:

“we really need to fill it out and organize it in a way that benefits
new engineers and also our designers so they know what is easy to do vs
what is an unsupported pattern. It would also be good to understand any
roadmap requests they have for the improvements of Dataviews, and fixing
known problems (interactions with KOs and loops for instance).”

“We need to better document the behavior of our Dataviews and what they
are capable of. This will allow us to speed up development, have better
conversations with Design, and plan for how we want to make improvements
for them going forward. We also need to gather the growing list of known
issues with data views to understand if there are holistic changes we
can make to the infrastructure to create better experiences.”

--------------

How to make content vary within a question
==========================================

Outside of Loops
----------------

You can use standard facts within dataview questions and answers.

You can have content vary for MFJ by adding ``_spouse`` to the end of
the string name, and it will be automatically used.

Otherwise, DataViews are limited. You can’t specify the same context
indicators you can for screen titles/questions, so be wary if you find
you are mapping multiple strings to a single variable; you’ll need to
keep the dataview question generic to handle all cases, and that isn’t a
great practice to show a different question than the one you asked on
the screen.

EXAMPLE

Within Loops
------------

Within loops the same rules as above apply, but you can also use facts
related to the current filer. But you must use their name, not a
pronoun.

For instance, this works:

``This is the answer for``\ *``PrimaryFirstName``*

``This is the answer for``\ *``SecondaryFirstName``*

This does not:

``This is the answer for``\ *``you``*

``This is the answer for``\ *``SecondaryFirstName``*

EXAMPLE

How to make content vary within an answer
=========================================

You can use the ``i18nKeySuffixContext`` along with conditions to vary
the content displayed for a fact on the screen, but beware that we have
limited ability to use conditional context in data-views.

For the most part, you are tied to the answers that were posed in the
original screen.

There are ways around that, but they require custom code.

EXAMPLE

How to hide a question on the data view
=======================================

Use the displayOnlyOn property set to ‘edit’.
(e.g.\ ``displayOnlyOn='edit'``)

EXAMPLE:

::

   <LimitingString
               path='/formW2s/*/filer/lastName'
               readOnly={true}
               displayOnlyOn='edit'
               hintKey='/info/income/w2/why-change-name'
               condition='/formW2s/*/filer/isPrimaryFiler'
             />

How to show text only on the data view
======================================

Use a Generic String with the displayOnlyOn property set to ‘data-view’.
(e.g.\ ``displayOnlyOn='data-view'``)

The string should be inserted in the flow sub or subsub category where
you want it to appear.

EXAMPLE:

::

   <GenericString path='/hsaDistributions/*/filer/fullName' displayOnlyOn='data-view' batches={[`hsa-1`]} />
