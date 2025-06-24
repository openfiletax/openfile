---
parent: Decisions
nav_order: 100
title: "Yaml Translations"

# These are optional elements. Feel free to remove any of them.
status: "Proposed"
date: "20230906"
---
<!-- we need to disable MD025, because we use the different heading "ADR Template" in the homepage (see above) than it is foreseen in the template -->
<!-- markdownlint-disable-next-line MD025 -->
# Yaml Translations

## Context and problem statement

The translation files have 3 use cases

* The frontend code dynamically populates screens with the content of the translations. The structure needs to work with react-18next.
* The content will need to be written by a content team, and possibly taxperts, in the future.
* The content will also be provided as a set of meaningful strings for the translation teams to translate. They will return translations which will then need to be reintegrated into the codebase.

As this will be consumed by non-engineers, the current strategy of allowing tags within strings is becoming unwieldy.

The translation team has expressed concern with the html style strings and we decided to find a less challenging and less error-prone format.

## Desirable solution properties

We'd like the format to 

1. Be easily consumed by our frontend and generate correct html
2. Be easily editable by the backend team currently writing content
3. Be easily editable by the content team when we transition to them editing
4. Split into strings that preserve enough context for translation teams to translate
5. Do not contain too much complexity of tags within the strings (`<strong>` and `<i>` ok)

## Considered options

1. Don't change anything, use json with all tags in strings
2. Use json but represent html as a structured json object
3. Use markdown and convert to json
4. Use yaml and represent html as a structured object

## Decision Outcome

Chosen option: Use yaml and represent html as a json object

Reasoning: Yaml is designed to be easy to read and understood by humans, which will help our translation/content files be more editable and consumable for everyone. By introducing the structure, we can cleanup the proliferation of tags in our strings and make the translation process go more smoothly. 

Yaml is a superset of json and can represent all our current json 1:1. It's also a format that can be ingested by react-i18next.


Consequences:

* We need to convert the json to yaml, and break up the html strings into structured yaml, which will be used to generate the content.
* Editors of en.json will have to write yaml.
* Translators will get simplified strings with minimal html.

## Pros and Cons

### Don't change anything, use json with all tags in strings

```
    "/info/you-and-your-family/spouse/intro": {
      "body": "<p>You'll need to know:</p><ol> <li><strong>If you're considered 'married'</strong><p>Many long-term partnerships resemble marriage, but for tax purposes, there are guidelines for what is and isn't considered married.</p></li> <li><strong>If you and your spouse want to file a return together</strong></li><p>People who are married can file a tax return together (jointly) or file separate returns.</li> </ol>"
    },
```

#### Pros

* No work, it's what we have already.
* React-i18next supports json out of the box.

#### Cons

* This is getting harder to read and edit as we continue to insert more content into this file.
* Translators will struggle with the nested tags and likely make errors which will slow down translation updates.
* It's not possible to break down these strings easily into meaningful snippets to send the translators, that will convert back into json.
* Content team might also struggle with editing this format.

### Use json but represent html as a structured json object

```
  "body": [
    "You'll need to know:",
    {
      "ol": [
        {
          "li": [
            "<strong>If you're considered 'married'</strong>",
            "Many long-term partnerships resemble marriage, but for tax purposes, there are guidelines for what is and isn't considered married."
          ]
        },
        {
          "li": [
            "<strong>If you and your spouse want to file a return together</strong>",
            "People who are married can file a tax return together (jointly) or file separate returns."
          ]
        }
      ]
    }
  ]
```

#### Pros

* React-18next supports json out of the box (however we do have to dynamically generate the DOM elements).
* It can be flexible and we can also limit what tags we accept as we dynamically generate the DOM elements.
* Can easily programmatically be broken up into meaningful snippets for translators.
* Limited tags in the strings themselves, so less error-prone.

#### Cons

* Content is hard to read and write because of heavy nesting.
* This is challenging as an engineer, will be very challenging for a non-dev to edit with errors.

### Use markdown and convert to json

#### Pros

* Translators showed enthusiasm for this option.
* Can easily programmatically be broken up into meaningful snippets for translators.
* Limited tags in the strings themselves, so less error-prone.
* Content is easier to write for non-devs.
* Looks readable too.

#### Cons

* Not supported by react-i18next out of the box.
* We will need an extra step to get the markdown into a format for ingestion by react-i18next.
* Markdown is less strict than html and it's possible the markdown->html generates a larger variety of generated html than we intend to support.
* We need to convert the whole en.json into markdown.
* Opportunity for errors still exists when writing markdown correctly.

### Use yaml and represent html as a structured object

```
body:
- "You'll need to know:"
- ol:
  - li:
    - "<strong>If you're considered 'married'</strong>"
    - "Many long-term partnerships resemble marriage, but for tax purposes, there are
      guidelines for what is and isn't considered married."
  - li:
    - "<strong>If you and your spouse want to file a return together</strong>"
    - "People who are married can file a tax return together (jointly) or file separate
      returns."
```

#### Pros

* It can be flexible and we can also limit what tags we accept as we dynamically generate the DOM elements.
* Can easily programmatically be broken up into meaningful snippets for translators.
* Limited tags in the strings themselves, so less error-prone.
* Much more readable and editable in it's raw format for both content teams and engineers.

#### Cons

* We need to convert the whole en.json into yaml
* React-18next doesn't support yaml out of the box (however yaml->json is a well defined conversion).
* Opportunity for errors when writing the structure and getting the format and indent correct.
