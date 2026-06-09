# Historical Modeling Advisor – Decision Framework

## Purpose

The purpose of the Historical Modeling Advisor is to transform reporting requirements and source system characteristics into a recommended historical modeling strategy.

The Advisor does not start with data.

The Advisor starts with business requirements.

---

# Core Principle

Historical modeling decisions can be derived from:

```text
Source Types
+
Reporting Requirements
+
Historical Behavior
↓
Required Operations
↓
Required Modeling Patterns
↓
Recommended Architecture
```

---

# Inputs

## Source Types

Possible source types:

* State
* Event
* Journal
* Reference
* Relationship

---

## Reporting Requirements

Possible reporting goals:

* Current State Reporting
* Point-In-Time Reporting
* Snapshot Reporting
* Trend Analysis
* Event Reporting
* Audit Reporting

---

## Historical Behavior

Questions include:

* Can history be corrected later?
* Can multiple systems describe the same entity?
* Do relationships change over time?
* Are dimensions historized?
* Can events arrive late?

---

# Decision Logic

## State + Current State Reporting

Recommended Operations:

* Relate

Recommended Patterns:

* State Modeling

Recommended Architecture:

* Current State Model
* SCD1 or Current-State Views

---

## State + Point-In-Time Reporting

Recommended Operations:

* Relate
* Snapshot

Recommended Patterns:

* State Modeling
* Snapshot Reproducibility

Recommended Architecture:

* Historized State Tables
* As-Of Query Layer

---

## State + Event + Snapshot Reporting

Recommended Operations:

* Align
* Prioritize
* Snapshot

Recommended Patterns:

* State ↔ Event Alignment
* Event Prioritization
* Snapshot Reproducibility

Recommended Architecture:

* Core State Layer
* Core Event Layer
* Snapshot Fact
* Historical Dimensions

---

## Multiple Source Systems

Recommended Operations:

* Align
* Resolve

Recommended Patterns:

* Temporal Conformance
* Identity Resolution

Recommended Architecture:

* Reconciliation Layer
* Unified Business Entities

---

## Historical Corrections

Recommended Operations:

* Reconstruct
* Snapshot

Recommended Patterns:

* Historical Correction
* Bitemporal Modeling

Recommended Architecture:

* Bitemporal Core Layer

---

# Advisor Output

The Advisor produces:

* Recommended Architecture
* Required Modeling Operations
* Required Modeling Patterns
* Typical Risks
* Validation Checklist
* Suggested Notebook Structure

---

# Long-Term Vision

The Advisor becomes a decision engine that converts historical reporting requirements into implementation-ready historical modeling blueprints.
