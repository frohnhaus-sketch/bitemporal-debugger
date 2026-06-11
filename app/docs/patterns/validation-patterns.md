# Validation Patterns

## Purpose

This document defines recurring validation patterns used to assess historical data models, historized dimensions, snapshot facts, temporal joins and historical reporting products.

The goal is to provide a reusable validation framework for:

* Historical Data Engineering Toolkit
* Target Table Validation
* Historical Modeling Advisor
* Model Review
* Automated Validation Rules

Unlike historical-modeling-patterns.md, which focuses on architectural problems, this document focuses on how those problems can be detected.

---

# Validation Categories

## Structural Validation

Checks whether the required historical structure exists.

Examples:

* Required columns exist
* Historical keys exist
* Validity intervals exist
* Snapshot keys exist

---

## Historical Consistency Validation

Checks whether historical timelines are internally consistent.

Examples:

* Overlaps
* Gaps
* Invalid intervals

---

## Temporal Join Validation

Checks whether historical relationships can be resolved correctly.

Examples:

* Missing matches
* Multiple matches
* Ambiguous joins

---

## Reporting Validation

Checks whether reporting outputs are reproducible and complete.

Examples:

* Snapshot reproducibility
* Dimension coverage
* Reporting completeness

---

# Validation Pattern 01 — Historical Coverage Gap

## Description

Required historical coverage is missing.

## Example

Contract

```text
01.01 → 31.12
```

Customer

```text
01.03 → 31.12
```

## Detection

Identify intervals where required source history does not exist.

## Risks

* Missing attributes
* Missing joins
* Incomplete reporting

## Severity

Medium

## Related Pattern

Dimension Completion

---

# Validation Pattern 02 — Historical Overlap

## Description

Multiple records are active simultaneously when they should be mutually exclusive.

## Detection

```text
valid_from < other.valid_to
AND
other.valid_from < valid_to
```

## Risks

* Ambiguous reporting
* Duplicate facts
* Nondeterministic joins

## Severity

High

## Related Pattern

State Modeling

---

# Validation Pattern 03 — Historical Match Ambiguity

## Description

Multiple records satisfy temporal join conditions.

## Detection

```text
Join produces > 1 valid match
```

## Risks

* Duplicate reporting rows
* Fact inflation
* Incorrect aggregations

## Severity

High

## Related Pattern

Historical Match Ambiguity

---

# Validation Pattern 04 — Missing Historical Match

## Description

A historical join cannot find a valid match.

## Detection

```text
Join produces 0 matches
```

## Risks

* Missing attributes
* Missing reporting records

## Severity

Medium

## Related Pattern

Dimension Completion

---

# Validation Pattern 05 — Snapshot Reproducibility Risk

## Description

Historical reports may change when rerun.

## Detection Signals

* Missing snapshot grain
* Missing reporting date
* Missing visibility timeline
* Reconstructed history without versioning

## Risks

* Snapshot drift
* Audit failure
* Reporting inconsistencies

## Severity

High

## Related Pattern

Snapshot Reproducibility

---

# Validation Pattern 06 — Dimension Completion Risk

## Description

Dimension history does not fully cover fact history.

## Detection

```text
Fact interval not fully covered
by dimension interval
```

## Risks

* Missing attributes
* Incomplete reporting
* Incorrect segmentation

## Severity

High

## Related Pattern

Dimension Completion

---

# Validation Pattern 07 — Late Arriving Dimension Risk

## Description

Facts exist before the required dimension history becomes available.

## Detection Signals

* Fact starts before dimension
* Missing historical dimension periods
* Synthetic backfill logic detected

## Risks

* Missing surrogate keys
* Reporting instability
* Incomplete dimensions

## Severity

Medium

## Related Pattern

Dimension Completion

---

# Validation Pattern 08 — Temporal Conformance Risk

## Description

Multiple source systems disagree on history.

## Detection Signals

* Conflicting timelines
* Different effective dates
* Identity mismatches

## Risks

* Multiple versions of truth
* Inconsistent reporting

## Severity

Medium

## Related Pattern

Temporal Conformance

---

# Validation Pattern 09 — Visibility Lag

## Description

The same business event becomes visible at different times across systems.

## Detection

```text
visible_from differs significantly
between systems
```

## Risks

* Reporting inconsistencies
* Data freshness issues

## Severity

Low

## Related Pattern

Temporal Conformance

---

# Validation Pattern 10 — Duplicate Snapshot Records

## Description

Multiple records exist for the same reporting grain.

## Detection

```text
business_key
+
snapshot_date

appears multiple times
```

## Risks

* Double counting
* Reporting inflation

## Severity

High

## Related Pattern

Snapshot Fact Construction

---

# Validation Pattern 11 — Event Alignment Failure

## Description

An event cannot be mapped to exactly one state.

## Detection

```text
Event → 0 matches
Event → >1 matches
```

## Risks

* Incorrect event attribution
* Reporting inconsistencies

## Severity

High

## Related Pattern

State ↔ Event Alignment

---

# Validation Pattern 12 — Identity Resolution Failure

## Description

Multiple identifiers represent the same business entity.

## Detection Signals

* Duplicate business entities
* Conflicting surrogate keys
* Multiple active identities

## Risks

* Double counting
* Fragmented history

## Severity

Medium

## Related Pattern

Identity Resolution

---

# Validation Pattern 13 — Historical Backfill Risk

## Description

Reconstructed history may differ from original history.

## Detection Signals

* Historical reload
* CDC replay
* Synthetic reconstruction

## Risks

* Historical inconsistencies
* Lost history
* Rebuild differences

## Severity

Medium

## Related Pattern

Historical Backfill

---

# Validation Pattern 14 — Event Ordering Risk

## Description

Events are not ordered consistently.

## Detection

```text
event_timestamp decreases
within the same entity
```

## Risks

* Invalid state reconstruction
* Incorrect reporting

## Severity

Medium

## Related Pattern

Event Modeling

---

# Validation Pattern 15 — State Explosion Risk

## Description

Technical history contains excessive state fragmentation.

## Detection Signals

* Very short intervals
* Excessive state count
* Frequent transitions

## Risks

* Complex reporting
* Performance degradation
* Difficult explainability

## Severity

Low

## Related Pattern

State Reduction

---

# Long-Term Vision

Historical modeling quality can be assessed through a relatively small set of recurring validation patterns.

These validation patterns should become reusable building blocks for:

* Advisor recommendations
* Notebook reviews
* Target table validation
* Automated historical quality scoring
* Explainable historical model assessments
