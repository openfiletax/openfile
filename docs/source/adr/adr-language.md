# ADR: Backend Programming Language
DATE: 12/14/2022

## Background

What general programming language should we use for the back end tools we create?  This includes the tax engine, the APIs, any code generation tools, and anything else that we might need that isn't part of the client software.  We generally think it is advisable to keep the number of languages low to facilitate developers working on multiple parts of the system, which will help keep the number of required contractors down.  There are both technical and nontechnical reasons why a language might be chosen.  

#### Technical Questions

1. **How well does the language natively support graph concepts?**  In the prototype we used a graph to express tax logic as configuration, with the hope that one day we could build a system that allows nontechnical users to update that logic.  We believe this was a sound concept and will be carrying it forward into the new system.
2. **How well would the language support building APIs?** Our plan is to use REST endpoints to retrieve and save data.  We require a system that has strong support for these concepts and has been used at scale.
3. **How well does the language support code generation?** We believe that code generation will be a key component of the system.  Our front end pages and some of their logic will be generated from our backend configuration, and as such we need a language that lends itself to this kind of activity.  This could include access to compiler tools or a strong domain modeling ability in the language.
4. **Does the ecosystem of the language support SOAP/WSDL/SOA concepts?**  The MeF API describes itself using WSDL and will expect communication through this enterprise architecture style communication pattern.  Our language should have an ecosystem that supports this kind of communication/service.  This means that we should be able to point to a WSDL and have calls and possibly domain objects generated with any included validation.
5. **How strong is the tooling, the ecosystem, and the available libraries for the language?**  The more we can automate, and the more we can rely on third parties for common interactions, the better.  Our language should have connectors to commonly available cloud tools.  It should have an IDE that works well, has a built in test runner, and has realtime support for warning and errors.  We should not have to gather applications and create our own build tools.
6. **How popular is the language and will it last?** Few things in programming are worse than building in a language that the community has abandoned.  Languages, frameworks, and tools become popular and then disappear just as quickly.  Some languages last for decades only to fall out of favor for newer tools.  Our goal is to find a language that is popular enough that it won't disappear, i.e. it has buy-in from large companies and industry domains.

#### Non Technical Questions

1. **How likely are we to find contractors that know the language(s) well?** This is a tricky concept because it relies on two separate factors.  The first is the pure number of contractors we imagine exist in a given language based on the popularity of the language and its use in government projects.  The second is the relative quality of those contractors based on the ease of use of the language.  Some languages are generally used by high skilled coders, and others are open to a wider audience where the skill level varies substantially.

2. **What is the IRS likely to accept?** What languages do they currently support?  What sort of process have they built up around those languages and the tools that support those languages?  This is really the ultimate question, as anything the IRS wouldn't accept is out by default!

## Decision 

We have decided to take a hybrid Scala and Java approach.

## Rationale 

The rationale can best be couched in the questions above.  In short though, we believe that Scala best matches the domain and the problems at hand while Java has some of the tooling and auto generation features we would want for external communications.  They work interchangeably, so this shouldn't present a problem.

#### Technical Questions

1. Scala, and other functional languages have strong support for graph concepts.  When building graph systems in other languages, it is common to employ functional concepts when architecting and coding the system.  Even basic concepts like immutability and a lack of nulls helps to cut down on the amount of code required to generate the system.  Beyond that, because of its natural affinity for recursion, Scala can handle traversal idiomatically.  OO languages end up with extra lines and can be less expressive for the concepts we will be using.
2. This is one of the areas where the hybrid approach with Java shines.  For our API layer we will fall into a common Java Spring pattern, which allows us all of the great tooling and speed of development that that ecosystem offers.  Both Scala and Java have been used at Scale (Scala comes from the word scalable).
3. Functional languages are known for the ease in which a developer can model a domain and perform actions based on those models.  Code generation, ignoring the read in and write out steps, is a pure process in the sense that it is idempotent.  Working with pure functions is what functional languages are good at.  Combining the two, a powerful domain model and pure functions, is a recipe for simple, powerful code generation.
4. Again, this is where the Java hybrid approach comes in.  Java was strong in the days of SOA, and in fact, many of the books about SOA used Java as the lingua franca.  It has amazing tools to work with WSDL, to process SOAP messages, and to handle anything we aren't expecting that may come from the SOA world.  
5. Our belief is that the tooling is strong around both Scala and Java.  The intelliJ IDE works well and meets all of the criteria of a modern, full service IDE.  There are also alternative choices, like VSCode, which also meets all of the needs of a developer on a large scale system.  Twitter, and many financial institutions have been using Scala successfully for many years.
6.Scala has been around for 18 years, and is one of the most popular languages on the JVM.  It is the domain language of choice in the financial space.  It isn't going anywhere any time soon.

#### Non Technical Questions
1. Scala is a difficult language.  Many functional concepts will require exploration for mid level and novice programmers.  We believe that the kinds of contractors who will be available will be more senior and will be better able to contribute long term to the project.  We also believe that this language difficulty will protect us from common, simple mistakes at the cost of a higher ramp up time and a smaller potential contractor pool.

2. Because Scala runs on the JVM it should be acceptable.  All of the support systems are already in place within the IRS to update and manage Java systems.  Except for the code, our systems will appear no different.  They will use common Java libraries, common java tools, and require the same sorts of maintenance.

## Rejected Languages

Below is the set of languages we measured and rejected in order of how well suited we feel they are to the problem space
1. **C#**: This was a close contender with Scala.  It checks all of the boxes, but we felt that Scala is better for graphs and is closer to the stack that the IRS is comfortable with.
2. **Kotlin**: This language is very popular in the JVM ecosystem.  It fell behind C# because of our lack of familiarity and its relative newness.  It had the same pitfalls as other OO languages.
3. **Java**: Java was strongly considered, as it is the main language of the IRS, but we felt that it lacked many features that would make developing this application quick and easy.

The rest (no particular order):
- **F#**: This language has many of the features of Scala, but it is on the dotnet framework.  We don't know if the IRS currently manages any dotnet systems.  It is also a little less common than Scala.  If we were to pick between the two for a general large scale production application, Scala would be the winner.
- **Rust**: We are just too unfamiliar with Rust to choose it to build something like this.  It is also very new which comes with a lot of painful changes later.
- **Go**: This is another language that might be great, but we don't know enough about it.  The ramp up time would be more than we have.
- **Ruby**:  We built the prototype for most of this work in Ruby.  While it worked well, we don't want to have to go through open source package management nightmares in a production application.  
- **Typescript/Node**: Same as Ruby.  The dependency on abandoned projects with security holes is a problem.  Those packages can also introduce versioning conflicts and a whole host of other problems that we would rather not deal with from a support angle.
- **Python**: Same as Ruby and Typescript!


## Assumptions

- We will represent tax logic in a graph 
- Rest endpoints are the preferred way of handling client-server communications
- Code generation is a workable approach
- MeF uses SOA concepts like WSDL and SOAP
- Contractors will be of higher quality
- Contractors in some languages are better than others
- Functional languages are better for dealing with graphs
- Functional languages are good for code generation for the reasons stated above
- The IRS doesn't use dotnet
- The hybrid approach is simple and easy to do
- Ruby/Python/Node have package issues that make them less desirable for government work


## Constraints
- The language should be understood by the team.
- The language should have practical use in large scale systems.
- The language should have financial domain applications.
- The language should be common enough that contractors are available.
- The language should follow a known, common support model.
- The language/ecosystem should be known by the government.
- The language has support for our domain concepts
- The language has existed for a long enough period of time to have gained common adoption.

## Status
Pending

## Consequences
The first, and most obvious consequence of this decision is that we won't be using another programming language.  This locks us into a specific set of tools and resources.


