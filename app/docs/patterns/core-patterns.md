# Historical Data Modeling Pattern Taxonomy

## Purpose

This document defines the canonical pattern taxonomy used throughout the Historical Data Modeling Workbench.

The goal is to provide a stable vocabulary for understanding, discussing, designing, reviewing, and validating historical data models.

Historical data platforms appear diverse, but most architectures are combinations of a relatively small set of recurring modeling patterns.

The Workbench uses these patterns to power:

* Advisor recommendations
* Model reviews
* Validation workflows
* Pattern catalog navigation
* Learn pages
* Historical modeling education

---

# Pattern Hierarchy

```text
Foundational Patterns
↓
Modeling Patterns
↓
Reporting Patterns
↓
Engineering Patterns
↓
Validation & Review
```

Foundational patterns describe how history is represented.

Modeling patterns describe how business reality is modeled.

Reporting patterns describe how history is consumed.

Engineering patterns describe how historical models are implemented.

Validation workflows verify that the chosen approach behaves as intended.

---

# Foundations

## State Modeling

Represents entities that exist over a time interval.

Examples:

* Customer
* Contract
* Policy
* Product
* Vehicle

Core Question:

```text
What was true during a period of time?
```

---

## Event Modeling

Represents business occurrences at a specific point in time.

Examples:

* Payment Received
* Claim Filed
* Status Change
* Contract Mutation

Core Question:

```text
What happened?
```

---

## Bitemporal Modeling

Separates business-effective time from system-visible time.

Core Questions:

```text
What was true?

What did we know?

When did we know it?
```

Common Drivers:

* Historical corrections
* Auditability
* Regulatory requirements
* Snapshot reproducibility

---

# Alignment Patterns

## State-to-State Alignment

Align two historical state timelines.

Examples:

```text
Contract ↔ Customer

Policy ↔ Object

Product ↔ Pricing
```

Common Challenges:

* Missing matches
* Coverage gaps
* Ambiguous matches

---

## State-to-Event Alignment

Combine state history with business events.

Examples:

```text
Contract ↔ Contract Mutation

Policy ↔ Claim

Customer ↔ Interaction
```

Common Challenges:

* Temporal join complexity
* Event attribution
* Missing context

---

## Historical Conformance

Multiple systems describe the same business reality.

Examples:

```text
CRM + ERP

Policy + Billing

Partner + Internal Systems
```

Goal:

Create a consistent historical interpretation.

---

# Dimension & Relationship Patterns

## Dimension Completion

Dimension history does not fully cover the reporting timeline.

Examples:

```text
Fact starts before dimension.

Customer history starts after contract history.
```

Common Solutions:

* Placeholder records
* Earliest-known extension
* Business default members

Industry Observation:

One of the most common historical modeling problems.

---

## Relationship History

Relationships change over time.

Examples:

```text
Employee ↔ Manager

Customer ↔ Segment

Policy ↔ Broker
```

Goal:

Preserve historical relationship changes.

---

## Identity Resolution

Multiple identifiers represent the same business entity.

Examples:

```text
Customer Merge

Contract Migration

Account Consolidation
```

Goal:

Create a stable business identity over time.

---

# Reporting Patterns

## Snapshot Fact Modeling

Create historical reporting snapshots.

Examples:

```text
Month-End Portfolio

Daily Active Customers

Quarter-End Exposure
```

Goal:

Represent business state at reporting points.

---

## Snapshot Reproducibility

Historical reports should return the same result regardless of when they are rerun.

Core Question:

```text
Can I reproduce last month's report today?
```

Common Drivers:

* Late-arriving data
* Historical corrections
* Data restatements

Industry Observation:

One of the most frequently discussed reporting challenges.

---

## As-Known Reporting

Report based on information available at a specific point in time.

Examples:

```text
Regulatory Reporting

Operational Reporting

Management Reporting
```

Goal:

Preserve historical knowledge state.

---

# Engineering Patterns

## Historical Backfill

Historical data becomes available after initial loading.

Examples:

* Late-arriving data
* Migration loads
* Historical reconstruction

Goal:

Incorporate historical information safely.

---

## Historical Correction

Previously known history is corrected.

Examples:

* Data quality fixes
* Regulatory corrections
* Source system restatements

Goal:

Preserve both original and corrected interpretations.

---

## Event Prioritization

Multiple events compete to represent a business outcome.

Examples:

```text
Workflow Events

Contract Events

Status Changes
```

Goal:

Identify reporting-relevant events.

---

## State Reduction

Large technical histories are condensed into reporting-relevant states.

Examples:

```text
Workflow Simplification

Status Consolidation

Event Reduction
```

Goal:

Reduce reporting complexity.

---

## Event-to-State Projection

Transform events into state history.

Examples:

```text
Order Events → Order State

Workflow Events → Status Timeline
```

Goal:

Create queryable historical states.

---

## Rectangle Decomposition

Project multiple temporal attributes onto a common timeline.

Examples:

```text
Coverage Modeling

Risk Characteristics

Pricing Attributes
```

Goal:

Create complete reporting intervals.

---

# Long-Term Vision

The Historical Data Modeling Workbench is built on the idea that historical data engineering is not a collection of isolated techniques.

Most historical architectures can be understood as combinations of recurring modeling patterns.

A shared pattern vocabulary makes it easier to:

* Design historical models
* Review existing architectures
* Explain modeling decisions
* Validate generated outputs
* Teach historical data concepts
* Build reusable engineering solutions
