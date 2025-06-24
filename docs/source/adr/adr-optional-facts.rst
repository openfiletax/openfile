==============
Optional facts
==============

:Date: 2023-11-14
:Status: Decided

.. raw:: html

   <!-- we need to disable MD025, because we use the different heading "ADR Template" in the homepage (see above) than it is foreseen in the template -->

.. raw:: html

   <!-- markdownlint-disable-next-line MD025 -->

Optional Facts
==============

Context and problem statement
-----------------------------

The fact graph does not have a way to represent optional facts and we
need to set certain fields such as W2 boxes and middle initials to be
optional.

We need this feature for MVP.

Desirable solution properties
-----------------------------

We’d like the solution to this problem to

1. Allow us to show in the frontend to users that fields are optional.
2. Allow the user to leave the field blank and hit
   ``Save and continue``.
3. Allow the fact graph to properly calculate downstream calculations
   without this fact.

Considered options
------------------

1. Create a mechanism to allow specific writable facts to be left
   incomplete
2. Create the idea of null or default values in the fact graph/fact
   dictionary

Decision Outcome
----------------

Chosen option: **Create a mechanism to allow specific writable facts to
be left incomplete**

We do this by creating a second derived fact that is always complete.
The original fact is prefixed with ``writable-``. The derived fact uses
the incompleteness of the writable fact to provide a default value. See
below for instructions.

Reasoning: This one doesn’t complicate our fact system with the ideas of
placeholders, default values, ``hasValue``\ s, validity etc because it
keeps writable values separate from the downstream value. So it might be
easier to do and easier to understand.

However, we felt in a v2 future version, we might do the other option.
For now, we have proceeded with this option.

Consequences
~~~~~~~~~~~~

1. Good: We can start marking fields as optional.
2. Good: We can test that optional fields aren’t breaking the flow
   downstream.
3. Good: We can test that visual treatment for optional fields works for
   users.
4. Bad: The scala option where we add the concept of optional fields
   into the graph itself might be more comprehensive.

How to make a fact optional
~~~~~~~~~~~~~~~~~~~~~~~~~~~

Engineers looking to make a fact optional can do the following.

1. Find the component in ``flow.tsx``. Not all fact types are enabled
   for optionality!!

   Only ``GenericString`` fields and ``TextFormControl`` based fields
   (Dollar, Ein, Pin etc.) are enabled for optionality.

   .. code:: xml

      <Dollar path='/formW2s/*/wages'/>

-  Add ``required='false'`` and rename to ``writableWages``.

   We must rename the fact, because we have to ensure no derived facts
   get marked as optional.

   .. code:: xml

      <Dollar path='/formW2s/*/writableWages' required='false' />

2. Find out if there should be a default value for this fact, or if it
   can be left incomplete.

   -  Dollar values can often use 0 as a default.
   -  Strings or enums may not have a correct default, and we may want
      to leave these incomplete.
   -  An incomplete fact can break other parts of the flow so we should
      verify with backend before leaving it incomplete.
   -  Reach out on Slack to get guidance from backend team members.

   **IF DEFAULT IS NEEDED:** Find the fact in ``ty2022.xml`` or other
   fact dictionary files, and create a derived version that is always
   complete. It uses the incompleteness of the writable fact to provide
   a default value.

-  Replace this:

   \```xml Wages Box 1 of Form W-2, wages, tips, and other compensation.

   ::

      <Writable>
        <Dollar />
      </Writable>

      <Placeholder>
        <Dollar>0</Dollar>
      </Placeholder>

-  With this (be sure to remove ``<Placeholder>`` if there is one):

   .. code:: xml

      <Fact path="/formW2s/*/writableWages">
        <Name>Wages</Name>
        <Description>
          Box 1 of Form W-2, wages, tips, and other compensation.

          This is the writable optional fact. Can be left incomplete.
          Please use the derived fact in downstream calculations.
        </Description>

        <Writable>
          <Dollar />
        </Writable>
      </Fact>

      <Fact path="/formW2s/*/wages">
        <Name>Wages</Name>
        <Description>
          Box 1 of Form W-2, wages, tips, and other compensation.
        </Description>

        <Derived>
          <Switch>
            <Case>
              <When>
                <IsComplete>
                  <Dependency path="../writableWages" />
                </IsComplete>
              </When>
              <Then>
                <Dependency path="../writableWages" />
              </Then>
            </Case>
            <Case>
              <When>
                <True />
              </When>
              <Then>
                <Dollar>0</Dollar>
              </Then>
            </Case>
          </Switch>
        </Derived>
      </Fact>    

   **IF DEFAULT IS NOT NEEDED:** Find the fact in ``ty2022.xml`` or
   other fact dictionary files, and create a derived version that may be
   incomplete.

-  Replace this (don’t remove the Placeholder):

   .. code:: xml

      <Fact path="/formW2s/*/wages">
        <Name>Wages</Name>
        <Description>
          Box 1 of Form W-2, wages, tips, and other compensation.
        </Description>

        <Writable>
          <Dollar />
        </Writable>

        <Placeholder>
          <Dollar>0</Dollar>
        </Placeholder>
      </Fact>

   with this: \```xml Wages Box 1 of Form W-2, wages, tips, and other
   compensation.

   ::

      <Writable>
        <Dollar />
      </Writable>

      <Placeholder>
        <Dollar>0</Dollar>
      </Placeholder>

   Wages Box 1 of Form W-2, wages, tips, and other compensation.

   ::

      <Derived>
        <Dependence path='../writableWages' />
      </Derived>

   | 
   | \``\`

3. Search the ``flow.tsx`` for other components using the writable fact
   and update the fact name.

4. Rebuild the fact dictionary code

-  In ``direct-file/df-client/fact-dictionary`` run

   .. code:: sh

      npm run build

5. Edit ``en.yaml`` and the other locales to replace field labels for
   the writable fields

   .. code:: yaml

      /formW2s/*/writableWages: 
          name: Wages, tips, other compensation

6. Finally, run tests and fix any testcases that should have the
   writable field, or alternately the derived field.

Pros and Cons
-------------

Create a mechanism to allow specific writable facts to be left incomplete
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

We do this by creating a second derived fact that is always complete.
The original fact is prefixed with ``writable-``. The derived fact uses
the incompleteness of the writable fact to provide a default value.

Pros
^^^^

-  Lower lift
-  Doesn’t complicate the fact system with placeholders and potentially
   avoids complex bugs in the fact system at this late stage.
-  Easier to understand.

Cons
^^^^

-  It’s likely more correct and complete for our fact system to
   understand optionality.

Create the idea of null or default values in the fact graph/fact dictionary
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

In this method, we would change the scala and the factgraph to handle
the concept of null or default values.

If something has a default value in the fact dictionary, we pick that up
on the frontend (similar to how we do enumOptions) and then let a person
skip the question, using the default value in its place.

.. _pros-1:

Pros
^^^^

-  This might be more logically correct as we’re not overloading the
   concept of ``incomplete`` with ``optional+empty``

.. _cons-1:

Cons
^^^^

-  Bigger lift than the other option.
-  Requires scala rework which we have less engineering bandwidth for.
-  Currently, every writable fact is either ``incomplete + no value``,
   ``incomplete + placeholder``, or ``complete``. Making this change
   would add a fourth state of ``incomplete + default value`` and that
   might have multiple downstream consequences in our application.
