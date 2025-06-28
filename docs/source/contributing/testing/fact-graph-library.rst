Fact Graph Library
==================

About these Fact Graphs
-----------------------

We made a limited number of starting assumptions for these filing status
fact graphs. They are filled in so that TP1:

-  Has an SSN
-  Is a citizen
-  Is an age within DF’s range of support
-  Lived and earned in a state that doesn’t have its own state-specific
   questions in the flow (no AK, MD, NJ, or NY)
-  Is NOT a dependent taxpayer (unless as specific filing status
   scenario calls for it, like a dependent QSS taxpayer)

.. raw:: html

   <details>

.. raw:: html

   <summary>

The goal a Utility Fact Graph

.. raw:: html

   </summary>

**What we kept in mind when making these:**

-  The goal of a Utility Fact Graph is to save **manual testers** time
   on tax return fill-in as they test many different scenarios.
-  It’s meant to be a no-frills foundation for further editing: it is
   not meant to capture the world of fact combinations that could result
   in a given filing status.
-  Because Data Import functionality now locks down the SSN/ITIN and
   Date of Birth fields for TP1 in the UI, we chose to make all these
   fact graphs with an SSN and a set age: over or under 65. If a tester
   needs an ITIN or a different DOB for TP1, they will have to manually
   change that in the fact graph json or just fill in a fresh return in
   the UI.

**Utility fact graphs should:**

-  be limited to answers and choices contained in Section 1, You and
   your family
-  answer all questions that don’t go to filing status determination in
   a vanilla way that doesn’t lead to conditional questions or potential
   downstream effects
-  only add a person to the Family and household section if a qualifying
   person is required for filing status eligibility
-  avoid answering in ways that could impact things other than filing
   status (for example, even though a QSS qualifying person can be any
   age and a couple different relationship types, it could be confusing
   and potentially impact other tests if in the utility fact graph they
   were filled in as a ‘foster child’ instead of a biological child)

.. raw:: html

   </details>

How to use a fact graph in DF
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

1. Copy the text of the entire fact graph you want to load into DF
2. Start a new tax return in DF or use an existing return
3. Go to the Account menu in DF
4. Expand the accordion for “Upload data” that’s in the orange box
   titled “Dev-only Control Panel”
5. Paste the whole fact graph into the box labeled “Paste factgraph”
6. Click “Upload fact graph from text”
7. Say OK in the dialog box that pops up asking if you want to overwrite
   the existing return
8. Go back to your tax return, your fact graph info should now be
   populated

Single Filing Status
--------------------

Under 65
~~~~~~~~

-  `Single (1995, MA) <fact-graphs/single_1995_ma.json>`__

Over 65
~~~~~~~

-  `Single (1940, MA) <fact-graphs/single-1940-MA.json>`__

Married Filing Jointly Filing Status
------------------------------------

.. _under-65-1:

Under 65
~~~~~~~~

-  `MFJ (1995, TN) <fact-graphs/mfj_1995_TN.json>`__

.. _over-65-1:

Over 65
~~~~~~~

-  `MFJ (1940, TN) <fact-graphs/mfj_1940_TN.json>`__

Married Filing Separately Filing Status
---------------------------------------

.. _under-65-2:

Under 65
~~~~~~~~

-  `MFS (by choice, 1995,
   TN) <fact-graphs/mfs_by_choice_1995_TN.json>`__
-  `MFS (because spouse is NR, 1995,
   FL) <fact-graphs/mfs_w_nr_spouse_1995_FL.json>`__

.. _over-65-2:

Over 65
~~~~~~~

-  `MFS (by choice, 1940,
   TN) <fact-graphs/mfs_by_choice_1940_TN.json>`__
-  `MFS (because spouse is NR, 1940,
   FL) <fact-graphs/mfs_w_nr_spouse_1940_FL.json>`__

Head of Household Filing Status
-------------------------------

.. _under-65-3:

Under 65
~~~~~~~~

-  `HOH (TP unmarried, qp is their claimed dependent, 1995,
   TN) <fact-graphs/HOH_unmarried_claimed_dependent_1995_TN.json>`__
-  `HOH (TP unmarried, qp is non-dependent, 1995,
   TN) <fact-graphs/HOH_unmarried_with_nondependent_hoh-qp_1995_TN.json>`__
-  `HOH (TP considered unmarried for HOH, qp is their claimed dependent,
   1995,
   TN) <fact-graphs/considered_unmarried_for_HOH_claimed_dep_qp_1995_TN.json>`__
-  `HOH (TP considered unmarried for HOH, married to nonresident and
   lived together last 6 months, claimed dependent, 1995,
   TN) <fact-graphs/fact-graph-2024-12-10-hoh-considered-unmarried-nra.json>`__
-  `HOH (TP considered unmarried for HOH, qp is non-dependent, 1995,
   TN) <fact-graphs/considered_unmarried_for_HOH_nondependent_hoh-qp_1995_TN.json>`__

.. _over-65-3:

Over 65
~~~~~~~

-  `HOH (TP unmarried, qp is their claimed dependent, 1940,
   TN) <fact-graphs/HOH_unmarried_claimed_dependent_1940_TN.json>`__
-  `HOH (TP unmarried, qp is non-dependent, 1940,
   TN) <fact-graphs/HOH_unmarried_with_nondependent_hoh-qp_1940_TN.json>`__
-  `HOH (TP considered unmarried for HOH, qp is their claimed dependent,
   1940,
   TN) <fact-graphs/considered_unmarried_for_HOH_claimed_dep_qp_1940_TN.json>`__
-  `HOH (TP considered unmarried for HOH, qp is non-dependent, 1940,
   TN) <fact-graphs/considered_unmarried_for_HOH_nondependent_hoh-qp_1940_TN.json>`__

Qualifying Surviving Spouse Filing Status
-----------------------------------------

.. _under-65-4:

Under 65
~~~~~~~~

-  `QSS (QSS-qp is their claimed dependent, 1995,
   MA) <fact-graphs/QSS-1995-MA.json>`__
-  `QSS (QSS-qp is a non-dependent, 1995,
   MA) <fact-graphs/QSS-nondepQP-1995-MA.json>`__
-  Dependent Taxpayer QSS

   -  `QSS (TP is dependent taxpayer, QSS-qp doesn’t meet dependent
      tests, 1995,
      MA) <fact-graphs/QSS-dependentTP-nondepQP-1995-MA.json>`__
   -  `QSS (TP is dependent taxpayer, QSS-qp meets dependent tests but
      TP can’t claim them because TP is a dependent themselves, 1995,
      MA) <fact-graphs/QSS-dependentTP-QP-passes-dependent-tests-1995-MA.json>`__

.. _over-65-4:

Over 65
~~~~~~~

-  `QSS (QSS-qp is their claimed dependent, 1940,
   MA) <fact-graphs/QSS-1940-MA.json>`__
-  `QSS (QSS-qp is a non-dependent, 1940,
   MA) <fact-graphs/QSS-nondepQP-1940-MA.json>`__
-  Dependent Taxpayer QSS

   -  `QSS (TP is dependent taxpayer, QSS-qp doesn’t meet dependent
      tests, 1940,
      MA) <fact-graphs/QSS-dependentTP-nondepQP-1940-MA.json>`__
   -  `QSS (TP is dependent taxpayer, QSS-qp meets dependent tests but
      TP can’t claim them because TP is a dependent themselves, 1940,
      MA) <fact-graphs/QSS-dependentTP-QP-passes-dependent-tests-1940-MA.json>`__

Tailored situations
-------------------

-  `Taxpayer with child who is their nondependent qualifying person for
   CDCC and EITC, but is not their nondependent qualifying person for
   HOH <fact-graphs/fact-graph-2024-12-11T19_29_51.720Z.json>`__
-  `Taxpayer who potentially qualifies for CTC, ODC, CDCC, and EITC and
   is about to start the Credits section in
   DF <fact-graphs/fg-baseline-start-credits-ctc-odc-cdcc-eitc.json>`__
