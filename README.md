# Historical Data Modeling Workbench

Understand and model historized source data before building your Core Layer.

A visual workbench for analyzing temporal and bitemporal datasets, identifying historical inconsistencies, and understanding how two historized sources align before integration.

## Detects

* Valid-time gaps
* Overlaps
* Joinability issues
* Ambiguous matches
* Visibility lag
* Historical source misalignment

## Why?

Historized source systems often appear compatible until they are integrated.

Common problems include:

* different valid-time semantics
* delayed source updates
* missing historical periods
* overlapping history
* ambiguous temporal joins

These issues frequently surface only after building a Core Layer, creating incorrect snapshots, duplicate records, or missing business states.

The Historical Data Modeling Workbench helps engineers understand source behavior before modeling downstream analytical layers.

## Typical Use Cases

### Historical Source Integration

Analyze how two historized sources relate before joining them into a Core Layer.

Examples:

* Policy ↔ Object
* Offer ↔ Contract
* Customer ↔ Address

### Temporal Data Quality

Identify:

* gaps in historical coverage
* overlapping records
* inconsistent timelines
* delayed source synchronization

### Historical Modeling Decisions

Understand whether a source relationship requires:

* placeholder records
* synchronization delays
* state reduction
* additional business rules
* alternative modeling strategies

## Features

* CSV upload and paste
* Flexible column mapping
* Timeline visualization
* Gap detection
* Overlap detection
* Joinability analysis
* Visibility lag analysis
* Interactive issue investigation
* SQL generation
* Example datasets

## Demo

https://bitemporal-debugger.vercel.app/

## Local Development

```bash
npm install
npm run dev
```

## Status

Early-stage prototype focused on historical source analysis and temporal data modeling workflows.