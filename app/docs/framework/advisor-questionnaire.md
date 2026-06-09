# Historical Modeling Advisor – Questionnaire

## Purpose

The questionnaire captures the information required to recommend a historical modeling strategy.

---

# Section 1 — Reporting Goal

## Question 1

What are you trying to build?

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

Which source types are available?

Select all that apply.

Options:

* State Tables
* Event Tables
* Journal / CDC Tables
* Reference Tables
* Relationship Tables

---

## Question 3

Which source type is the primary business driver?

Options:

* State
* Event
* Journal

---

# Section 3 — Historical Behavior

## Question 4

Can historical information be corrected later?

Options:

* Yes
* No
* Unknown

---

## Question 5

Can events arrive after they actually happened?

Options:

* Yes
* No
* Unknown

---

## Question 6

Do multiple source systems describe the same business entity?

Options:

* Yes
* No

---

## Question 7

Do relationships change over time?

Examples:

* Customer ↔ Segment
* Policy ↔ Broker
* Employee ↔ Manager

Options:

* Yes
* No

---

# Section 4 — Reporting Requirements

## Question 8

Do you need reproducible reporting snapshots?

Options:

* Yes
* No

---

## Question 9

Do dimensions need historical behavior?

Options:

* No
* SCD1
* SCD2
* Bitemporal

---

## Question 10

Do you need to explain historical reporting results?

Options:

* Yes
* No

---

# Derived Patterns

Based on the answers, the Advisor may recommend:

* State ↔ State Alignment
* State ↔ Event Alignment
* Event Prioritization
* Winner Selection
* Temporal Conformance
* Dimension Completion
* Relationship History
* Historical Correction
* Snapshot Reproducibility
* Identity Resolution

---

# Goal

The questionnaire should be completable in under five minutes while still producing a useful modeling blueprint.
