# Historical Modeling Glossary

## Purpose

This glossary defines the terminology used throughout the Historical Data Modeling Workbench.

Each term is classified as one of:

* Core Pattern
* Implementation Pattern
* Validation Pattern
* Historical Concept

This prevents multiple names from being used for the same underlying problem.

---

# State

## Classification

Historical Concept

## Definition

A representation of a business entity over a time interval.

Examples:

* Customer
* Contract
* Product

Related Core Pattern:

* State Modeling

---

# Event

## Classification

Historical Concept

## Definition

A business occurrence at a specific point in time.

Examples:

* Payment Received
* Claim Filed
* Contract Mutation

Related Core Pattern:

* Event Modeling

---

# SCD1

## Classification

Implementation Pattern

## Definition

Only the latest version of a record is retained.

Related Core Pattern:

* State Modeling

---

# SCD2

## Classification

Implementation Pattern

## Definition

Historical versions of a record are retained using validity intervals.

Related Core Patterns:

* State Modeling
* State Alignment

---

# Bitemporal Table

## Classification

Implementation Pattern

## Definition

Stores both business-effective time and system-visible time.

Related Core Pattern:

* Bitemporal Modeling

---

# Snapshot Fact

## Classification

Implementation Pattern

## Definition

A fact table designed to support reproducible reporting at a specific reporting date.

Related Core Pattern:

* Snapshot Reproducibility

---

# As-Of Query

## Classification

Implementation Pattern

## Definition

A query that reconstructs historical state at a specific point in time.

Related Core Pattern:

* Snapshot Reproducibility

---

# Historical Coverage Gap

## Classification

Validation Pattern

## Definition

A required historical period is not covered.

Related Core Pattern:

* Dimension Completion

---

# Missing Historical Match

## Classification

Validation Pattern

## Definition

A historical join produces zero valid matches.

Related Core Patterns:

* State Alignment
* Dimension Completion

---

# Historical Match Ambiguity

## Classification

Validation Pattern

## Definition

A historical join produces more than one valid match.

Related Core Pattern:

* State Alignment

---

# Historical Overlap

## Classification

Validation Pattern

## Definition

Multiple states are active simultaneously when they should be mutually exclusive.

Related Core Pattern:

* State Modeling

---

# Late Arriving Dimension

## Classification

Historical Concept

## Definition

A dimension record becomes available after related facts already exist.

Related Core Pattern:

* Dimension Completion

---

# Inferred Member

## Classification

Implementation Pattern

## Definition

A placeholder dimension record created before the real dimension data becomes available.

Related Core Pattern:

* Dimension Completion

---

# Snapshot Drift

## Classification

Validation Pattern

## Definition

A historical report changes when rerun.

Related Core Pattern:

* Snapshot Reproducibility

---

# Historical Backfill

## Classification

Implementation Pattern

## Definition

Historical records are reconstructed after the fact.

Related Core Patterns:

* Snapshot Reproducibility
* Dimension Completion

---

# Historical Correction

## Classification

Core Pattern

## Definition

Previously recorded history is corrected retroactively.

Related Core Pattern:

* Bitemporal Modeling

---

# Temporal Conformance

## Classification

Core Pattern

## Definition

Multiple systems describe the same entity using different historical timelines.

Related Core Pattern:

* Temporal Conformance

---

# Identity Resolution

## Classification

Core Pattern

## Definition

Multiple identifiers represent the same business entity.

Examples:

* Customer Merge
* Account Merge
* Contract Migration

Related Core Pattern:

* Identity Resolution

---

# Winner Selection

## Classification

Core Pattern

## Definition

Multiple candidates exist and one must be selected.

Related Core Pattern:

* Winner Selection

---

# Event Prioritization

## Classification

Core Pattern

## Definition

Multiple events compete to represent a business outcome.

Related Core Pattern:

* Event Prioritization

---

# State Reduction

## Classification

Core Pattern

## Definition

Technical histories are reduced to reporting-relevant states.

Related Core Pattern:

* State Reduction

---

# Rectangle Decomposition

## Classification

Implementation Pattern

## Definition

Multiple temporal attributes are projected onto a common timeline.

Alternative Name:

* Temporal Pivot

Related Core Pattern:

* Temporal Pivot

---

# Canonical Naming Rule

Whenever multiple terms describe the same underlying problem, the Core Pattern name should be preferred.

Examples:

```text
Late Arriving Dimension
↓
Dimension Completion

Missing Historical Match
↓
State Alignment

Snapshot Drift
↓
Snapshot Reproducibility

Rectangle Decomposition
↓
Temporal Pivot
```

The Core Pattern is the canonical term used by the Advisor, Model Review and Validation workflows.
