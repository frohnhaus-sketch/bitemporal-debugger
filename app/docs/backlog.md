# Historical Data Modeling Workbench – Product Backlog

---

# P1 – Highest Priority

## Input Experience

### Improve Failed Analysis Guidance

**Problem**

Users can fail analysis due to missing temporal columns.

Current error messages provide little guidance.

**Idea**

Show detected columns and likely mappings.

Example:

Detected:

* customer_id
* effective_from
* effective_to

Required:

* entity_id
* valid_from
* valid_to

Suggested mapping:

* customer_id → entity_id
* effective_from → valid_from
* effective_to → valid_to

**Goal**

Reduce first-user drop-off and improve onboarding.

---

## Historical Modeling Assessment

### Explain Why A Pattern Was Detected

**Problem**

Patterns are currently inferred from aggregate findings.

Users do not see the evidence behind the recommendation.

**Idea**

Generate evidence-driven pattern explanations.

Example:

Pattern:

Temporal Join Drift

Evidence:

* Source A average records/entity: 1.0
* Source B average records/entity: 5.3
* 4 JOIN_AMBIGUITY findings
* 2 visibility lag findings

**Goal**

Make pattern detection transparent and explainable.

---

# P2 – Strategic Product Expansion

## Historical Modeling Pattern Library

### Pattern Catalog

**Problem**

The assessment identifies modeling situations, but users do not yet get a reusable knowledge base explaining common historical modeling patterns.

**Idea**

Build a pattern library covering recurring historical modeling situations:

* Late Arriving Dimension
* Historical Backfill
* Snapshot Reproducibility
* Historical Match Ambiguity
* Temporal Join Drift
* State Consolidation

Each pattern contains:

* Description
* Typical symptoms
* Root cause
* Modeling strategy
* Example timeline
* Example SQL pattern

**Goal**

Turn the tool into both:

* an investigation workbench
* a historical modeling learning resource

---

## Timeline / Investigation UX

### Distinguish JOIN ambiguity from source overlap visually

**Problem**

`JOIN_AMBIGUITY` and `OVERLAP` can currently look almost identical in the Valid-Time Evidence timeline.

For example:

* `JOIN_AMBIGUITY`: one source row matches multiple target rows
* `OVERLAP`: one source contains overlapping historical records internally

Both currently appear as similar dashed/overlap bars, even though they represent different root causes.

**Idea**

Visualize `JOIN_AMBIGUITY` as an alignment problem between sources, not only as an overlap marker.

Possible approaches:

* Add join lines from the source row to multiple matching target rows.
* Highlight the matched target candidates explicitly.
* Keep internal `OVERLAP` as a source-local overlap marker without join lines.

**Goal**

Make it visually clear whether the issue is:

* an internal source historization problem, or
* a temporal JOIN ambiguity between two sources.

---

## Historical Modeling Assessment

### Assessment Confidence

**Problem**

Some assessments are supported by strong evidence.

Others are only weak signals.

The UI currently treats both equally.

**Idea**

Display confidence levels:

* High confidence
* Medium confidence
* Low confidence

based on detected findings and pattern evidence.

**Goal**

Help users understand how reliable the recommendation is.

---

# P3 – Product Intelligence

## Validation Findings

### Surface Modeling Complexity

**Problem**

Users see findings but not overall modeling difficulty.

**Idea**

Generate an estimated complexity classification:

* Low Modeling Effort
* Medium Modeling Effort
* High Modeling Effort

based on:

* overlaps
* ambiguities
* density differences
* visibility lag
* source pattern combinations

**Goal**

Provide a quick executive summary of historical modeling complexity.

---

## Analytics

### Capture Full User Funnel

**Problem**

Events are collected, but user progression is not analyzed systematically.

**Idea**

Track the complete funnel:

page_view

↓

example_loaded

↓

analyze_clicked

↓

analysis_completed

↓

issue_selected

↓

report_copied

↓

sql_generated

**Goal**

Identify the biggest adoption bottlenecks.

**Status**

Implemented. Waiting for data.

---

### Track Input Failure Patterns

**Problem**

Users may fail analysis due to unsupported schemas.

Without diagnostics it is difficult to identify missing mappings.

**Idea**

Capture:

* row counts
* detected column names
* failure reason

for analysis failures.

**Goal**

Continuously improve automatic column detection and onboarding.

**Status**

Implemented.

---

# P4 – UX Polish

## Timeline / Investigation UX

### Avoid accidental row reselection caused by hover without movement

**Problem**

In Source Record Details, rows may become highlighted while the mouse pointer has not intentionally moved.

This can cause flickering or unexpected layout shifts, especially when the Timeline Evidence card changes height after a selected row/finding changes.

**Idea**

Only update hover-based row highlighting when an actual mouse movement occurred after entering the table/row area.

Possible approaches:

* Track `onMouseMove` before applying hover selection.
* Ignore initial hover events caused by layout shifts.
* Keep clicked row selection stable until the user explicitly moves the mouse or clicks another row.

**Goal**

Prevent flickering and unintended row focus changes while preserving useful hover-based exploration.

---

# P5 – Long-Term Vision

## Future Vision

### Historical Modeling Pattern Explorer

**Problem**

Many engineers struggle to classify historical data problems.

**Idea**

Allow users to explore modeling patterns without uploading data.

Flow:

Pattern

↓

Example Dataset

↓

Timeline Evidence

↓

Investigation Guide

↓

SQL Pattern

**Goal**

Make the Workbench valuable even before users bring their own datasets.

---

### Historical Modeling Knowledge Base

**Problem**

Knowledge about historical modeling is fragmented across blog posts, forum discussions and tribal knowledge.

**Idea**

Build a structured repository of historical modeling patterns, temporal join strategies and reporting pitfalls.

**Goal**

Position the Historical Data Modeling Workbench as a reference resource for historical data engineering.
