# Data Import System Structure
Date: 7/3/2024

## Acronyms
- DF: Direct File
- DI: Data Import
- ETL: Extract, Transform, Load
- IR: Information Return
- TIN: Taxpayer Identification Number



## Context
To facilitate the correctness of the return and speed of data entry, Direct File (DF) should present the user with information that the IRS has about them that would be relevant to their return.  This could include information returns (1098s, 1099s, W2s, etc), biographical information, and anything else that would help the user accurately file their return.  To gather this information the DF application set needs one or more applications making up a Data Import (DI) system that is responsible for gathering the information, either on demand or prefetched, and providing it out to other systems upon request.

This ADR is an argument for a specific application layout for the DI system.  It doesn't specify the interface between the application, any app and the Backend App, nor does it specify which IRS systems should be included in DI or an order of precedence for those systems.  Any system names used are for example purposes and shouldn't be taken as a directive.  The DI system accesses information considered controlled by the IRS which is stored either in AWS or on prem servers.  

## Decision

The DI system should be a single app that checks IRS systems on request for the first year.  In the second year, when we have a larger population of users it might be useful to precache the imports for known users and store them for when the user returns. It is also doubtful that we could get an encrypted storage mechanism for such sensitive data approved in time for launch.  This question of precaching should be revisited next year.


### Application Structure

#### Input 

The input to the system should be a queue that accepts messages from the backend, provided on return creation.  The message should contain the TIN of the user and any other information required by the IRS internal interfacing systems (modules to the DI system).  This message should be given some mechanism to be correlated back to a tax return, like the ID of the return for example.  It should also have the Tax Year as part of the message so that we only gather information relevant to this year.  There will be a lot more than this year's data in some of these systems.  We may also need that to support late returns in the future.

##### Simple Example Message (assuming use of message versions in DF)
```
{
  Tin: 123456789
  OtherInformation: kjsjdfjsdf // don't add that... this is a place holder because we don't know.
  TaxYear: 2024
  ReturnId: 2423bf16-abbf-4b4a-810a-d039cd27c3a0
 }
```

#### Layout

We don't know the eventual number of systems we will have to integrate with, and the system should be set up with growth in mind.  The base structure is a spoke-hub, with the hub being a spooler of information and the spokes being specific interfaces to internal IRS systems.  When an input message comes in the hub provides all of its spokes with a query information unit that every spoke will need to perform its lookups, likely this will start as only a tin and tax year, but it may expand later.

##### Example QueryInformation 
```
{
  Tin: 123456789
  TaxYear: 2024
}
```
	
Each spoke will be given an interface type and will be added to the available DI systems via configuration. On application start we will read in the configuration and only instantiate DI modules (the spokes) that are requested. 

##### Example DataImportModuleInterface 
```
public interface DataImportModule {
  UserData Query(QueryInformation information);
}
```
	
For the first year, all of the calls in the modules should be subject to a timeout of 5 (configurable) seconds.  This is because we don't know how long some of these calls will take (in cases where they don't have information and generally), and we don't want to stall the user waiting for data.  We shouldn't cancel the call itself, but should rather send back what we have from the spooler, with the idea that we can send an update when we get it back.  This implies that the timeout is in the spooler, and the spooler keeps a record of previous calls for some length of time before disposing of them.  For the first pass most of the DI modules will perform rest calls to external systems.  When they receive information back from their system they should ETL and categorize that information into some basic concepts, rather than leaking where the data came from (n.b. it might one day matter where the data came from, but we won't worry about it for this year).  The below example is what the object may look like.

#### Example UserData 
```
public class UserData {
    UUID TaxReturnId { get; set; }
    // this could be useful for negotiating conflicts if a precedence can be established.
    // DataImport for the Hub, otherwise the name of the system the data came from (totally optional)
    String SystemId { get; set; }
    // 1 for DI modules, aggregated for the Spooler (hub).  If this equals
    // the number of configured systems we are done and should send.
    int SystemDataCount {get; set; }
    // biographical information includes name information, dependents, spouse data 
    // anything relating to a human
    Biographical BiographicalInfo { get; set; }
    // PreviousReturnData includes information about last year's return
    // this information will be very valuable, but some things will not match
    // this year.  It is helpful to have these separated out.
    PreviousReturnData PreviousReturn { get; set; }
    // Information returns contains collections of the various types of IRs
    // that we support.  These are general categories like 1099 and W2, not like
    // the types themselves.  These supported types should be configurable.
    InformationReturns InformationReturns { get; set; }
    // All non-supported IRs should go in here.
    // We should assume that if anything makes it into here that 
    // Direct File isn't the correct choice for the user and they should
    // be informed of that fact.  This could be things like K1s or advanced
    // cases that we don't support.
    // These could just be the names of the forms themselves (like we don't
    // have to map the form itself)
    OtherTypes OtherInformationReturns { get; set; }
}
```

The above example implies several things:
1) This makes a pretty reasonable interface to the Backend app.  It contains all of the information required and is in a pretty usable form.
1) There are cases we don't support, and we have to reflect that.  It will be nice for the user to be kicked out before they waste a bunch of time.
1) Each of these classes will need a method to merge information together or be collections.  It makes the most sense to do a best guess merge for conflicting information.  There are a few reasons for this, namely that we are offering information that needs to be validated by the user and displaying multiple sets of information to a user will be very difficult/confusing.
1) Last year's return is categorically different than IR information pertaining to this year
1) We will have to merge together multiple UserData to get to a single UserData that will be passed to the backend

With the DI modules generally covered (they have an interface, they make a rest call, they can be configured, they all send back a version of the same object), the focus now turns to the hub, which is just going to spool this data and reply back on a queue.  When the spooler (the hub) receives a request it will kick off all the configured DI modules and start a timeout timer.  It will store in memory the TaxReturnId associated with the UserData that will be used to store that user's data.  As the calls come back (assuming they are done async here) they will have the TaxReturnId property that will allow them to be correlated with the correct UserData.  A call will be made to the mainUserData.merge(UserData data) that will merge current and new UserDatas together (follow general rules of encapsulation).  If the timeout timer goes off the spooler will enqueue a message on an SQS queue returning the current state of data to the backend, but it will not remove the key value pair from the in memory collection unless all of the systems have returned.  If all of the systems have returned (described in the above example) then enqueue the message.  The user data should either be put to a distributed cache and linked in the enqueued message, or just put in the enqueued message depending on how big these UserData objects become.

##### After timeout:
We may have valuable information come in after the configured timeout.  We don't want to lose that data, and as such we shouldn't remove a user's data from memory until all systems have returned.  We should enqueue a message each time we receive new UserData after the timeout.  The UserData class should contain its own merge logic and should be made available to all projects (meaning it should be in our library).  The backend can decide what to do with these updates.

#### Summary
DI Modules are interfaced pieces that talk to external systems.  They store their information in UserData objects that can be merged together.  DI Modules are configured to be running or not.  The Spooler is the thing that receives messages and kicks off DI Modules.  It also tracks all of its current TaxReturnIds and the data returned from the DI Modules.  When the timeout timer goes off or all DI Modules return the Spooler will enqueue a completed message.  If more data comes in after the timeout, more messages will be enqueued.

n.b. This pattern could be used in either a precaching or on demand system.


## Rationale

There are a few ways one could solve this problem.  For example, each DI Module could be its own microservice.  This would be more in line with a general microservice architecture.  We would still require some spooling agent to take all their information and be responsible for merging it.  The main reason we don't follow this pattern is that we get very little benefit for the trouble.  We would have more waiting, more messaging overhead, and more potential for lost data without any commensurate gain.  If the number of these systems grows beyond a certain level it may become valuable to reconsider this position (or if the complexity of the system grows beyond this basic concept).  The simplest and fastest (at this scale) approach is to create one small application that handles all of these, and runs its own child jobs in the form of the DI modules.  We will know if something fails, when and why, and be able to perform retries if necessary without having to do a bunch of messaging stuff to get it to work.  This also simplifies deployment down to a single app.  It uses way less (AWS) resources this way.

## Rejected Concepts

#### Microservice
In general, applications should do one thing and the boundary of an application should not be expanded beyond this purview.  We have here a well defined application boundary: a system that acts as an interface between the backend api (or any listener) and internal IRS systems for the purposes of gathering relevant user data.  We could further split this into a set of applications that gather information and an application that performs the spooling.  When each DI system finishes it would raise an event, and the spooler app would gather the data from the distributed cache, merge it, and write it back.  Philosophically this works, but it adds a lot of failure points for very little gain at our current scale and set up.  In the future this may be a very useful thing to do.  We could for example house these applications near their supporting app (like an TKTK DI service that sits near the TKTK service in the on prem world and fetches) which would increase our speed and could get us faster information about those systems if we can integrate deeper with them.

##### Failures in the Microservice system
The main failure point is the problem of messaging.  All messaging across a network is subject to failures.  The more messages we have to send the more chances for these failures to occur.  We should get some benefit for the failure, like higher scale or ease of development and onboarding but with only 5 or so of these systems and with such a simple pattern we aren't going to gain anything.  Our throughput will not likely come from our own applications but rather the applications we rely on.

We are also relying on our distributed cache to stay up throughout the operation.  We can handle the timeout on the requesting (backend api) app, and we can continue to count how many returns we have.  What would happen if our distributed cache failed though?  How would we know what we lost, if we lost anything?  No individual pod would (or could really without introducing a P2P communication mesh, rumor/whispers protocol, or something really out of pocket with the queues) be managing the job in the microservice system and so if there were failures they would be harder to track and propagate.  We don't yet know all of the failure cases, so it will be good to have these operations tightly managed by the spooler in the first year.


#### Backend API does it
The backend API is already responsible for a lot.  This is also an asynchronous process that may take a bit of time.  The complexity of the backend API is already hard enough to track, we should avoid adding discrete systems to it if for no other reason than so we can continue to reason about it.  It is 2 less potential failure points than the above suggestion, but it comes with a substantial reduction in backend api complexity, memory use, and the ability to eventually turn this into a precaching system if we desire (which would be awkward if we were standing up backend api apps for that).

#### Linear Flow/Non-Spoke-Hub System
This system has about 5 very similar operations that easily slot into a spoke-hub system.  Why fight against the obvious pattern?  If this was done linearly it might be supportable for the first year, but it would be messy.  It would also be much slower as each operation would have to be done in sequence.  That would give you an automatic precedence order, which is a nice feature.  This system design would not allow for growth in the future, good code reuse, or general supportability

## Assumptions

- Messaging systems occasionally lose messages: this is true, and it is underpinning at least some of the claims above.
- Having the per tax return system checks centrally managed is desired: My belief here is that we don't know all of the error cases and it will be easier for us to see them in a single application and create tests that exercise these failure conditions.  There is a world in which that isn't necessary, but I think it has some solid side effects.
- Standing up more pods is annoying and not worth it: we have already updated our CDRP and docs with a single service doing this.  We probably could update them but I don't see the benefit yet.  I would like to hear a solid reason why breaking this into multiple applications is worthwhile.
- Merging is a wise idea: there is a world in which we just want to dump everything we know rather than doing a best guess merge.  My view is that inundating the backend (and maybe the client/user) with this information isn't a useful thing to do.  We want the user to check this information anyways.  We aren't making any promises about the correctness!
- The bottleneck we will face is the other systems and not our system: If the other system is the bottle neck then it doesn't make sense to stand up a bunch of end point hitting services that just return data from that service.  If that isn't true, if we are the problem, then it makes sense to have as many services to hit that end point as we can make use of.  It could be as many as (made up number ahead) 50:1 DI services to spoolers in that case.  It is reasonable to assume that the other systems will be the problem in this flow because where would our bottleneck come from?  We will stand as many of our services up as needed but the ratio of end point hitters to spoolers will always remain constant (1:1 per type of DI service and spooler).

## Constraints
- This is for our current scale and complexity.  These trade-offs are different at higher scales.
- This is for an assumed <20 system integrations


## Status
Pending

## Consequences
- We may hit a point where, like let's say 25 services where this pattern becomes cumbersome.  It doesn't make sense to have so many calls on one system.  The number of integrated systems decreases the total available load per system by some percentage. At some level we will want to split out the DI modules into microservices, but we shouldn't do that until it makes sense.




