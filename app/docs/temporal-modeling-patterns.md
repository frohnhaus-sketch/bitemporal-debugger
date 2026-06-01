# Temporal Modeling Patterns

## Purpose

This document captures recurring temporal modeling patterns observed when integrating historized source systems into a bitemporal Core Layer and downstream reporting structures.

The goal is to establish a common vocabulary and identify opportunities for visualization, validation, and explainability within the Temporal Modeling Workbench.

---

# Pattern 01 — State ↔ State Alignment

## Description

Two bitemporally historized state tables are joined.

Both tables contain:

* Business validity intervals
* Technical visibility intervals

Example:

```text
Contract
↔
Policyholder
```

## Join Semantics

```sql
valid intervals overlap
AND
visible intervals overlap
```

Result remains a bitemporal state table.

## Typical Problems

* Join gaps
* Ambiguous matches
* Overlapping historization
* Visibility lag between sources

## Current Workbench Support

Implemented.

## Potential Visualizations

* Alignment timeline
* Gap detection
* Overlap detection
* Visibility lag detection

---

# Pattern 02 — State ↔ Event Alignment

## Description

A bitemporal state table is joined with a temporal event table.

State:

```text
valid_from
valid_to
visible_from
visible_to
```

Event:

```text
effective_at
visible_from
visible_to
```

Example:

```text
Contract
↔
Journal Event
```

## Join Semantics

```sql
key equality
AND visible overlap
AND event.effective_at BETWEEN state.valid_from AND state.valid_to
```

## Result

Result remains an event table.

The state validity interval collapses to:

```text
event.effective_at
```

## Typical Problems

* Event finds no matching state
* Event finds multiple states
* State becomes visible after event
* Retroactive event corrections

## Potential Visualizations

* Event-to-state mapping
* Missing state coverage
* Late visibility detection

---

# Pattern 03 — Event → State Construction

## Description

Events are used to construct a state timeline.

Example:

```text
Journal Events
↓
Business Rules
↓
Reporting State
```

## Typical Problems

Multiple events may compete for the same resulting state.

Example:

```text
CREATED
UPDATED
UPDATED
CANCELLED
```

Business logic must determine:

```text
Which event wins?
```

## Typical Rules

```text
CANCELLED > UPDATED > CREATED
```

## Current Pain Point

Business rules become difficult to understand over time.

## Potential Visualizations

* Event precedence graph
* Winning event explanation
* State construction timeline

---

# Pattern 04 — Event Prioritization

## Description

Raw events are reduced to reporting-relevant events.

Example:

```text
Raw Journal Events
↓
Contract-level prioritization
↓
Policy-level prioritization
↓
Fact Table
```

## Typical Problems

The selected event is difficult to explain.

Developers understand the code but not the reasoning.

## Current Pain Point

Knowledge becomes concentrated in a small number of experts.

## Potential Visualizations

```text
All candidate events
↓
Applied rule
↓
Winning event
↓
Fact record
```

## Long-Term Workbench Goal

Decision lineage.

---

# Pattern 05 — State Reduction

## Description

A large number of technical states must be reduced to a smaller set of reporting-relevant states.

Example:

```text
CREATED
AUTO_SAVE
AUTO_SAVE
UPDATED
UPDATED
SUBMITTED
```

Reporting View:

```text
CREATED
SUBMITTED
```

## Typical Problems

* State explosion
* Technical transitions dominate business transitions
* Reporting requirements evolve

## Potential Visualizations

* State frequency analysis
* Transition graph
* Reduced timeline

---

# Pattern 06 — State ↔ Attribute Enrichment

## Description

A historized state table is enriched with non-driving attributes.

Example:

```text
Insured Object
↔
Product Attributes
```

## Result

State timeline remains unchanged.

The attribute table contributes additional descriptive columns.

## Typical Problems

Generally low complexity.

The driving state timeline remains authoritative.

---

# Pattern 07 — Event ↔ Attribute Enrichment

## Description

An event table is enriched with descriptive attributes.

Example:

```text
Journal Event
↔
Event Details
```

## Result

Event timeline remains unchanged.

## Typical Problems

Generally low complexity.

---

# Pattern 08 — Temporal Pivot / Rectangle Decomposition

## Description

Time-dependent attributes are projected onto a shared bitemporal timeline.

Examples:

* Risk characteristics
* Product coverages
* Product model mappings

## Problem

Different attributes have different temporal boundaries.

Example:

```text
Risk A
██████      ███████

Risk B
    ███████████
```

A direct pivot creates inconsistent results.

## Solution

Perform bitemporal rectangle decomposition.

Create all temporal boundaries:

```text
valid × visible
```

Generate rectangles.

Project active attribute values onto each rectangle.

## Typical Problems

* Duplicate records
* Missing attribute values
* Incorrect snapshots
* Broken pivots

## Potential Visualizations

```text
Base timeline
Attribute timeline
↓
Generated rectangles
↓
Projected attributes
```

---

# Pattern 09 — Temporal Dimension Completion

## Description

A dimension starts later than the driving business object.

Example:

```text
Contract:
01.01 → 31.12

Policyholder:
01.03 → 31.12
```

## Problem

Temporal joins produce gaps.

## Typical Solution

Extend dimension slices to the contract timeline.

Fill missing periods using:

```text
Last known value
```

or

```text
Synthetic intervals
```

## Typical Problems

* Hidden assumptions
* Difficult lineage
* Different teams use different strategies

## Potential Visualizations

```text
Original timeline
↓
Expanded timeline
↓
Filled intervals
```

---

# Pattern 10 — Temporal Decision Lineage

## Description

Explain how a final reporting result was produced.

## Example

```text
Raw Events
↓
Priority Rule A
↓
Priority Rule B
↓
Selected Event
↓
Fact Record
```

or

```text
Source States
↓
Alignment
↓
Dimension Completion
↓
Rectangle Decomposition
↓
Fact Record
```

## Goal

Answer:

```text
Why does this reporting result exist?
```

instead of:

```text
What result was produced?
```

## Long-Term Vision

Temporal Modeling Workbench.
