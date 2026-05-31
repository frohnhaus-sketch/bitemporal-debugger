# Temporal Modeling Workbench – Problem Map

## Purpose

This document captures the most important temporal modeling challenges encountered while building and operating a bitemporal Core Layer and downstream reporting structures.

The goal is to identify recurring patterns, understand where complexity originates, and guide future development of the Temporal Modeling Workbench.

---

# Core Pattern Groups

## Temporal Alignment

* State ↔ State Alignment
* Event ↔ State Alignment
* Fact ↔ Dimension Resolution

## Temporal Construction

* Attribute-driven State Construction
* Temporal Coverage Completion
* Rectangle Decomposition
* Temporal Pivot
* Source Re-Representation

## Temporal Validation

* Gaps & Overlaps
* Foreign Key Coverage Validation
* Temporal Regression Testing

## Temporal Explainability

* Event Prioritization
* Reporting State Construction
* Reporting Result Explainability

---

# Pattern: State ↔ State Alignment

## Business Goal

Correctly join historized business objects originating from different source systems.

## Example

Contract ↔ Policyholder

Contract ↔ Insured Object

## Today

Bitemporal joins using valid-time and visible-time overlap semantics.

Typically implemented via `join_bitemporal`.

## Why Difficult?

Different source systems often use different historization semantics.

## Typical Issues

* Join Gap
* Join Ambiguity
* Overlaps
* Visibility Lag

## Understanding Level

Relatively well understood within the Core team.

## Workbench Opportunity

Visual alignment of source timelines.

---

# Pattern: Event ↔ State Alignment

## Business Goal

Resolve business events against the state that was valid when the event occurred.

## Example

GeVo Event ↔ Contract

TBKO_VTRJOURNAL_EVENT ↔ TBKO_VERTRAG

## Today

Event effective date must fall within the valid-time interval of the state object.

Visible-time intervals must overlap.

```sql
state.key = event.key
AND state.visible_from < event.visible_to
AND event.visible_from < state.visible_to
AND event.effective_at BETWEEN state.valid_from AND state.valid_to
```

## Why Difficult?

Events are point-in-time concepts while state tables represent intervals.

## Typical Issues

* Missing state match
* Multiple matches
* Incorrect reporting snapshot
* Retroactive event corrections

## Workbench Opportunity

Visual event-to-state mapping.

---

# Pattern: Fact ↔ Dimension Resolution

## Business Goal

Resolve the correct dimension version for a reporting fact.

## Example

Fact Table ↔ SCD2 Policyholder Dimension

Fact Table ↔ SCD2 Vehicle Dimension

## Today

BK_REFERENCE_DATE is matched against visible-time.

BK_EFFECTIVE_AT is matched against valid-time.

```sql
BK_REFERENCE_DATE BETWEEN visible_from AND visible_to
AND
BK_EFFECTIVE_AT BETWEEN valid_from AND valid_to
```

## Why Difficult?

Two temporal axes must be resolved simultaneously.

## Typical Issues

* Wrong dimension version
* Missing match
* Incorrect month-end reporting result
* Duplicate fact rows

## Workbench Opportunity

Fact Row → Dimension Match explanation.

---

# Pattern: Event Prioritization (Contract Level)

## Business Goal

Select the most relevant business event per contract.

## Example

Multiple competing GeVos for the same contract and period.

## Today

Business rules determine the winning event.

## Why Difficult?

Prioritization logic is distributed across code and business rules.

## Typical Issues

* Wrong winning event
* Difficult debugging
* Hidden business assumptions

## Workbench Opportunity

Candidate Events → Applied Rule → Winner

---

# Pattern: Event Prioritization (Policy Level)

## Business Goal

Aggregate and prioritize already selected contract-level events on policy level.

## Example

Several contracts contribute events to a single policy.

## Today

Second prioritization stage after contract-level selection.

Afterwards only reporting-relevant GeVos are retained.

Reporting is performed per:

```text
Policy Number
+
Month-End Snapshot
+
GeVo Type
```

Exactly one winner remains.

## Why Difficult?

Multiple prioritization layers interact.

## Typical Issues

* Wrong policy-level event
* Missing facts
* Duplicate facts
* Difficult explainability

## Workbench Opportunity

Contract Winners

↓

Policy Winner

↓

Reporting Filter

↓

Final Fact Event

---

# Pattern: Reporting State Construction

## Business Goal

Transform technical status histories into reporting-relevant business states.

## Example

Offer System Statuses

```text
CREATED
AUTO_SAVE
UPDATED
SUBMITTED
```

## Today

Technical states are filtered, reduced, and prioritized.

## Why Difficult?

Technical process states are not identical to business states.

## Typical Issues

* Relevant states omitted
* Irrelevant states reported

## Workbench Opportunity

Raw Timeline → Reporting Timeline

---

# Pattern: Attribute-driven State Construction

## Business Goal

Create historized Core objects from attribute-only source structures.

## Example

Policy Object

The source system initially provided only attributes.

A historized Core state object was constructed using:

* Contract timelines
* Attribute prioritization
* Temporal backfilling

via `probe_by_attr`.

## Today

Contract timelines act as the driving timeline.

Attributes are prioritized and projected onto these timelines.

Missing periods are backfilled.

## Why Difficult?

The resulting state history never existed explicitly in the source system.

It is constructed.

## Typical Issues

* Wrong attribute wins
* Incorrect prioritization
* Incorrect backfill
* Synthetic history becomes difficult to explain

## Workbench Opportunity

Source Attributes

↓

Driving Timeline

↓

Attribute Priority Rules

↓

Backfill

↓

Constructed State

---

# Pattern: Temporal Coverage Completion

## Business Goal

Extend dimension timelines to match the temporal coverage of driving business objects.

## Example

Policyholder starts later than Contract.

## Today

Dimension timelines are extended.

Missing values are temporally backfilled.

Often used together with SCD2 dimensions.

## Why Difficult?

Generated history did not exist in the original source.

## Typical Issues

* Incorrect backfill
* Hidden assumptions
* Difficult lineage
* Duplicate generation

## Workbench Opportunity

Original Timeline

↓

Expanded Timeline

↓

Backfilled Timeline

---

# Pattern: Temporal Pivot

## Business Goal

Pivot time-dependent attributes onto historized business objects.

## Example

Vehicle Risk Characteristics

Coverage KPIs

## Today

Business-key based pivoting after timeline harmonization.

## Why Difficult?

Attribute timelines rarely align perfectly.

## Typical Issues

* Lost attributes
* Duplicate rows
* Broken snapshots

## Workbench Opportunity

Attribute Timelines → Pivot Preview

---

# Pattern: Rectangle Decomposition

## Business Goal

Project time-dependent attributes onto a common bitemporal structure.

## Example

Risk Characteristics

Coverages

Product Models

## Today

Bitemporal rectangle decomposition.

Active attributes are projected onto generated rectangles.

## Why Difficult?

Multiple independent temporal boundaries must be reconciled.

## Typical Issues

* Incorrect rectangles
* Wrong KPI assignment
* Snapshot inconsistencies

## Workbench Opportunity

Boundaries

↓

Rectangles

↓

Projected Attributes

---

# Pattern: State ↔ Attribute Enrichment

## Business Goal

Enrich state objects with descriptive attributes.

## Example

Insured Object ↔ Product Attributes

## Today

State timeline remains authoritative.

Attributes are attached without driving historization.

## Typical Issues

Attributes accidentally become history-driving.

## Workbench Opportunity

Highlight driving timeline.

---

# Pattern: Event ↔ Attribute Enrichment

## Business Goal

Enrich business events with descriptive attributes.

## Example

GeVo Event ↔ Event Details

## Today

Event timeline remains authoritative.

## Typical Issues

Unnecessary historization.

## Workbench Opportunity

Event Timeline + Attribute Attachments

---

# Pattern: Source Re-Representation

## Business Goal

Represent source data in the temporally correct form.

## Example

TBKO_JOURNAL → TBKO_JOURNAL_EVENT

## Today

The original source was initially interpreted as a state table.

Visibility-related drift and historization issues led to the introduction of an event-based representation.

The event representation became the authoritative model.

## Why Difficult?

The physical source structure does not necessarily correspond to the correct temporal business concept.

The key question is:

```text
Is this source a state?
Is this source an event?
Is this source merely an attribute structure?
```

## Typical Issues

* Visibility drift
* Artificial overlaps
* Difficult historization
* Incorrect temporal semantics

## Workbench Opportunity

Source

↓

State?

Event?

Attribute?

↓

Recommended temporal representation

---

# Pattern: Retroactive Event Correction

## Business Goal

Support correction of previously visible events.

## Example

A later event invalidates an earlier event with an older effective date.

## Today

Visible-time history tracks corrections.

## Why Difficult?

Historical reports may change.

## Typical Issues

* Unexpected reporting differences
* Difficult root cause analysis

## Workbench Opportunity

Event Versions

↓

Snapshot Difference Analysis

---

# Pattern: Temporal Regression Testing

## Business Goal

Prevent regressions in temporal models and reporting logic.

## Example

Changes to:

* GeVo prioritization
* Dimension completion
* Event alignment
* Rectangle decomposition

must not change validated reporting results unexpectedly.

## Today

Validation is performed through:

* Test catalogs
* Reference comparisons
* Table reconciliation
* Manual review before deployment

## Why Difficult?

Temporal regressions are often invisible.

A small modeling change may alter historical reporting results months or years back in time.

## Typical Issues

* Historical reports change unexpectedly
* New logic breaks existing snapshots
* Hidden side effects

## Workbench Opportunity

Golden Test Catalog

↓

New Model Version

↓

Compare

↓

Highlight Differences

---

# Pattern: Reporting Result Explainability

## Business Goal

Understand why a specific reporting result exists.

## Example

```text
Policy 4711
Reporting Date 2024-06-30

Vehicle missing
Unexpected GeVo
Unexpected KPI
```

## Today

Analysis typically requires tracing through:

```text
AFIS
↓
Core Layer
↓
Event Selection
↓
Dimension Resolution
↓
Coverage Completion
↓
Gold Layer
↓
Report
```

The process often involves multiple developers and domain experts.

Complex investigations can take weeks.

## Why Difficult?

Knowledge is distributed across many transformations and business rules.

No single place explains the complete chain.

## Typical Issues

* Long analysis cycles
* Difficult onboarding
* High dependency on experts
* Low explainability

## Workbench Opportunity

Reporting Result

↓

Fact Row

↓

Selected Event

↓

Dimension Match

↓

Applied Rules

↓

Source Records

## Long-Term Vision

Answer:

> Why does this reporting result exist?

instead of:

> What is the reporting result?
