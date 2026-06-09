# Research Notes

## Purpose

This document captures observations, discussions, feedback, experiments, and insights gathered during the development of the Historical Modeling Workbench and its evolution toward a Historical Modeling Advisor.

The goal is not to document implementation details.

The goal is to capture evidence that helps answer:

```text
What problem are we actually solving?
Who experiences this problem?
Which ideas resonate?
Which ideas do not?
```

---

# June 2026

## Observation: Historical Modeling Is Poorly Formalized

Most discussions around historical data focus on implementation techniques:

* SCD2
* CDC
* Temporal Joins
* Snapshots

However, the underlying modeling problems often appear repeatedly under different names.

Examples:

* Late Arriving Dimension
* Historical Match Ambiguity
* Snapshot Reproducibility
* Event Prioritization
* Dimension Completion

Initial hypothesis:

```text
Historical modeling consists of a relatively small set
of recurring patterns.
```

---

## Databricks Community Discussion

Question:

```text
What are the major historical modeling patterns?
```

Community responses introduced additional concepts:

* Bitemporal Modeling
* Historical Corrections
* Identity Resolution
* Relationship History
* Grain Evolution
* Temporal Conformance

Key observation:

People immediately discussed modeling patterns.

Nobody discussed visualization.

### Learning

Interest appears to be concentrated around:

```text
How should historical systems be modeled?
```

rather than:

```text
How should historical systems be visualized?
```

---

## Observation: Timeline Visualization Has Limited Pull

The original Workbench focused heavily on:

* Timeline Visualization
* Join Gaps
* Overlaps
* Ambiguous Matches

While technically useful, discussions rarely centered on these capabilities.

Users appear to care more about:

* Why reporting behaves unexpectedly
* Which modeling strategy to choose
* How to structure historical architectures

### Learning

Visualization is useful as evidence.

Visualization is not the primary value proposition.

---

## Observation: Data Engineers Struggle More With Design Than Validation

Reviewing real-world notebooks revealed that most implementation effort was spent on:

* Event Prioritization
* Dimension Completion
* State Construction
* Snapshot Design
* Event-State Alignment
* Temporal Conformance

Very little effort was spent on overlap detection itself.

### Learning

The expensive mistakes happen during modeling.

Not during validation.

---

## Observation: Historical Reporting Is The Actual Goal

Most historical systems ultimately support one of:

* Snapshot Reporting
* Regulatory Reporting
* Point-In-Time Analysis
* Audit Reporting
* Historical Trend Analysis

Historical tables are rarely the final goal.

Historical tables are intermediate structures.

### Learning

The user goal is not:

```text
Store history.
```

The user goal is:

```text
Produce reliable historical reporting.
```

---

## Observation: State And Event Modeling Are Frequently Confused

Many source systems contain structures that are technically represented one way but conceptually behave differently.

Examples:

* Journal tables interpreted as states
* Event streams interpreted as dimensions
* Attributes interpreted as entities

### Learning

One of the most important design decisions is:

```text
Is this a State?

Is this an Event?

Is this a Relationship?

Is this merely an Attribute Structure?
```

---

## Observation: Explainability Is A Major Pain Point

When reporting results appear incorrect, investigation often requires:

```text
Source System
↓
Core Layer
↓
Temporal Transformations
↓
Fact Construction
↓
Dimension Resolution
↓
Reporting Layer
```

Analysis may require:

* Multiple developers
* Business experts
* Data architects

Resolution can take days or weeks.

### Learning

A future opportunity exists around:

```text
Historical Decision Lineage
```

---

## Observation: Event Prioritization Is More Common Than Expected

Many systems generate far more events than are useful for reporting.

Examples:

* Insurance mutations
* Workflow systems
* CRM status changes
* Order processing systems

Reporting often requires:

```text
Many Events
↓
Business Rules
↓
One Reporting Event
```

### Learning

Event Prioritization appears to be a fundamental historical modeling pattern.

---

## Observation: Historical Modeling Often Creates Synthetic History

Many reporting-ready timelines never existed in source systems.

Examples:

* Dimension Completion
* Timeline Extension
* Attribute Projection
* State Construction

The final reporting history is frequently generated.

### Learning

Historical models are often constructed rather than simply stored.

---

## Observation: Most Complexity Comes From Combining Histories

The hardest problems rarely involve a single source.

Complexity emerges when combining:

* Multiple state histories
* Multiple event histories
* Multiple source systems
* Multiple dimensions

### Learning

Historical modeling is primarily a reconciliation problem.

---

# Product Evolution Learnings

## Bitemporal Debugger

Initial hypothesis:

```text
Visualizing temporal history is the primary challenge.
```

Result:

Useful but limited differentiation.

---

## Historical Modeling Workbench

Hypothesis:

```text
Understanding source relationships and historical behavior
provides greater value than visualization alone.
```

Result:

Improved positioning.

Still heavily focused on post-implementation validation.

---

## Historical Modeling Advisor

Emerging hypothesis:

```text
The highest value lies in helping engineers choose
the correct historical modeling strategy before implementation.
```

Potential outputs:

* Recommended Architecture
* Required Patterns
* Validation Checklist
* Blueprint Generation
* Notebook Skeleton

Status:

Research phase.

---

# Open Questions

## Product Questions

* Can historical modeling be reduced to a finite set of reusable patterns?
* Can modeling strategies be recommended through a structured questionnaire?
* Can a blueprint be generated before implementation begins?
* Can notebook reviews identify applied patterns automatically?

---

## Market Questions

* Do Data Engineers perceive historical modeling as a distinct discipline?
* Are historical modeling decisions expensive enough to justify tooling?
* Would architecture guidance be more valuable than validation tooling?
* Which industries experience the greatest historical modeling complexity?

---

## Long-Term Vision

Historical modeling today is largely tribal knowledge.

The long-term goal is to transform historical modeling from:

```text
Experience-driven craftsmanship
```

into:

```text
Structured, explainable engineering.
```
