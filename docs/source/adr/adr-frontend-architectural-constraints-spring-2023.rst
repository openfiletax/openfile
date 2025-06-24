# ADR: Frontend Architectural Constraints for the Spring 2023 Client
Date: 10 May 2023

## Background

In April of 2023, the direct file team decided to prototype a new frontend (different from the developed for usability
tests earlier in the year) that has the following goals:

1. The main source of state/truth is the FactGraph, as provided by the transpiled scala code
2. The screens for the application are driven by a static configuration that maps nodes in the Factgraph to fields on the screen
   1. Screens can be conditionally displayed, and the condition is calculated on the basis of data in the Factgraph
   2. Groups of screens, called collections, can be repeated - most commonly when a tax return has more than one W2 or Filer
3. All tax calculation is handled by the Factgraph
4. The structure remains a SPA, to take advantage of edge processing of end users when doing Factgraph calculations
5. We can support multiple languages, and translation screens can include user-entered data
6. The application will meet the requirements of WCAG 2.0 and relevant 508 Standards


## Architectural properties

### Major pieces

Work to produce a client with the above properties has been prototyped in df-client as a React app. This app contains some early-stage design decisions:
- a **flow** from a tsx (soon to be xml) file, defines the order of questions in the interview and fields to be displayed on each screen
- the **fact dictionary**, serialized as JSON by the backend, defines the shape of the Factgraph, how facts are calculated/derived, and what the constraints on given facts are
- **translation strings** using i18next/i18next-react are modified to perform string interpolation from the Factgraph, as well as predetermined tax information via user interface text.

The basic mechanics for the client's operation look as follows:

1. On startup, the client initializes a mostly-empty factgraph using the JSON-serialized fact dictionary. This is exported as a global singleton object and is **the** mechanism for conveying tax-data-related state across screens/parts of the application. State that is unrelated to the user's tax data is stored in session storage and will be discussed in later ADRs.
2. A `BaseScreen` component reads the **flow** configuration to configure screens. Each screen contains either text (called `InfoDisplay`) or some number of fields (generically called `Facts`) gathering information from the user from the Factgraph. 
   1. Each field is responsible for writing its own data into the Factgraph, once those data are valid. Additionally, fields read their initial data from the Factgraph, which allows users to go back to previous screens and edit.
   2. The Screen saves the user's data when the taps "Save" and transmits the writable facts back to the server.
3. The URL's within the interview portion of the application are formatted using a nested hierarchy, where each screen's URL reflects the current position in the flow.
4. `Checklist` component reads the **flow** and builds itself based on the category/subcategory/screen/fact configurations therein. The checklist computes the user's progress through the application by looking up which facts are complete and thereby which screens have all of their facts complete. These calculations are made based on the state of the local factgraph.

### Constraints

As we've built out the application, we've assumed the following constraints --- while none of these are set in stone, they are set in code that would require relatively deep changes to undo:

1. Several components use the **flow** configuration independently, and we treat is as, effectively, a global constant. As such, the **flow** configuration itself should be static. It allows for conditionals, so the user's flow can respond to change, but all possible paths should be in the flow at startup.
   1. Conditionals in the flow expect a simple boolean value from the Factgraph --- any complex logic for flow conditionals should be computed in the Factgraph and exposed as a boolean derived fact
2. The application's overall state is opaque to react, which makes having multiple independent parts of the application concurrently rendered and synchronized difficult. For example, if we wanted to keep the checklist visible as the user entered facts, and have the checklist change its state automatically as the user completed various facts, this would require some creative engineering. As it is currently, this is not an issue --- react is re-rendering whole screens as the user works through the application, and it pulls the facts it needs for a given screen from the Factgraph on render. From the user's perspective, the checklist _is_ always up-to-date, because every time a user looks at the checklist, it will re-render and pull the latest overall state from the factgraph to calculate itself. The same is true of each individual screen in the interview --- they all replace one another, which necessitates re-rendering, and therefore screens are always constantly from the factgraph. We only run into problems if we want multiple screens that currently are considered to be rendered alone to be rendered together on the same screen and react to one another.
3. While we can reference facts in translation strings (via interpolation), the template language in i18next is VERY simple. I don't have a good solution here, other than read the docs and expect we'll need to code some solutions around it.


## Status
Documentation
