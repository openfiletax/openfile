===================
Error message types
===================

:Status: In review

.. raw:: html

   <!-- we need to disable MD025, because we use the different heading "ADR Template" in the homepage (see above) than it is foreseen in the template -->

.. raw:: html

   <!-- markdownlint-disable-next-line MD025 -->

Accessibility testing methods
=============================

Context and Problem Statement
-----------------------------

We use error messages across the application, many of which follow
certain patterns. We also have a challenge of translating all content,
including those messages, which increases for each unique string. This
decision record seeks to resolve both issues.

YYY and XXX have proposed an initial set of `patterns <#patterns>`__
below guide that could be used for either option 1 or 2 below. Either
way, those exact patterns should be considered independent of this
decision itself, just presented as a clear example of the outcome of
this decision.

Considered Options
------------------

1. Create a set of patterns for all fields to use exactly
2. Create a set of patterns to use as a guide for many unique strings
3. Use any string we want in each error messages

Decision Outcome
----------------

Chosen option: “Create a set of patterns for all fields to use exactly”,
because it minimizes translation cost, maximizes engineering efficiency,
and minimizes content review.

Consequences
~~~~~~~~~~~~

-  Good, because it maximizes consistency in implementation
-  Good, because only the source strings need content review and
   translation work
-  Good, because all instances of the string can be updated in one code
   change
-  Good, because it sets a consistent content UX
-  Neutral, because some fields may still need custom strings
-  Bad, because some strings will be ok but not great for some instances

Pros and Cons of the Options
----------------------------

Create a set of patterns to use as the sole source for all fields
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

-  Good, because it maximizes consistency in implementation
-  Good, because only the source strings need content review and
   translation work
-  Good, because all instances of the string can be updated in one code
   change
-  Good, because it sets a consistent content UX
-  Neutral, because some fields may still need custom strings

Create a set of patterns to use as a guide for field-specific strings
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

-  Good, because it sets a clear expectation for implementation
-  Neutral, because similar/same strings may be easily discovered and
   grouped for content review and translation work
-  Bad, because every string needs its own translation work
-  Bad, because every string needs engineering work to update it

Use any string we want in each error message
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

-  Good, because it maximizes flexibility for initial implementation
-  Bad, because every string needs its own content review and
   translation work
-  Bad, because every string needs engineering work to update it
-  Bad, because it may be confusing if the same type of error has
   different formulations across fields

Patterns
--------

+---+--------+--------------------------------------------------------+
| T | F      | Examples                                               |
| y | ormula |                                                        |
| p |        |                                                        |
| e |        |                                                        |
+===+========+========================================================+
| R | This   | [Same]                                                 |
| e | is     |                                                        |
| q | re     |                                                        |
| u | quired |                                                        |
| i |        |                                                        |
| r |        |                                                        |
| e |        |                                                        |
| d |        |                                                        |
+---+--------+--------------------------------------------------------+
| M | This   | [Same, and the field label should indicate what it     |
| a | does   | matches to]                                            |
| t | not    |                                                        |
| c | match  |                                                        |
| h |        |                                                        |
| / |        |                                                        |
| r |        |                                                        |
| e |        |                                                        |
| - |        |                                                        |
| e |        |                                                        |
| n |        |                                                        |
| t |        |                                                        |
| e |        |                                                        |
| r |        |                                                        |
+---+--------+--------------------------------------------------------+
| L | Must   | Must have fewer than 8 numbersMust have fewer than 8   |
| e | have   | numbers and letters                                    |
| n | fewer  |                                                        |
| g | than   |                                                        |
| t | [x]    |                                                        |
| h | [y]    |                                                        |
| m |        |                                                        |
| a |        |                                                        |
| x |        |                                                        |
| i |        |                                                        |
| m |        |                                                        |
| u |        |                                                        |
| m |        |                                                        |
+---+--------+--------------------------------------------------------+
| L | Must   | Must have at least 16 numbers                          |
| e | have   |                                                        |
| n | at     |                                                        |
| g | least  |                                                        |
| t | [x]    |                                                        |
| h | [y]    |                                                        |
| m |        |                                                        |
| i |        |                                                        |
| n |        |                                                        |
| i |        |                                                        |
| m |        |                                                        |
| u |        |                                                        |
| m |        |                                                        |
+---+--------+--------------------------------------------------------+
| L | Must   | Must have exactly 10 numbers                           |
| e | have   |                                                        |
| n | e      |                                                        |
| g | xactly |                                                        |
| t | [x]    |                                                        |
| h | [y]    |                                                        |
| t |        |                                                        |
| a |        |                                                        |
| r |        |                                                        |
| g |        |                                                        |
| e |        |                                                        |
| t |        |                                                        |
+---+--------+--------------------------------------------------------+
| L | Must   | Must have between 8 and 16 numbers                     |
| e | have   |                                                        |
| n | b      |                                                        |
| g | etween |                                                        |
| t | [x]    |                                                        |
| h | and    |                                                        |
| r | [y]    |                                                        |
| a | [z]    |                                                        |
| n |        |                                                        |
| g |        |                                                        |
| e |        |                                                        |
+---+--------+--------------------------------------------------------+
| A | Must   | Must be less than 100                                  |
| m | be     |                                                        |
| o | less   |                                                        |
| u | than   |                                                        |
| n | [x]    |                                                        |
| t |        |                                                        |
| m |        |                                                        |
| a |        |                                                        |
| x |        |                                                        |
| i |        |                                                        |
| m |        |                                                        |
| u |        |                                                        |
| m |        |                                                        |
+---+--------+--------------------------------------------------------+
| A | Must   | Must be at least 10                                    |
| m | be at  |                                                        |
| o | least  |                                                        |
| u | [x]    |                                                        |
| n |        |                                                        |
| t |        |                                                        |
| m |        |                                                        |
| i |        |                                                        |
| n |        |                                                        |
| i |        |                                                        |
| m |        |                                                        |
| u |        |                                                        |
| m |        |                                                        |
+---+--------+--------------------------------------------------------+
| A | Must   | Must be between 10 and 100                             |
| m | be     |                                                        |
| o | b      |                                                        |
| u | etween |                                                        |
| n | [x]    |                                                        |
| t | and    |                                                        |
| r | [y]    |                                                        |
| a |        |                                                        |
| n |        |                                                        |
| g |        |                                                        |
| e |        |                                                        |
+---+--------+--------------------------------------------------------+
| D | Must   | Must be December 31, 2023 or earlier;Must be today or  |
| a | be [x] | earlier;Must be tomorrow or earlier;Must be yesterday  |
| t | or     | or earlier                                             |
| e | e      |                                                        |
| m | arlier |                                                        |
| a |        |                                                        |
| x |        |                                                        |
| i |        |                                                        |
| m |        |                                                        |
| u |        |                                                        |
| m |        |                                                        |
+---+--------+--------------------------------------------------------+
| D | Must   | Must be January 1, 2023 or later;Must be today or      |
| a | be [x] | later;Must be tomorrow or later;Must be yesterday or   |
| t | or     | later                                                  |
| e | later  |                                                        |
| m |        |                                                        |
| i |        |                                                        |
| n |        |                                                        |
| i |        |                                                        |
| m |        |                                                        |
| u |        |                                                        |
| m |        |                                                        |
+---+--------+--------------------------------------------------------+
| D | Must   | Must be between January 1, 2023 and December 31,       |
| a | be     | 2023;Must be between January 1, 2023 and today;Must be |
| t | b      | between today and tomorrow;Must be between yesterday   |
| e | etween | and tomorrow                                           |
| r | [x]    |                                                        |
| a | and    |                                                        |
| n | [y]    |                                                        |
| g |        |                                                        |
| e |        |                                                        |
+---+--------+--------------------------------------------------------+
| A | Must   | Must have only English letters;Must have only          |
| l | have   | numbers;Must have only English letters and             |
| l | only   | numbers;Must have only numbers, parentheses, and       |
| o | [x]    | apostrophes;Must have only !@#$%^&*()                  |
| w |        |                                                        |
| l |        |                                                        |
| i |        |                                                        |
| s |        |                                                        |
| t |        |                                                        |
+---+--------+--------------------------------------------------------+
| E | This   | This should look like username@website.com;This should |
| x | should | look like 123-456-7890                                 |
| a | look   |                                                        |
| m | like   |                                                        |
| p | [x]    |                                                        |
| l |        |                                                        |
| e |        |                                                        |
+---+--------+--------------------------------------------------------+
