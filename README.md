# Historical Data Modeling Workbench

Design, review, validate, and understand historical data models.

The Historical Data Modeling Workbench helps Data Engineers, Analytics Engineers, and Data Warehouse teams make better historical modeling decisions before building analytical data products.

Instead of discovering temporal issues after implementation, the workbench helps identify modeling risks, validate assumptions, and explore proven historical modeling patterns upfront.

## What Problems Does It Help Solve?

Historical data systems are often more complex than they initially appear.

Common challenges include:

* Snapshot reporting
* Historized dimensions (SCD2)
* Bitemporal data
* Temporal joins
* Late-arriving data
* Historical corrections
* Relationship history
* Historical source integration
* Snapshot reproducibility

These challenges frequently lead to:

* Incorrect historical reports
* Non-reproducible snapshots
* Missing business states
* Ambiguous temporal joins
* Inconsistent analytical models

The Historical Data Modeling Workbench helps engineers understand these risks before they become production issues.

## Core Workflows

### Design a Historical Data Model

Use the Historical Modeling Advisor to explore requirements and receive recommendations for:

* Modeling strategies
* Historical patterns
* Validation checks
* Common risks
* Blueprint generation

### Review a Historical Model

Assess an existing historical model and identify:

* Modeling risks
* Missing patterns
* Historical consistency concerns
* Potential implementation gaps

### Validate Generated Output

Validate historized target tables and verify that generated datasets contain the information required for reliable historical reporting.

Checks include:

* Business keys
* Valid-time history
* Visible-time history
* Snapshot reproducibility indicators
* Historical completeness

### Compare Historical Sources

Analyze two historized datasets and understand how they align.

Detect:

* Historical coverage gaps
* Overlaps
* Ambiguous matches
* Joinability issues
* Visibility lag
* Temporal misalignment

## Learn Historical Modeling Patterns

Explore common historical modeling concepts including:

* State Modeling
* Event Modeling
* SCD2 vs Bitemporal
* Snapshot Fact Modeling
* Snapshot Reproducibility
* Dimension Completion
* Relationship History
* Historical Backfill
* Historical Corrections
* Event-to-State Projection
* State Reduction
* Rectangle Decomposition

Each pattern includes explanations, examples, and modeling guidance.

## Features

* Historical Modeling Advisor
* Model Review
* Target Table Validation
* Two Source Validation
* Pattern Catalog
* Learn Pages
* Interactive Examples
* Timeline Visualization
* Historical Risk Detection
* SQL Generation
* CSV Upload & Paste Support
* Flexible Column Mapping

## Demo

https://bitemporal-debugger.vercel.app/

## Local Development

```bash
npm install
npm run dev
```

## Status

Active prototype focused on historical data modeling, validation, and decision support for Data Engineering teams.