# Historical Validation Findings

## Purpose

This document defines the recurring validation findings used throughout the Historical Data Modeling Workbench.

The goal is to provide a reusable framework for evaluating:

* Historical Data Models
* Snapshot Fact Models
* Historized Dimensions
* Temporal Joins
* Historical Reporting Products

Validation findings are not modeling patterns.

A modeling pattern describes a solution.

A validation finding describes how a solution can fail.

---

# Validation Categories

## Timeline Integrity

Checks whether historical timelines are internally consistent.

Examples:

* Historical Overlap
* Historical Coverage Gap
* Invalid Intervals

---

## Historical Alignment

Checks whether historical relationships can be resolved correctly.

Examples:

* Missing Historical Match
* Historical Match Ambiguity
* Event Alignment Failure

---

## Reporting Reliability

Checks whether historical reporting outputs are reproducible and complete.

Examples:

* Snapshot Drift
* Duplicate Snapshot Records
* Reporting Coverage Gaps

---

## Historical Synchronization

Checks whether multiple systems describe the same business reality consistently.

Examples:

* Visibility Lag
* Historical Conformance Risk

---

## Historical Complexity

Checks whether historical models remain understandable and maintainable.

Examples:

* State Explosion Risk
* Event Ordering Risk

---

# Historical Coverage Gap

## Category

Timeline Integrity

## Description

A required historical period is not covered.

## Typical Symptoms

* Missing dimension history
* Missing source records
* Missing reporting periods

## Risks

* Missing attributes
* Missing joins
* Incomplete reporting

## Related Patterns

* Dimension Completion
* Relationship History

---

# Historical Overlap

## Category

Timeline Integrity

## Description

Multiple historical records are active simultaneously when they should be mutually exclusive.

## Typical Symptoms

* Overlapping SCD2 rows
* Duplicate active states
* Conflicting histories

## Risks

* Ambiguous reporting
* Double counting
* Nondeterministic joins

## Related Patterns

* State Modeling

---

# Missing Historical Match

## Category

Historical Alignment

## Description

A historical join produces no valid match.

## Typical Symptoms

* Fact without dimension
* Unresolved relationship
* Missing historical context

## Risks

* Missing attributes
* Incomplete reporting
* Broken historical lineage

## Related Patterns

* State-to-State Alignment
* Dimension Completion

---

# Historical Match Ambiguity

## Category

Historical Alignment

## Description

A historical join produces multiple valid matches.

## Typical Symptoms

* Two active dimension rows
* Multiple valid relationship states
* Duplicate join candidates

## Risks

* Fact inflation
* Duplicate reporting rows
* Nondeterministic results

## Related Patterns

* State-to-State Alignment

---

# Event Alignment Failure

## Category

Historical Alignment

## Description

An event cannot be mapped to exactly one historical state.

## Typical Symptoms

* Event → no state
* Event → multiple states

## Risks

* Incorrect attribution
* Invalid historical reporting

## Related Patterns

* State-to-Event Alignment

---

# Snapshot Drift

## Category

Reporting Reliability

## Description

A historical report changes when rerun.

## Typical Symptoms

* Month-end reports differ
* Historical KPIs change unexpectedly
* Reconstructed history differs from original outputs

## Risks

* Audit failure
* Loss of trust
* Irreproducible reporting

## Related Patterns

* Snapshot Reproducibility
* As-Known Reporting

---

# Duplicate Snapshot Records

## Category

Reporting Reliability

## Description

Multiple records exist for the same reporting grain.

## Typical Symptoms

```text
business_key
+
snapshot_date

appears more than once
```

## Risks

* Double counting
* Incorrect aggregations

## Related Patterns

* Snapshot Fact Modeling

---

# Reporting Coverage Gap

## Category

Reporting Reliability

## Description

A reporting product cannot answer the required historical question.

## Typical Symptoms

* Missing dimensions
* Missing history
* Missing reporting grain

## Risks

* Incomplete analytics
* Incorrect business decisions

## Related Patterns

* Snapshot Fact Modeling
* Dimension Completion

---

# Visibility Lag

## Category

Historical Synchronization

## Description

Information becomes visible significantly later than it becomes valid.

## Typical Symptoms

* Delayed source updates
* Late-arriving records
* Different visibility dates across systems

## Risks

* Inconsistent reporting
* Data freshness concerns
* Snapshot drift

## Related Patterns

* Bitemporal Modeling
* Historical Conformance

---

# Historical Conformance Risk

## Category

Historical Synchronization

## Description

Multiple systems describe the same business reality differently.

## Typical Symptoms

* Conflicting timelines
* Different effective dates
* Different historical interpretations

## Risks

* Multiple versions of truth
* Reconciliation effort
* Reporting inconsistencies

## Related Patterns

* Historical Conformance
* Identity Resolution

---

# Identity Resolution Failure

## Category

Historical Synchronization

## Description

Multiple identifiers represent the same business entity.

## Typical Symptoms

* Duplicate customers
* Duplicate contracts
* Conflicting identities

## Risks

* Double counting
* Fragmented history

## Related Patterns

* Identity Resolution

---

# Event Ordering Risk

## Category

Historical Complexity

## Description

Events are not ordered consistently.

## Typical Symptoms

* Out-of-order events
* Retroactive events
* Timestamp inconsistencies

## Risks

* Invalid state reconstruction
* Incorrect reporting

## Related Patterns

* Event Modeling
* Event Prioritization

---

# State Explosion Risk

## Category

Historical Complexity

## Description

Technical history contains excessive state fragmentation.

## Typical Symptoms

* Thousands of tiny intervals
* Excessive state transitions
* Highly fragmented timelines

## Risks

* Difficult reporting
* Poor explainability
* Performance degradation

## Related Patterns

* State Reduction

---

# Historical Backfill Risk

## Category

Historical Complexity

## Description

Reconstructed history may differ from originally observed history.

## Typical Symptoms

* Historical reloads
* CDC replay
* Rebuilt dimensions
* Migration projects

## Risks

* Historical inconsistencies
* Snapshot drift
* Audit concerns

## Related Patterns

* Historical Backfill
* Historical Correction

---

# Long-Term Vision

Most historical data quality problems can be described using a relatively small set of recurring validation findings.

These findings provide the common language used by:

* Advisor
* Model Review
* Target Table Validation
* Two Source Validation
* Learn Pages
* Historical Data Modeling Research

The objective is not merely to detect technical issues, but to explain how historical models behave and where they are likely to fail.