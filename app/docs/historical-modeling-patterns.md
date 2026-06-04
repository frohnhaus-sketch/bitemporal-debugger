# Historical Modeling Patterns

## 1. Historical Backfill

### Problem

Historical records already exist, but the historical timeline must be reconstructed afterwards.

### Typical Symptoms

* Wrong effective start dates
* Processing time used as business time
* Incomplete history

### Common Solutions

* Historical reload
* CDC replay
* Business-effective dating

### Detection Potential

Future

### Workbench Potential

★★★★★

---

## 2. Late Arriving Dimension

### Problem

Facts exist before matching dimension records become available.

### Typical Symptoms

* Join gaps
* Missing dimension references
* Snapshot inconsistencies

### Common Solutions

* Reconciliation Pattern
* Retry Queue
* Unknown Member

### Detection Potential

Future

### Workbench Potential

★★★★★

---

## 3. Early Arriving Fact

### Problem

Facts arrive before dimensions.

### Typical Symptoms

* Missing surrogate keys
* Join failures

### Common Solutions

* Park & Retry
* Reconciliation

### Detection Potential

Future

### Workbench Potential

★★★★☆

---

## 4. Snapshot Reproducibility

### Problem

Historical reports cannot be reproduced consistently.

### Typical Symptoms

* Different results for the same reporting period
* Snapshot drift

### Common Solutions

* Point-in-time snapshots
* Visible-time modeling

### Detection Potential

Future

### Workbench Potential

★★★★★

---

## 5. Historical Match Ambiguity

### Problem

Multiple valid historical matches exist.

### Typical Symptoms

* Duplicate rows
* Join explosion
* Multiple active records

### Common Solutions

* Temporal join validation
* Interval normalization

### Workbench Potential

★★★★★

---

### Detection Potential

Current

## 6. Historical State Consolidation

### Problem

Too many historical states or events exist for business reporting.

### Typical Symptoms

* Large event histories
* Irrelevant state transitions
* Complex reporting logic

### Common Solutions

* State reduction
* Event consolidation

### Detection Potential

Future

### Workbench Potential

★★★★★

---

## 7. CDC History Modeling

### Problem

Raw CDC streams must be converted into reliable historical state.

### Typical Symptoms

* Missing history
* Out-of-order changes

### Common Solutions

* SCD2
* CDC replay
* Effective dating

### Detection Potential

Future

### Workbench Potential

★★★★☆

---

## 8. Historical Retention & Cleanup

### Problem

Determining how much historical data should be retained.

### Typical Symptoms

* Large historical tables
* Expensive storage

### Common Solutions

* Archiving
* Tiered retention

### Workbench Potential

★★★☆☆

---

## 9. Medallion History Placement

### Problem

Determining where historical responsibility belongs.

### Typical Symptoms

* SCD2 in Bronze vs Silver vs Gold debates
* Duplicate history implementations

### Common Solutions

* Layer ownership
* Historical responsibility definition

### Workbench Potential

★★★☆☆
