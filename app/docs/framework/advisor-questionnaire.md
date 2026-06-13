# Historical Modeling Advisor – Questionnaire

## Purpose

The questionnaire captures the minimum information required to generate a historical modeling blueprint.

The questionnaire is intentionally short.

The goal is to identify the modeling patterns that are most likely required.

Estimated completion time:

```text
Less than 5 minutes
```

---

# Section 1 — Reporting Goal

## Question 1

What are you trying to build?

Select the primary reporting goal.

Options:

* Current State Reporting
* Point-In-Time Reporting
* Snapshot Reporting
* Historical Trend Analysis
* Event Reporting
* Audit Reporting

---

# Section 2 — Source Types

## Question 2

Which source types exist?

Select all that apply.

Options:

* State Tables
* Event Tables
* Journal Tables
* CDC Tables
* Reference Tables
* Relationship Tables

---

## Question 3

Which source type drives reporting?

Options:

* State
* Event
* Journal / CDC

---

# Section 3 — Historical Complexity

## Question 4

Can historical records be corrected after they were originally loaded?

Options:

* Yes
* No
* Unknown

Potential Pattern Impact:

* Historical Correction
* Bitemporal Modeling

---

## Question 5

Can events arrive after they actually occurred?

Options:

* Yes
* No
* Unknown

Potential Pattern Impact:

* Historical Correction
* State ↔ Event Alignment

---

## Question 6

Do multiple systems describe the same business entity?

Examples:

```text
CRM + ERP

Policy System + Partner System

Customer Master + Sales Platform
```

Options:

* Yes
* No

Potential Pattern Impact:

* Historical Conformance
* Identity Resolution

---

## Question 7

Do relationships change over time?

Examples:

```text
Customer ↔ Segment

Employee ↔ Manager

Policy ↔ Broker
```

Options:

* Yes
* No

Potential Pattern Impact:

* Relationship History

---

# Section 4 — Reporting Requirements

## Question 8

Do you need reproducible reporting snapshots?

Options:

* Yes
* No

Potential Pattern Impact:

* Snapshot Reproducibility

Industry Evidence:

One of the most frequently discussed historical reporting challenges.

---

## Question 9

Do dimensions require historical behavior?

Options:

* No
* SCD1
* SCD2
* Bitemporal

Potential Pattern Impact:

* State ↔ State Alignment
* Dimension Completion

Industry Evidence:

Historized dimensions are among the most common sources of historical reporting complexity.

---

## Question 10

Can facts exist before dimensions become available?

Examples:

```text
Late arriving dimensions

Delayed master data

Missing customer records

Missing policyholder history
```

Options:

* Yes
* No
* Unknown

Potential Pattern Impact:

* Dimension Completion
* Historical Backfill

Industry Evidence:

Frequently discussed as:

* Late Arriving Dimensions
* Inferred Members
* Missing Dimension Coverage

---

## Question 11

Do historical reporting results need to be explainable?

Examples:

```text
Audit reporting

Regulatory reporting

Business reconciliation

Management reporting
```

Options:

* Yes
* No

Potential Pattern Impact:

* Temporal Decision Lineage

---

# Derived Patterns

Based on the answers, the Advisor may recommend:

* State Modeling
* Event Modeling
* State ↔ State Alignment
* State ↔ Event Alignment
* Event Prioritization
* Winner Selection
* State Reduction
* Historical Conformance
* Relationship History
* Identity Resolution
* Dimension Completion
* Snapshot Reproducibility
* Historical Backfill
* Historical Correction
* Bitemporal Modeling
* Temporal Decision Lineage

---

# Advisor Goal

Generate a historical modeling blueprint that explains:

* What should be built
* Why it should be built
* Which risks exist
* Which validation checks should be implemented

before implementation begins.

The Advisor should help Data Engineers make historical modeling decisions before implementation effort is invested.
