## Timeline / Investigation UX

### Distinguish JOIN ambiguity from source overlap visually

**Problem**

`JOIN_AMBIGUITY` and `OVERLAP` can currently look almost identical in the Valid-Time Evidence timeline.

For example:
- `JOIN_AMBIGUITY`: one source row matches multiple target rows
- `OVERLAP`: one source contains overlapping historical records internally

Both currently appear as similar dashed/overlap bars, even though they represent different root causes.

**Idea**

Visualize `JOIN_AMBIGUITY` as an alignment problem between sources, not only as an overlap marker.

Possible approaches:
- Add join lines from the source row to multiple matching target rows.
- Highlight the matched target candidates explicitly.
- Keep internal `OVERLAP` as a source-local overlap marker without join lines.

**Goal**

Make it visually clear whether the issue is:
- an internal source historization problem, or
- a temporal JOIN ambiguity between two sources.

---

### Avoid accidental row reselection caused by hover without movement

**Problem**

In Source Record Details, rows may become highlighted while the mouse pointer has not intentionally moved.

This can cause flickering or unexpected layout shifts, especially when the Timeline Evidence card changes height after a selected row/finding changes.

**Idea**

Only update hover-based row highlighting when an actual mouse movement occurred after entering the table/row area.

Possible approaches:
- Track `onMouseMove` before applying hover selection.
- Ignore initial hover events caused by layout shifts.
- Keep clicked row selection stable until the user explicitly moves the mouse or clicks another row.

**Goal**

Prevent flickering and unintended row focus changes while preserving useful hover-based exploration.