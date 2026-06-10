# Community Validation

## Purpose

This document captures evidence from public data engineering communities that recurring historical modeling problems appear across organizations, industries and technology stacks.

The goal is not to define new modeling patterns.

The goal is to validate that the patterns described in:

* historical-modeling-patterns.md
* implementation-temporal-modeling-patterns.md
* validation-patterns.md

represent real and recurring industry problems.

This document serves as market validation for the Historical Modeling Workbench.

---

# Validation Method

Patterns are considered validated when they repeatedly appear in:

* dbt Community
* Data Engineering forums
* Analytics Engineering discussions
* Data Warehouse projects
* Historical reporting implementations

The focus is not on individual technologies.

The focus is on recurring historical modeling challenges.

---

# Snapshot Reproducibility

## Observed Community Discussions

Examples include:

* Recreate SCD2 tables from snapshots
* Preserve query results at a point in time
* Historical report recreation
* Snapshot rebuild strategies
* Snapshot historical data
* dbt bitemporality discussions

## Common Questions

* Can I reproduce a report from last year?
* How do I rebuild historical snapshots?
* How do I rerun a historical reporting process?
* How do I backfill missing periods?
* How do I prevent snapshot drift?

## Recurring Problems

* Snapshot drift
* Non-reproducible reporting
* Historical rebuild complexity
* Missing reporting snapshots

## Related Pattern

Snapshot Reproducibility

## Workbench Coverage

* Advisor
* Model Review
* Target Validation

## Assessment

Very common industry problem.

Priority: HIGH

---

# Dimension Completion

## Observed Community Discussions

Examples include:

* Late arriving dimensions
* Inferred member dimensions
* Missing foreign keys
* Missing dimension coverage
* Multiple SCD2 dimensions

## Common Questions

* What happens when the fact arrives before the dimension?
* How should missing dimensions be handled?
* How should surrogate keys be generated?
* How should historical gaps be filled?

## Recurring Problems

* Missing joins
* Missing dimension records
* Incomplete reporting
* Fact rows without dimensions

## Related Pattern

Dimension Completion

## Workbench Coverage

* Advisor
* Target Validation

## Assessment

Very common industry problem.

Priority: HIGH

---

# Historical Match Ambiguity

## Observed Community Discussions

Examples include:

* Multiple SCD2 joins
* Snapshot joins
* Temporal joins between dimensions
* Overlapping historical records

## Common Questions

* Which dimension version should be used?
* Why do temporal joins duplicate rows?
* How do I prevent join explosions?

## Recurring Problems

* Duplicate reporting rows
* Ambiguous joins
* Multiple valid matches
* Fact inflation

## Related Pattern

Historical Match Ambiguity

## Workbench Coverage

* Target Validation
* Model Review

## Assessment

Very common industry problem.

Priority: HIGH

---

# Historical Coverage Gaps

## Observed Community Discussions

Examples include:

* Missing dimension records
* Missing reporting periods
* Incomplete historical loads
* Historical backfills

## Common Questions

* Why do some periods have no results?
* Why are attributes missing?
* How do I complete historical coverage?

## Recurring Problems

* Missing joins
* Missing attributes
* Incomplete reporting timelines

## Related Pattern

Historical Coverage Gap

## Workbench Coverage

* Target Validation

## Assessment

Very common industry problem.

Priority: HIGH

---

# Historical Backfill

## Observed Community Discussions

Examples include:

* Historical reconstruction
* CDC replay
* Snapshot backfills
* Historical reloads

## Common Questions

* How do I recreate history?
* Can I reconstruct missing periods?
* How do I backfill historical snapshots?

## Recurring Problems

* Missing historical periods
* Rebuild complexity
* Inconsistent reconstruction

## Related Pattern

Historical Backfill

## Workbench Coverage

* Advisor
* Model Review

## Assessment

Common industry problem.

Priority: HIGH

---

# Historical Correction

## Observed Community Discussions

Examples include:

* Bitemporality
* Retroactive corrections
* Audit reporting
* Historical restatements

## Common Questions

* What did we know at the time?
* How do I preserve corrections?
* How do I rebuild historical truth?

## Recurring Problems

* Lost correction history
* Audit failures
* Non-reproducible reports

## Related Pattern

Historical Correction

## Workbench Coverage

* Advisor
* Model Review

## Assessment

Common industry problem.

Priority: HIGH

---

# Temporal Conformance

## Observed Community Discussions

Examples include:

* Multi-system reporting
* Identity reconciliation
* Customer integration
* Cross-system timelines

## Common Questions

* Which system is authoritative?
* How should conflicting histories be resolved?
* How do I align timelines?

## Recurring Problems

* Multiple truths
* Timeline drift
* Identity mismatches

## Related Pattern

Temporal Conformance

## Workbench Coverage

* Advisor
* Model Review

## Assessment

Common industry problem.

Priority: MEDIUM

---

# Identity Resolution

## Observed Community Discussions

Examples include:

* Customer merges
* Surrogate key discussions
* Multiple identifiers
* Cross-system integration

## Common Questions

* How should identities be unified?
* Which identifier should become the master key?
* How should history survive migrations?

## Recurring Problems

* Duplicate reporting
* Fragmented history
* Broken lineage

## Related Pattern

Identity Resolution

## Workbench Coverage

* Advisor
* Model Review

## Assessment

Common industry problem.

Priority: MEDIUM

---

# Event Prioritization

## Observed Community Discussions

Examples include:

* Event streams
* CDC events
* Status transitions
* Workflow histories

## Common Questions

* Which event should win?
* How should competing events be interpreted?
* Which event represents the business outcome?

## Recurring Problems

* Event explosion
* Difficult explainability
* Complex business logic

## Related Pattern

Event Prioritization

## Workbench Coverage

* Model Review

## Assessment

Common industry problem.

Priority: MEDIUM

---

# State Reduction

## Observed Community Discussions

Examples include:

* Workflow simplification
* Status reduction
* Reporting state generation

## Common Questions

* How do I simplify technical histories?
* How do I build reporting-friendly states?

## Recurring Problems

* Excessive state counts
* Complex reporting logic
* Difficult maintenance

## Related Pattern

State Reduction

## Workbench Coverage

* Model Review

## Assessment

Common industry problem.

Priority: MEDIUM

---

# Snapshot Fact Construction

## Observed Community Discussions

Examples include:

* Snapshot facts
* Trend reporting
* Monthly reporting snapshots
* Point-in-time reporting

## Common Questions

* Should snapshots be materialized?
* Should reports be rebuilt dynamically?
* How should reporting dates be stored?

## Recurring Problems

* Snapshot drift
* Missing dimensions
* Duplicate facts

## Related Pattern

Snapshot Fact Construction

## Workbench Coverage

* Advisor
* Model Review
* Target Validation

## Assessment

Very common industry problem.

Priority: HIGH

---

# Key Research Conclusions

The majority of historical reporting discussions in the dbt community are not fundamentally about dbt.

They are about recurring historical modeling problems.

The same themes appear repeatedly:

* Snapshot reproducibility
* Dimension completion
* Historical joins
* Historical coverage
* Late arriving dimensions
* Temporal conformance
* Historical corrections
* Event prioritization

These problems appear regardless of:

* Database platform
* Cloud provider
* Data warehouse technology
* Modeling framework

This suggests that historical modeling itself is a reusable problem domain.

---

# Implications For Historical Modeling Workbench

The Workbench addresses three distinct questions:

## Advisor

What should I build?

Uses:

* historical-modeling-patterns.md

---

## Model Review

What did I build?

Uses:

* implementation-temporal-modeling-patterns.md

---

## Target Validation

Did I build it correctly?

Uses:

* validation-patterns.md

---

The community research indicates that all three questions occur repeatedly in real-world data engineering projects.

This provides evidence that the Historical Modeling Workbench is addressing genuine industry problems rather than project-specific implementation details.
