# Bug Prioritization

The following is a draft of guidelines for prioritizing bugs and incident responses that arise during tax season. For the below, we expect releases to happen weekly.\
\
**Rank 0 (R0): Emergency Hotfix, needs to ship as soon as possible**

* You can't submit a tax return (as an individual or to a state) for \>1% of submissions
* Refund or amount due calculation is incorrect and we know taxpayers are being affected by the issue
* Security incident or PII is exposed
* Direct File is down or significantly degraded
* High traffic feature where functionality is broken or not available, and no workaround

\
**R1: Now, Showstopper fix for the next immediate release**

* High traffic functionality is broken - difficult or time consuming workaround
* Medium traffic functionality is broken for a smaller percentage of taxpayers (10 - 50%) with no workaround
* Submissions to states or MeF are blocked for \<1% of taxpayers
* Direct file performance is degraded (metric)
* Refund or amount due calculation would be incorrect but circumstances to trigger the issue are rare enough that production users are unlikely to be affected before scheduled release.

\
**R2: Next, fix for the scheduled release following the next immediate release**

* High value taxpayer experience improvements: Medium, high, to very high traffic feature has confusing functionality with a workaround
* Low traffic functionality is broken for a smaller percentage of taxpayers (10 - 50%)

\
**R3: Later this tax season**

* Usability feedback (via customer support or other sources): improves a medium traffic feature but there is a current workaround
* Low traffic functionality is broken for a smaller percentage of taxpayers (\<10%)

\
**R4: Consider for this tax season**

* Nice to have usability improvements, functionality not needed to perform daily work and is not time sensitive

\
**R5: backlog for future tax seasons**

* Unlikely to get to these: low impact improvements

## References

* Last year's guidelines
  * P0: emergency, merits a hotfix\
    P1: a **must**/show stopper for the next scheduled release\
    P2: a **should** for the next scheduled release\
    P3: a **must** for this tax season\
    P4: a **should** for this tax season\
    P5: backlog for future tax seasons
* Feedback from states
  * ability to submit a return is impacted (critical)
  * ability to accurately _calculate_ state taxes is impacted (high priority)
  * smooth user experience for TP when doing their state taxes (lower priority)
* Tax Logic Priority Scale
  * P0: Yesterday (needs to ship as soon as possible, probably an incident)
  * P1: Now (needs to be in the next regular release)
  * P2: Next (should be release after next)
  * P3: Later
  * P4: Before the end of filing season
  * P5: After filing season
* CfA user pain score calculator: https://files.codeforamerica.org/2022/11/29092445/Client-Pain-Score-User-Pain-Score.pdf
* Note: we chose Rank (R0) vs. Priority (P0) because there is a separate IRWorks priority that uses a different "P" scale
