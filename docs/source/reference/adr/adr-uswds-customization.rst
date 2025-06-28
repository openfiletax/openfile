+---------+------------------------------------------------------------+
| ADR     | Custom USWDS configuration settings in 2024 Direct File    |
| title   | Pilot                                                      |
+=========+============================================================+
| status  | Approved                                                   |
+---------+------------------------------------------------------------+
| date    | 2023-08-23                                                 |
+---------+------------------------------------------------------------+

Custom CSS theming of USWDS within Truss React Components
=========================================================

Context and problem statement
-----------------------------

The USWDS design system is implemented in Direct File using `ReactUSWDS
Component
Library <https://trussworks.github.io/react-uswds/?path=/story/welcome--welcome>`__,
an open source library built and maintained by Truss. Truss includes
out-of-the-box CSS with each component, with some variation in color and
component display options. Using a component library helps engineers
build Direct File quickly while maintining a high degree of quality and
consistency in the UI.

It is possible to `customize configuration
settings <https://designsystem.digital.gov/documentation/settings/#configuring-custom-uswds-settings>`__
within USWDS design system. Developing a shared understanding of this
system across Engineers, Designers and PM’s and then organizing and
designing within these parameters is a sizeable effort for the team. It
is a body of work that would add additinoal risk to meeting our project
deadline.

Examples of these challenges are: - Anticipating knock-on effects of any
particular customization has proven time-consuming. An example of this
customization pertained to the header. The design switched the header
color to dark, and when the default stock menu was applied, the menu
button text was dark grey, which is a visibility/accessibility issue.
CSS was added to make that menu button text light but then in responsive
mode, these buttons get moved to the dropdown nav, which has a light
background. So then that menu button text needs to be dark, etc. This
type of reactive color fixing creates an inconsistency and is time
consuming. - Coordinating common practices of how we implement design
overrides at the code level is time-consuming and situational - Creating
consistency across separate applications (i.e. the Screener and the
Filing application itself) requires more overhead the further we deviate
from a out-of-the-box implementation of USWDS

Therefore, we propose that USWDS settings customization is out of scope
for the Pilot not because it is not possible, but because at this point,
investing time into customization is a lower priority than completing
the base functionality required for the successful launch of the Pilot.

On a system wide level, design tokens provided by ``usds-core`` can be
overwritten in ``_theme.css``. Some system-wide theme guidelines
currently exist in this file. It’s my recommendation that we continue to
utilize this pattern for CSS settings which are confidently applied
application wide.

Decision Outcome
----------------

Custmizing the settings of USWDS within React Truss Compoents is not in
scope for the 2024 Direct File Pilot.

Consequences
~~~~~~~~~~~~

Pros:

-  Using out-of-the-box functionality enables designers and engineers to
   move quickly and meet our go/no go deadline for the Pilot
-  This does not have to be a permanent decision: we can go back later
   and develop a strategy for customizing the application in CY2024 or
   beyond
-  Taxpayers will experience a more consistent UX.

Cons:

-  This limits the look and feel of Direct File Pilot for 2024.
-  There is some in-progress work that will need to be abandoned and/or
   removed (tech debt).

Next Steps
----------

-  Designer leads review the Source of Truth to confirm sketches that
   are being used for Design Audit are consistent with USWDS
   out-of-the-box configuration, and not accidentally
   introducing/proposing customization in new Developer tickets.
   (Suzanne, Jess, Jen)
-  Designers working on Design Audit ensure new tickets written do not
   introduce customization to USWDS components.
-  PM/Delivery lead for Design Audit and Components must audit tickets
   as they come through to ensure that they are not introducing new
   customization to USWDS components.
-  All teams must be made aware to ensure future commits to Source of
   Truth mural accurately reflect this decision.
