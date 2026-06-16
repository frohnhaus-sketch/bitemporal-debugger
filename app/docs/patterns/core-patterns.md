# Core Historical Modeling Patterns

## Purpose

This document defines the canonical pattern taxonomy used throughout the Historical Data Engineering Toolkit.

Its purpose is to provide a small set of stable, reusable modeling patterns that describe the majority of historical reporting architectures.

All implementation patterns, validation patterns and community findings should ultimately map back to one of these core patterns.

---

# Pattern Hierarchy

```text
Core Patterns
↓
Implementation Patterns
↓
Validation Patterns
↓
Common Use Cases
```

Core patterns describe the problem.

Implementation patterns describe how the problem is solved.

Validation patterns describe how the solution can fail.

Common Use Cases demonstrates that the problem exists outside a specific project.

---

# Foundations

## 01 — State Modeling

### Description

Represents business entities that exist over a time interval.

Examples:

* Customer
* Contract
* Policy
* Product
* Vehicle

### Typical Goal

Describe what was true during a period of time.

### Related Validation Patterns

* Historical Overlap
* Invalid Intervals

---

## 02 — Event Modeling

### Description

Represents business occurrences at a specific point in time.

Examples:

* Payment Received
* Contract Mutation
* Claim Filed
* Status Change

### Typical Goal

Describe what happened.

### Related Validation Patterns

* Event Ordering Risk
* Duplicate Events

---

## 03 — Bitemporal Modeling

### Description

Separates business-effective time from system-visible time.

### Core Question

```text
What was true?

vs.

What did we believe was true at a specific point in time?
```

### Typical Goal

Support auditability and historical reconstruction.

### Related Validation Patterns

* Snapshot Reproducibility Risk
* Visibility Lag

---

# Alignment

## 04 — State Alignment

### Description

Historical states must be aligned across time.

Examples:

```text
Contract ↔ Customer

Customer ↔ Segment

Product ↔ Pricing
```

### Typical Goal

Create valid historical relationships.

### Related Validation Patterns

* Historical Match Ambiguity
* Missing Historical Match
* Historical Coverage Gap

---

## 05 — Historical Conformance

### Description

Multiple systems describe the same business reality using different historical timelines.

Examples:

```text
CRM + ERP

Policy System + Partner System

Sales System + Billing System
```

### Typical Goal

Create a unified historical truth.

### Related Validation Patterns

* Historical Conformance Risk
* Visibility Lag

---

# Resolution

## 06 — Winner Selection

### Description

Multiple valid candidates exist and one must be selected.

Examples:

```text
Preferred Address

Preferred Policyholder

Preferred Customer Record
```

### Typical Goal

Produce deterministic results.

### Related Validation Patterns

* Historical Match Ambiguity

---

## 07 — Event Prioritization

### Description

Multiple events compete to represent the same business outcome.

Examples:

```text
Workflow Events

Contract Mutations

Claim Status Events
```

### Typical Goal

Identify the reporting-relevant event.

### Related Validation Patterns

* Event Ordering Risk

---

## 08 — State Reduction

### Description

Large technical histories are condensed into reporting-relevant business states.

Examples:

```text
Workflow Simplification

Status Consolidation

Event Reduction
```

### Typical Goal

Reduce reporting complexity.

### Related Validation Patterns

* State Explosion Risk

---

# Dimensions

## 09 — Dimension Completion

### Description

Dimension history does not fully cover the required reporting timeline.

Examples:

```text
Fact starts before dimension.

Customer history starts after contract history.
```

### Typical Goal

Ensure complete historical coverage.

### Related Validation Patterns

* Historical Coverage Gap
* Late Arriving Dimension Risk
* Missing Historical Match

### Industry Evidence

One of the most common historical modeling problems.

---

## 10 — Relationship History

### Description

Relationships change over time.

Examples:

```text
Customer ↔ Segment

Employee ↔ Manager

Policy ↔ Broker
```

### Typical Goal

Preserve historical relationship changes.

### Related Validation Patterns

* Historical Coverage Gap

---

## 11 — Identity Resolution

### Description

Multiple identifiers represent the same business entity.

Examples:

```text
Customer Merge

Account Migration

Contract Migration
```

### Typical Goal

Create a consistent business identity.

### Related Validation Patterns

* Identity Resolution Failure

---

# Reporting

## 12 — Snapshot Reproducibility

### Description

Historical reports must return the same result regardless of when they are rerun.

### Typical Goal

Ensure reproducible reporting.

### Related Validation Patterns

* Snapshot Reproducibility Risk
* Duplicate Snapshot Records

### Industry Evidence

One of the most frequently discussed historical reporting challenges.

---

# Advanced

## 13 — Temporal Pivot

### Description

Multiple temporal attributes are projected onto a common timeline.

Also known as:

* Rectangle Decomposition
* Temporal Projection

### Examples

```text
Coverage Modeling

Risk Characteristics

Pricing Attributes
```

### Typical Goal

Create complete reporting timelines.

### Related Validation Patterns

* Historical Coverage Gap
* Duplicate Snapshot Records

---

# Long-Term Vision

Historical reporting architectures are usually combinations of a small number of recurring patterns.

The purpose of this taxonomy is to provide a stable vocabulary for:

* Advisor recommendations
* Model reviews
* Validation findings
* Historical modeling education
* Industry research
