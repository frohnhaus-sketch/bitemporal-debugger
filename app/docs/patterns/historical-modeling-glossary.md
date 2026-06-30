# Historical Data Modeling Glossary

## Purpose

This glossary defines the terminology used throughout the Historical Data Modeling Workbench.

The goal is to establish a consistent vocabulary across:

* Advisor recommendations
* Model Reviews
* Target Validation
* Two Source Validation
* Pattern Catalog
* Learn Pages

Each term is classified as one of:

* Foundational Concept
* Modeling Pattern
* Reporting Pattern
* Engineering Pattern
* Validation Finding
* Implementation Technique

---

# State

## Classification

Foundational Concept

## Definition

A representation of a business entity over a time interval.

Examples:

* Customer
* Contract
* Policy
* Product

Related Pattern:

* State Modeling

---

# Event

## Classification

Foundational Concept

## Definition

A business occurrence at a specific point in time.

Examples:

* Payment Received
* Claim Filed
* Status Change
* Contract Mutation

Related Pattern:

* Event Modeling

---

# Valid Time

## Classification

Foundational Concept

## Definition

The period during which a business fact is true in reality.

Example:

```text
Customer lived in Zurich
from 2024-01-01
to 2024-06-30
```

Related Pattern:

* State Modeling

---

# Visible Time

## Classification

Foundational Concept

## Definition

The period during which information is known or visible to a system.

Related Pattern:

* Bitemporal Modeling

---

# SCD1

## Classification

Implementation Technique

## Definition

Only the latest version of a record is retained.

Related Pattern:

* State Modeling

---

# SCD2

## Classification

Implementation Technique

## Definition

Historical versions of a record are retained using validity intervals.

Related Patterns:

* State Modeling
* State-to-State Alignment

---

# Bitemporal Table

## Classification

Implementation Technique

## Definition

Stores both valid time and visible time.

Related Pattern:

* Bitemporal Modeling

---

# Temporal Join

## Classification

Implementation Technique

## Definition

A join that considers historical validity periods when matching records.

Related Patterns:

* State-to-State Alignment
* State-to-Event Alignment

---

# Snapshot Fact

## Classification

Implementation Technique

## Definition

A fact table designed to support reporting at predefined reporting dates.

Related Pattern:

* Snapshot Fact Modeling

---

# As-Of Query

## Classification

Implementation Technique

## Definition

A query that reconstructs historical state at a specific point in time.

Related Patterns:

* Snapshot Fact Modeling
* Snapshot Reproducibility

---

# Dimension Completion

## Classification

Modeling Pattern

## Definition

Dimension history does not fully cover the required reporting timeline.

Common Symptoms:

* Facts without dimensions
* Missing historical attributes
* Early-arriving facts
* Late-arriving dimensions

---

# Relationship History

## Classification

Modeling Pattern

## Definition

Relationships between entities change over time.

Examples:

* Customer ↔ Segment
* Employee ↔ Manager
* Policy ↔ Broker

---

# Identity Resolution

## Classification

Modeling Pattern

## Definition

Multiple identifiers represent the same business entity.

Examples:

* Customer Merge
* Account Migration
* Contract Migration

---

# Historical Conformance

## Classification

Modeling Pattern

## Definition

Multiple systems describe the same business reality using different historical timelines.

Examples:

* CRM + ERP
* Billing + Policy
* Internal + Partner System

---

# Historical Correction

## Classification

Engineering Pattern

## Definition

Previously recorded history is corrected retroactively.

Examples:

* Data quality fixes
* Regulatory corrections
* Source restatements

Related Pattern:

* Bitemporal Modeling

---

# Historical Backfill

## Classification

Engineering Pattern

## Definition

Historical records become available after the original processing period.

Examples:

* Late-arriving data
* Migration loads
* Historical reconstruction

---

# Event Prioritization

## Classification

Engineering Pattern

## Definition

Multiple events compete to represent the same business outcome.

Goal:

Select the reporting-relevant event.

---

# State Reduction

## Classification

Engineering Pattern

## Definition

Large technical histories are condensed into reporting-relevant business states.

Goal:

Reduce reporting complexity.

---

# Event-to-State Projection

## Classification

Engineering Pattern

## Definition

Events are transformed into historical state intervals.

Examples:

* Workflow Events → Workflow State
* Order Events → Order State

---

# Rectangle Decomposition

## Classification

Engineering Pattern

## Definition

Multiple temporal attributes are projected onto a common timeline.

Alternative Names:

* Temporal Projection
* Temporal Pivot

Goal:

Create complete reporting intervals.

---

# Snapshot Reproducibility

## Classification

Reporting Pattern

## Definition

A historical report should return the same result regardless of when it is rerun.

Core Question:

```text
Can I reproduce last month's report today?
```

---

# As-Known Reporting

## Classification

Reporting Pattern

## Definition

Reporting based on information that was known at a specific point in time.

Core Question:

```text
What did we know when the report was produced?
```

---

# Historical Coverage Gap

## Classification

Validation Finding

## Definition

A required historical period is not covered.

Common Causes:

* Missing dimension history
* Missing source records
* Incomplete backfills

Related Pattern:

* Dimension Completion

---

# Missing Historical Match

## Classification

Validation Finding

## Definition

A historical join produces zero valid matches.

Related Patterns:

* State-to-State Alignment
* Dimension Completion

---

# Historical Match Ambiguity

## Classification

Validation Finding

## Definition

A historical join produces multiple valid matches.

Related Pattern:

* State-to-State Alignment

---

# Historical Overlap

## Classification

Validation Finding

## Definition

Multiple historical states are active simultaneously when they should be mutually exclusive.

Related Pattern:

* State Modeling

---

# Visibility Lag

## Classification

Validation Finding

## Definition

Information becomes visible significantly later than it becomes valid.

Related Patterns:

* Bitemporal Modeling
* Snapshot Reproducibility

---

# Snapshot Drift

## Classification

Validation Finding

## Definition

A historical report changes when rerun.

Common Causes:

* Historical corrections
* Late-arriving data
* Missing visible-time tracking

Related Pattern:

* Snapshot Reproducibility

---

# Canonical Naming Rule

The Workbench prefers pattern names over implementation-specific terminology whenever possible.

Examples:

```text
Late Arriving Dimension
↓
Dimension Completion

Early Arriving Fact
↓
Dimension Completion

Missing Historical Match
↓
State-to-State Alignment

Snapshot Drift
↓
Snapshot Reproducibility

Temporal Pivot
↓
Rectangle Decomposition
```

The canonical names are used throughout the Advisor, Model Review, Learn Pages, Pattern Catalog, and Validation workflows.