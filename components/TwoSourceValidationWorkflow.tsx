"use client";

import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { AssessmentPanel } from "@/components/AssessmentPanel";
import { DataPreview } from "@/components/DataPreview";
import { GuidedDemoPanel } from "@/components/GuidedDemoPanel";
import { IssueWhyPanel } from "@/components/IssueWhyPanel";
import { IssuesPanel } from "@/components/IssuesPanel";
import { SqlPanel } from "@/components/SqlPanel";
import { Timeline } from "@/components/Timeline";
import { TimelineLegend } from "@/components/TimelineLegend";
import { TwoSourceInputPanel } from "@/components/TwoSourceInputPanel";
import { detectDrift, detectGaps, detectOverlapMarkers } from "@/lib/analysis";
import { track } from "@/lib/analytics";
import { analyzeJoinability } from "@/lib/joinability";
import { parseCSV, type HeaderMapping } from "@/lib/parser";
import {
  analyzeSourceRelationship,
  detectHistoricalPatterns,
} from "@/lib/sourceRelationships";
import {
  detectSourcePattern,
  type SourcePatternResult,
} from "@/lib/sourcePatterns";
import { buildTemporalIssues } from "@/lib/temporalIssues";
import type {
  AggregatedJoinabilityIssue,
  BitemporalRow,
  DriftSummary,
  HighlightTarget,
  OverlapIssue,
  TemporalIssue,
  ValidationMode,
} from "@/lib/types";

const EXAMPLE_A = `entity_id,value,valid_from,valid_to,visible_from,visible_to
1,contract_active,2024-01-01,2024-12-31,2024-01-01T00:00:00,2024-06-01T00:00:00
2,contract_active,2024-01-01,2024-12-31,2024-01-01T00:00:00,9999-12-31T00:00:00
3,contract_active,2024-01-01,2024-12-31,2024-01-01T00:00:00,9999-12-31T00:00:00
4,contract_active,2024-01-01,2024-03-31,2024-01-01T00:00:00,9999-12-31T00:00:00
4,contract_active,2024-05-01,2024-12-31,2024-01-01T00:00:00,9999-12-31T00:00:00
5,contract_active,2024-01-01,2024-12-31,2024-01-01T00:00:00,9999-12-31T00:00:00
4,contract_active,2024-01-01,2024-12-31,2024-01-01T00:00:00,9999-12-31T00:00:00
6,contract_active,2024-01-01,2024-12-31,2024-01-01T00:00:00,9999-12-31T00:00:00
7,contract_active,2024-01-01,2024-12-31,2024-01-01T00:00:00,9999-12-31T00:00:00
8,contract_active,2024-01-01,2024-12-31,2024-01-01T00:00:00,9999-12-31T00:00:00`;

const EXAMPLE_B = `entity_id,value,valid_from,valid_to,visible_from,visible_to
1,object_active,2024-01-01,2024-12-31,2024-07-01T00:00:00,9999-12-31T00:00:00
2,object_active,2024-04-01,2024-12-31,2025-01-01T00:00:00,9999-12-31T00:00:00
3,object_v1,2024-01-01,2024-12-31,2024-01-01T00:00:00,2024-12-31T00:00:00
3,object_v2,2024-01-01,2024-12-31,2025-01-01T00:00:00,9999-12-31T00:00:00
5,object_v1,2024-01-01,2024-12-31,2024-01-01T00:00:00,9999-12-31T00:00:00
5,object_v2,2024-01-01,2024-12-31,2024-01-01T00:00:00,9999-12-31T00:00:00
4,object_active,2024-06-01,2024-12-31,2024-01-01T00:00:00,9999-12-31T00:00:00
6,customer_known_late,2024-05-01,2024-12-31,2024-01-01T00:00:00,9999-12-31T00:00:00
7,customer_partial,2024-03-01,2024-10-31,2024-01-01T00:00:00,9999-12-31T00:00:00
8,customer_partial,2024-01-01,2024-06-30,2024-01-01T00:00:00,9999-12-31T00:00:00
8,customer_partial,2024-08-01,2024-12-31,2024-01-01T00:00:00,9999-12-31T00:00:00`;

const REQUIRED_COLUMNS = ["entity_id", "valid_from", "valid_to"];

export function TwoSourceValidationWorkflow() {
  const [isMobile, setIsMobile] = useState(false);
  const [guidedDemoStep, setGuidedDemoStep] = useState<number | null>(null);
  const [demoBeforeCount, setDemoBeforeCount] = useState<number | null>(null);

  const [inputA, setInputA] = useState("");
  const [inputB, setInputB] = useState("");
  const [fileNameA, setFileNameA] = useState("");
  const [fileNameB, setFileNameB] = useState("");
  const [sourceNameA, setSourceNameA] = useState("source_a");
  const [sourceNameB, setSourceNameB] = useState("source_b");

  const [showMapping, setShowMapping] = useState(false);
  const [maxColumns, setMaxColumns] = useState<number | "all">(8);
  const [headerMappingsA, setHeaderMappingsA] = useState<HeaderMapping[]>([]);
  const [headerMappingsB, setHeaderMappingsB] = useState<HeaderMapping[]>([]);
  const [columnMappingA, setColumnMappingA] = useState<Record<string, string>>(
    {}
  );
  const [columnMappingB, setColumnMappingB] = useState<Record<string, string>>(
    {}
  );

  const [rows, setRows] = useState<BitemporalRow[]>([]);
  const [gaps, setGaps] = useState<any[]>([]);
  const [drifts, setDrifts] = useState<DriftSummary[]>([]);
  const [overlapMarkers, setOverlapMarkers] = useState<OverlapIssue[]>([]);
  const [joinIssues, setJoinIssues] = useState<AggregatedJoinabilityIssue[]>(
    []
  );

  const [selectedIssue, setSelectedIssue] =
    useState<AggregatedJoinabilityIssue | null>(null);
  const [selectedTemporalIssue, setSelectedTemporalIssue] =
    useState<TemporalIssue | null>(null);
  const [highlightedRow, setHighlightedRow] =
    useState<HighlightTarget | null>(null);

  const [asOfDate, setAsOfDate] = useState("");
  const [visibleAsOf, setVisibleAsOf] = useState("");
  const [sql, setSql] = useState("");
  const [validationMode, setValidationMode] =
    useState<ValidationMode>("monotemporal");
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const [showAssessmentGenerated, setShowAssessmentGenerated] =
    useState(false);
  const [expandedSources, setExpandedSources] = useState<string[]>([]);
  const [pendingScrollTarget, setPendingScrollTarget] = useState<
    | "validation"
    | "findings"
    | "guidedDemo"
    | "validationContext"
    | "snapshotActive"
    | null
  >(null);

  const [sourcePatterns, setSourcePatterns] = useState<{
    sourceA: SourcePatternResult | null;
    sourceB: SourcePatternResult | null;
  }>({
    sourceA: null,
    sourceB: null,
  });

  const guidedDemoRef = useRef<HTMLDivElement>(null);
  const validationContextRef = useRef<HTMLDivElement>(null);
  const snapshotActiveRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement | null>(null);
  const analysisRef = useRef<HTMLDivElement>(null);
  const validationResultTopRef = useRef<HTMLDivElement>(null);
  const explanationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth < 900);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const minDate = rows.length
    ? Math.min(...rows.map((r) => new Date(r.valid_from).getTime()))
    : 0;

  const maxDate = rows.length
    ? Math.max(
        ...rows.map((r) => {
          const t = new Date(r.valid_to).getTime();
          return !String(r.valid_to).includes("T")
            ? t + 24 * 60 * 60 * 1000
            : t;
        })
      )
    : 1;

  const snapshotActive = Boolean(asOfDate || visibleAsOf);

  const activeRows = useMemo(() => {
    if (!snapshotActive) return rows;

    return rows.filter((row) => {
      const validOk = asOfDate
        ? new Date(asOfDate) >= new Date(row.valid_from) &&
          new Date(asOfDate) <= new Date(row.valid_to)
        : true;

      const visibleOk = visibleAsOf
        ? new Date(visibleAsOf) >= new Date(row.visible_from) &&
          new Date(visibleAsOf) <
            new Date(row.visible_to || "9999-12-31T00:00:00")
        : true;

      return validOk && visibleOk;
    });
  }, [rows, asOfDate, visibleAsOf, snapshotActive]);

  const activeJoinIssues = useMemo(
    () =>
      analyzeJoinability(activeRows, sourceNameA, sourceNameB, validationMode),
    [activeRows, sourceNameA, sourceNameB, validationMode]
  );

  const activeGaps = useMemo(() => detectGaps(activeRows), [activeRows]);
  const activeDrifts = useMemo(() => detectDrift(activeRows), [activeRows]);

  const activeOverlapMarkers = useMemo(
    () => detectOverlapMarkers(activeRows, validationMode),
    [activeRows, validationMode]
  );

  const activeTemporalIssues = useMemo(
    () =>
      buildTemporalIssues({
        rows: activeRows,
        sourceAName: sourceNameA,
        sourceBName: sourceNameB,
        joinIssues: activeJoinIssues,
        gaps: activeGaps,
        overlapMarkers: activeOverlapMarkers,
        drifts: activeDrifts,
        validationMode,
      }),
    [
      activeRows,
      sourceNameA,
      sourceNameB,
      activeJoinIssues,
      activeGaps,
      activeOverlapMarkers,
      activeDrifts,
      validationMode,
    ]
  );

  const activeMissingMatchCount = activeJoinIssues.filter(
    (issue) => issue.type === "JOIN_GAP"
  ).length;

  const snapshotDriftDetected =
    guidedDemoStep === 3 &&
    demoBeforeCount !== null &&
    activeMissingMatchCount !== demoBeforeCount;

  const snapshotDriftIssue: TemporalIssue | null =
    snapshotDriftDetected && demoBeforeCount !== null
      ? {
          id: "snapshot-drift-guided-demo",
          type: "SNAPSHOT_DRIFT",
          severity: "medium",
          title: "Snapshot Drift",
          source: "Validation Snapshot",
          entity_id: "snapshot",
          from: "earlier visible-time",
          to: visibleAsOf || "later visible-time",
          explanation: `Missing Matches changed from ${demoBeforeCount} to ${activeMissingMatchCount} after switching visible-time.`,
        }
      : null;

  const activeTemporalIssuesWithSnapshotDrift = snapshotDriftIssue
    ? [snapshotDriftIssue, ...activeTemporalIssues]
    : activeTemporalIssues;

  const hasSelectedFinding =
    selectedIssue !== null || selectedTemporalIssue !== null;

  const hasActiveFindings = activeTemporalIssuesWithSnapshotDrift.length > 0;

  const sourceRecordRowsA = activeRows.filter(
    (row) => row.source === sourceNameA
  );

  const sourceRecordRowsB = activeRows.filter(
    (row) => row.source === sourceNameB
  );

  const joinGapCount = joinIssues.filter(
    (issue) => issue.type === "JOIN_GAP"
  ).length;

  const joinAmbiguityCount = joinIssues.filter(
    (issue) => issue.type === "JOIN_AMBIGUITY"
  ).length;

  const relationshipAnalysis =
    sourcePatterns.sourceA && sourcePatterns.sourceB
      ? analyzeSourceRelationship(sourcePatterns.sourceA, sourcePatterns.sourceB)
      : null;

  const historicalPatterns = detectHistoricalPatterns(
    joinAmbiguityCount,
    joinGapCount,
    drifts.length
  );

  const relationshipComplexityStyle = relationshipAnalysis
    ? getComplexityStyle(relationshipAnalysis.complexity)
    : null;

  function resetAnalysis() {
    setRows([]);
    setJoinIssues([]);
    setSelectedIssue(null);
    setSelectedTemporalIssue(null);
    setGaps([]);
    setDrifts([]);
    setOverlapMarkers([]);
    setSql("");
    setHasAnalyzed(false);
  }

  function buildColumnMapping(
    mappings: HeaderMapping[],
    currentMapping: Record<string, string>
  ) {
    const nextMapping: Record<string, string> = {};

    mappings.forEach((mapping) => {
      nextMapping[mapping.original] =
        currentMapping[mapping.original] ?? mapping.normalized;
    });

    return nextMapping;
  }

  function updateMappingForSourceA(nextInputA = inputA) {
    if (!nextInputA.trim()) {
      setHeaderMappingsA([]);
      setColumnMappingA({});
      return;
    }

    const parsedA = parseCSV(nextInputA, { maxColumns });
    setHeaderMappingsA(parsedA.headerMappings);
    setColumnMappingA(
      buildColumnMapping(parsedA.headerMappings, columnMappingA)
    );
  }

  function updateMappingForSourceB(nextInputB = inputB) {
    if (!nextInputB.trim()) {
      setHeaderMappingsB([]);
      setColumnMappingB({});
      return;
    }

    const parsedB = parseCSV(nextInputB, { maxColumns });
    setHeaderMappingsB(parsedB.headerMappings);
    setColumnMappingB(
      buildColumnMapping(parsedB.headerMappings, columnMappingB)
    );
  }

  function updateMappingsFromInputs(nextInputA = inputA, nextInputB = inputB) {
    if (nextInputA.trim()) {
      const parsedA = parseCSV(nextInputA, { maxColumns });
      setHeaderMappingsA(parsedA.headerMappings);
      setColumnMappingA(
        buildColumnMapping(parsedA.headerMappings, columnMappingA)
      );
    } else {
      setHeaderMappingsA([]);
      setColumnMappingA({});
    }

    if (nextInputB.trim()) {
      const parsedB = parseCSV(nextInputB, { maxColumns });
      setHeaderMappingsB(parsedB.headerMappings);
      setColumnMappingB(
        buildColumnMapping(parsedB.headerMappings, columnMappingB)
      );
    } else {
      setHeaderMappingsB([]);
      setColumnMappingB({});
    }
  }

  function loadCsvFile(
    event: ChangeEvent<HTMLInputElement>,
    target: "A" | "B"
  ) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (readerEvent) => {
      const text = String(readerEvent.target?.result ?? "");

      if (target === "A") {
        setInputA(text);
        setFileNameA(file.name);
        updateMappingForSourceA(text);
      } else {
        setInputB(text);
        setFileNameB(file.name);
        updateMappingForSourceB(text);
      }

      resetAnalysis();

      track("csv_uploaded", {
        target,
        size: file.size,
        hasSourceA: target === "A" ? true : !!inputA.trim(),
        hasSourceB: target === "B" ? true : !!inputB.trim(),
      });

      event.target.value = "";
    };

    reader.readAsText(file);
  }

  function applyColumnMapping(
    rawRows: any[],
    mappings: HeaderMapping[],
    activeMapping: Record<string, string>
  ) {
    return rawRows.map((row) => {
      const mappedRow: any = {};

      mappings.forEach((mapping) => {
        const targetColumn =
          activeMapping[mapping.original] ?? mapping.normalized;

        if (!targetColumn) return;

        mappedRow[targetColumn] = row[mapping.normalized];
      });

      if (!mappedRow.source) mappedRow.source = "default";
      if (!mappedRow.value) mappedRow.value = "";
      if (!mappedRow.visible_from) {
        mappedRow.visible_from = mappedRow.valid_from || "";
      }
      if (!mappedRow.visible_to) {
        mappedRow.visible_to = "9999-12-31T00:00:00";
      }

      return mappedRow;
    });
  }

  function parseOneSource(
    rawInput: string,
    sourceName: string,
    activeMapping: Record<string, string>
  ) {
    const parsed = parseCSV(rawInput, { maxColumns });

    const initialMapping: Record<string, string> = {};
    parsed.headerMappings.forEach((mapping) => {
      initialMapping[mapping.original] = mapping.normalized;
    });

    const mappingToUse =
      Object.keys(activeMapping).length > 0 ? activeMapping : initialMapping;

    const mappedRows = applyColumnMapping(
      parsed.rows,
      parsed.headerMappings,
      mappingToUse
    ).map((row) => ({
      ...row,
      source: sourceName || "source",
    }));

    return {
      rows: mappedRows,
      headerMappings: parsed.headerMappings,
      mapping: mappingToUse,
    };
  }

  function hasRequiredColumns(parsedRows: any[]) {
    if (parsedRows.length === 0) return false;

    return REQUIRED_COLUMNS.every((column) =>
      Object.prototype.hasOwnProperty.call(parsedRows[0], column)
    );
  }

  function analyzeTwoSourcesFromValues(
    rawA: string,
    rawB: string,
    sourceAName: string,
    sourceBName: string,
    mode: ValidationMode = validationMode
  ) {
    if (!rawA.trim() || !rawB.trim()) {
      resetAnalysis();
      return;
    }

    const parsedA = parseOneSource(rawA, sourceAName || "source_a", columnMappingA);
    const parsedB = parseOneSource(rawB, sourceBName || "source_b", columnMappingB);

    if (!hasRequiredColumns(parsedA.rows) || !hasRequiredColumns(parsedB.rows)) {
      track("analysis_failed", {
        reason: "missing_required_columns",
        sourceA: sourceAName,
        sourceB: sourceBName,
        mode,
        rowCountA: parsedA.rows.length,
        rowCountB: parsedB.rows.length,
        columnsA: [...new Set(parsedA.headerMappings.map((m) => m.original))].slice(0, 20),
        columnsB: [...new Set(parsedB.headerMappings.map((m) => m.original))].slice(0, 20),
      });

      alert(
        "Could not analyze the input. Please provide tabular data with at least entity_id, valid_from and valid_to columns."
      );

      resetAnalysis();
      return;
    }

    const patternA = detectSourcePattern(parsedA.rows);
    const patternB = detectSourcePattern(parsedB.rows);
    const combinedRows = [...parsedA.rows, ...parsedB.rows] as BitemporalRow[];
    const computedGaps = detectGaps(combinedRows);
    const computedOverlapMarkers = detectOverlapMarkers(combinedRows, mode);
    const computedDrifts = detectDrift(combinedRows);
    const computedJoinIssues = analyzeJoinability(
      combinedRows,
      sourceAName,
      sourceBName,
      mode
    );

    setRows(combinedRows);
    setHeaderMappingsA(parsedA.headerMappings);
    setHeaderMappingsB(parsedB.headerMappings);
    setColumnMappingA(parsedA.mapping);
    setColumnMappingB(parsedB.mapping);
    setGaps(computedGaps);
    setDrifts(computedDrifts);
    setOverlapMarkers(computedOverlapMarkers);
    setSelectedIssue(null);
    setSelectedTemporalIssue(null);
    setExpandedSources([sourceAName, sourceBName]);
    setSourcePatterns({
      sourceA: patternA,
      sourceB: patternB,
    });
    setJoinIssues(computedJoinIssues);
    setHasAnalyzed(true);
    setShowAssessmentGenerated(true);

    track("analysis_completed", {
      rowCount: combinedRows.length,
      sourceA: sourceAName,
      sourceB: sourceBName,
      hasUploadedA: !!fileNameA,
      hasUploadedB: !!fileNameB,
      ownData: !!fileNameA || !!fileNameB,
      joinIssues: computedJoinIssues.length,
      joinGaps: computedJoinIssues.filter((issue) => issue.type === "JOIN_GAP").length,
      ambiguities: computedJoinIssues.filter((issue) => issue.type === "JOIN_AMBIGUITY").length,
      validGaps: computedGaps.length,
      overlaps: computedOverlapMarkers.length,
      mode,
      snapshotActive: !!(asOfDate || visibleAsOf),
      hasValidAsOf: !!asOfDate,
      hasVisibleAsOf: !!visibleAsOf,
    });

    window.setTimeout(() => {
      setShowAssessmentGenerated(false);
    }, 4000);
  }

  function analyzeTwoSources() {
    setGuidedDemoStep(null);

    track("analyze_clicked", {
      hasBothSources: !!inputA.trim() && !!inputB.trim(),
      hasUploadedA: !!fileNameA,
      hasUploadedB: !!fileNameB,
      mode: validationMode,
      snapshotActive: !!(asOfDate || visibleAsOf),
    });

    if (!inputA.trim() || !inputB.trim()) {
      resetAnalysis();
      return;
    }

    analyzeTwoSourcesFromValues(
      inputA,
      inputB,
      sourceNameA,
      sourceNameB,
      validationMode
    );
  }

  function setValidationModeAndAnalyze(next: ValidationMode) {
    setValidationMode(next);

    if (inputA.trim() && inputB.trim() && hasAnalyzed) {
      analyzeTwoSourcesFromValues(inputA, inputB, sourceNameA, sourceNameB, next);
    }
  }

  function loadExample(isGuidedDemo = false) {
    track("example_loaded", {
      type: "default_example",
    });

    setPendingScrollTarget(isGuidedDemo ? "guidedDemo" : "validation");
    setInputA(EXAMPLE_A);
    setInputB(EXAMPLE_B);
    setFileNameA("");
    setFileNameB("");
    setSourceNameA("Source_A");
    setSourceNameB("Source_B");
    updateMappingsFromInputs(EXAMPLE_A, EXAMPLE_B);
    resetAnalysis();

    window.setTimeout(() => {
      analyzeTwoSourcesFromValues(
        EXAMPLE_A,
        EXAMPLE_B,
        "Source_A",
        "Source_B",
        validationMode
      );
    }, 0);
  }

  function loadGuidedDemo() {
    track("guided_demo_started");

    setDemoBeforeCount(null);
    setGuidedDemoStep(1);
    setSelectedIssue(null);
    setSelectedTemporalIssue(null);
    setAsOfDate("");
    setVisibleAsOf("2024-01-02T00:00");
    setSql("");
    setPendingScrollTarget("findings");

    loadExample(true);
  }

  function copySourceAToB() {
    track("copy_a_to_b");
    setInputB(inputA);
    updateMappingsFromInputs(inputA, inputA);
    resetAnalysis();
  }

  function scheduleHighlightRow(row: HighlightTarget | null) {
    setHighlightedRow(row);
  }

  function highlightFindingEntity(issue: any | null) {
    if (!issue || issue.isAggregated) {
      scheduleHighlightRow(null);
      return;
    }

    scheduleHighlightRow({
      entity_id: String(issue.entity_id),
    });
  }

  function selectTemporalIssue(issue: TemporalIssue | null) {
    setSelectedTemporalIssue(issue);
    highlightFindingEntity(issue);

    if (issue) {
      track("issue_selected", {
        type: issue.type,
        severity: issue.severity,
        hasUploadedA: !!fileNameA,
        hasUploadedB: !!fileNameB,
        hasOwnData: !!fileNameA || !!fileNameB,
        mode: validationMode,
      });
    }

    if (issue?.originalIssue?.kind === "join") {
      setSelectedIssue(issue.originalIssue.issue);
    } else {
      setSelectedIssue(null);
    }

    if (!guidedDemoStep) {
      window.setTimeout(() => {
        explanationRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    }
  }

  function selectJoinIssue(issue: AggregatedJoinabilityIssue | null) {
    setSelectedIssue(issue);
    highlightFindingEntity(issue);

    if (issue) {
      track("join_issue_selected", {
        type: issue.type,
        hasUploadedA: !!fileNameA,
        hasUploadedB: !!fileNameB,
        hasOwnData: !!fileNameA || !!fileNameB,
        mode: validationMode,
      });
    }

    if (!issue) {
      setSelectedTemporalIssue(null);
      return;
    }

    const matchingTemporalIssue =
      activeTemporalIssues.find(
        (temporalIssue) =>
          temporalIssue.originalIssue?.kind === "join" &&
          temporalIssue.originalIssue.issue === issue
      ) ?? null;

    setSelectedTemporalIssue(matchingTemporalIssue);

    if (!guidedDemoStep) {
      window.setTimeout(() => {
        explanationRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    }
  }

  function resetDates() {
    setAsOfDate("");
    setVisibleAsOf("");
    track("snapshot_cleared");
  }

  function generateSQL() {
    const sqlParts: string[] = [];

    if (asOfDate) {
      sqlParts.push(`'${asOfDate}' BETWEEN valid_from AND valid_to`);
    }

    if (visibleAsOf) {
      sqlParts.push(
        `'${visibleAsOf}' >= visible_from AND '${visibleAsOf}' < visible_to`
      );
    }

    if (sqlParts.length === 0) {
      setSql("");
      return;
    }

    track("sql_generated", {
      hasValidAsOf: !!asOfDate,
      hasVisibleAsOf: !!visibleAsOf,
      hasOwnData: !!fileNameA || !!fileNameB,
      mode: validationMode,
    });

    setSql(`SELECT *
FROM your_table
WHERE ${sqlParts.join(" AND ")};`);
  }

  function getPosition(date: string) {
    const current = new Date(date).getTime();
    return ((current - minDate) / (maxDate - minDate)) * 100;
  }

  function getWidth(from: string, to: string) {
    const fromTime = new Date(from).getTime();
    const toTime = new Date(to).getTime();
    const adjustedToTime = !to.includes("T")
      ? toTime + 24 * 60 * 60 * 1000
      : toTime;

    return ((adjustedToTime - fromTime) / (maxDate - minDate)) * 100;
  }

  function scrollToElement(element: HTMLElement | null, offset = 90) {
    if (!element) return;

    const target = element.getBoundingClientRect().top + window.scrollY - offset;

    window.scrollTo({
      top: Math.max(target, 0),
      behavior: "smooth",
    });
  }

  useEffect(() => {
    generateSQL();
  }, [asOfDate, visibleAsOf]);

  useEffect(() => {
    if (!hasAnalyzed || !pendingScrollTarget) return;

    const timeout = window.setTimeout(() => {
      requestAnimationFrame(() => {
        const target =
          pendingScrollTarget === "guidedDemo"
            ? guidedDemoRef.current
            : pendingScrollTarget === "validationContext"
            ? validationContextRef.current
            : pendingScrollTarget === "snapshotActive"
            ? snapshotActiveRef.current
            : pendingScrollTarget === "findings"
            ? analysisRef.current
            : validationResultTopRef.current;

        if (!target) return;

        scrollToElement(target, 10);
        setPendingScrollTarget(null);
      });
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [hasAnalyzed, pendingScrollTarget]);

  useEffect(() => {
    if (guidedDemoStep === 1 && (selectedIssue || selectedTemporalIssue)) {
      track("guided_demo_finding_selected");
      setGuidedDemoStep(2);
      setPendingScrollTarget("validationContext");
    }
  }, [guidedDemoStep, selectedIssue, selectedTemporalIssue]);

  return (
    <details
      style={{
        marginTop: 24,
        marginBottom: 24,
        padding: 18,
        borderRadius: 16,
        border: "1px solid #334155",
        background: "#020617",
      }}
    >
      <summary
        style={{
          cursor: "pointer",
          color: "#ffffff",
          fontWeight: 900,
          fontSize: 18,
          listStylePosition: "inside",
        }}
      >
        Advanced Historical Source Comparison
        <div
          style={{
            marginTop: 6,
            color: "#94a3b8",
            fontSize: 13,
            fontWeight: 500,
            lineHeight: 1.45,
          }}
        >
          Compare two historized sources when you need row-level timeline evidence,
          temporal joins or overlap diagnostics.
        </div>
      </summary>

      <TwoSourceInputPanel
        fileNameA={fileNameA}
        fileNameB={fileNameB}
        onUploadA={(event) => loadCsvFile(event, "A")}
        onUploadB={(event) => loadCsvFile(event, "B")}
        inputA={inputA}
        inputB={inputB}
        setInputA={(value) => {
          setGuidedDemoStep(null);
          setInputA(value);
          if (!value.trim()) resetAnalysis();
          updateMappingForSourceA(value);
        }}
        setInputB={(value) => {
          setGuidedDemoStep(null);
          setInputB(value);
          if (!value.trim()) resetAnalysis();
          updateMappingForSourceB(value);
        }}
        sourceNameA={sourceNameA}
        sourceNameB={sourceNameB}
        setSourceNameA={setSourceNameA}
        setSourceNameB={setSourceNameB}
        onAnalyze={analyzeTwoSources}
        onLoadExample={() => loadExample(false)}
        onLoadGuidedDemo={loadGuidedDemo}
        onCopyAtoB={copySourceAToB}
        analysisModeControl={
          <div>
            <label style={{ fontSize: 12, color: "#94a3b8" }}>
              Temporal validation mode
            </label>
            <br />
            <select
              value={validationMode}
              onChange={(event) =>
                setValidationModeAndAnalyze(event.target.value as ValidationMode)
              }
              style={{
                padding: "8px 10px",
                borderRadius: 8,
                border: "1px solid #334155",
                background: "#020617",
                color: "#e2e8f0",
              }}
            >
              <option value="monotemporal">Valid-time only</option>
              <option value="bitemporal">Bitemporal</option>
            </select>
          </div>
        }
        controls={
          <ColumnMappingControls
            maxColumns={maxColumns}
            setMaxColumns={(value) => {
              setMaxColumns(value);
              updateMappingsFromInputs(inputA, inputB);
              resetAnalysis();
            }}
            showMapping={showMapping}
            setShowMapping={setShowMapping}
            headerMappingsA={headerMappingsA}
            headerMappingsB={headerMappingsB}
            columnMappingA={columnMappingA}
            columnMappingB={columnMappingB}
            setColumnMappingA={setColumnMappingA}
            setColumnMappingB={setColumnMappingB}
          />
        }
      />

      {hasAnalyzed && (
        <div>
          <div
            ref={validationResultTopRef}
            style={{
              scrollMarginTop: 96,
              marginBottom: 16,
              padding: showAssessmentGenerated ? "12px 16px" : "0 16px",
              minHeight: showAssessmentGenerated ? 45 : 1,
              borderRadius: 10,
              background: showAssessmentGenerated ? "#ecfdf5" : "transparent",
              border: showAssessmentGenerated
                ? "1px solid #22c55e"
                : "1px solid transparent",
              color: "#166534",
              fontWeight: 700,
              textAlign: "center",
              opacity: showAssessmentGenerated ? 1 : 0,
              transition: "opacity 0.2s ease",
            }}
          >
            ✓ Validation Complete
          </div>

          <AssessmentPanel
            sourcePatterns={sourcePatterns}
            relationshipAnalysis={relationshipAnalysis}
            relationshipComplexityStyle={relationshipComplexityStyle}
            historicalPatterns={historicalPatterns}
            isMobile={isMobile}
            analysisRef={analysisRef}
            validationContextRef={validationContextRef}
            guidedDemoStep={guidedDemoStep}
            asOfDate={asOfDate}
            visibleAsOf={visibleAsOf}
            setAsOfDate={setAsOfDate}
            setVisibleAsOf={setVisibleAsOf}
            resetDates={resetDates}
          />
        </div>
      )}

      {hasAnalyzed && (
        <>
          {snapshotActive && (
            <div
              ref={snapshotActiveRef}
              style={{
                scrollMarginTop: 96,
                marginBottom: 16,
                padding: 14,
                borderRadius: 12,
                background: "#1e3a8a",
                border: "1px solid #3b82f6",
                color: "#dbeafe",
              }}
            >
              <div style={{ fontWeight: 700, marginBottom: 10 }}>
                Historical Snapshot Active
              </div>

              <div
                style={{
                  display: "flex",
                  gap: 24,
                  flexWrap: "wrap",
                  marginBottom: 10,
                  fontSize: 13,
                }}
              >
                {asOfDate && (
                  <div>
                    <strong>Valid Time:</strong> {asOfDate}
                  </div>
                )}

                {visibleAsOf && (
                  <div>
                    <strong>Visible Time:</strong> {visibleAsOf}
                  </div>
                )}
              </div>

              <div style={{ fontSize: 13, opacity: 0.95 }}>
                Showing {activeTemporalIssuesWithSnapshotDrift.length} findings
                for the active snapshot.
              </div>
            </div>
          )}

          <div
            ref={analysisRef}
            style={{
              scrollMarginTop: 96,
              width: "100%",
              boxSizing: "border-box",
              display: "grid",
              gridTemplateColumns: "1fr",
              gap: 20,
              alignItems: "start",
              marginBottom: 20,
            }}
          >
            <div style={{ width: "100%", minWidth: 0, overflow: "hidden" }}>
              <GuidedDemoPanel
                guidedDemoStep={guidedDemoStep}
                guidedDemoRef={guidedDemoRef}
                demoBeforeCount={demoBeforeCount}
                activeMissingMatchCount={activeMissingMatchCount}
                setDemoBeforeCount={setDemoBeforeCount}
                setVisibleAsOf={setVisibleAsOf}
                setGuidedDemoStep={setGuidedDemoStep}
                setPendingScrollTarget={setPendingScrollTarget}
                selectJoinIssue={selectJoinIssue}
                selectTemporalIssue={selectTemporalIssue}
                setAsOfDate={setAsOfDate}
                setSql={setSql}
              />

              <IssuesPanel
                joinIssues={activeJoinIssues}
                selectedIssue={selectedIssue}
                setSelectedIssue={selectJoinIssue}
                temporalIssues={activeTemporalIssuesWithSnapshotDrift}
                selectedTemporalIssue={selectedTemporalIssue}
                onSelectTemporalIssue={selectTemporalIssue}
                hasAnalyzed={hasAnalyzed}
                showIssueDetails={hasSelectedFinding}
                initialFilter={
                  guidedDemoStep === 1 || guidedDemoStep === 2
                    ? "JOIN_GAP"
                    : "ALL"
                }
              />

              {!hasActiveFindings && (
                <div
                  style={{
                    marginTop: 16,
                    padding: 24,
                    background: "#ecfdf5",
                    borderRadius: 12,
                    border: "1px solid #86efac",
                    color: "#166534",
                    textAlign: "center",
                    fontSize: 14,
                    fontWeight: 700,
                    lineHeight: 1.5,
                  }}
                >
                  ✓ No validation findings detected for the selected snapshot.
                </div>
              )}

              {hasSelectedFinding && (
                <div ref={explanationRef} style={{ scrollMarginTop: 96 }}>
                  <IssueWhyPanel
                    selectedIssue={selectedIssue}
                    selectedTemporalIssue={selectedTemporalIssue}
                  />
                </div>
              )}

              {hasSelectedFinding && (
                <div ref={timelineRef} style={{ marginTop: 20 }}>
                  <h3
                    style={{
                      margin: "0 0 8px",
                      color: "#ffffff",
                      fontSize: 20,
                    }}
                  >
                    Timeline Evidence
                  </h3>

                  <p
                    style={{
                      margin: "0 0 12px",
                      color: "#94a3b8",
                      fontSize: 13,
                    }}
                  >
                    See how the selected finding appears across valid-time and
                    visible-time.
                  </p>

                  <Timeline
                    rows={activeRows}
                    gaps={activeGaps}
                    overlapMarkers={activeOverlapMarkers}
                    selectedIssue={selectedIssue}
                    temporalIssues={activeTemporalIssuesWithSnapshotDrift}
                    selectedTemporalIssue={selectedTemporalIssue}
                    onSelectTemporalIssue={selectTemporalIssue}
                    getPosition={getPosition}
                    getWidth={getWidth}
                    highlightedEntityId={highlightedRow?.entity_id ?? null}
                  />

                  <TimelineLegend />
                </div>
              )}
            </div>

            {snapshotActive && <SqlPanel sql={sql} />}
          </div>

          {hasSelectedFinding && (
            <>
              <div style={{ margin: isMobile ? "16px 0 10px" : "24px 0 12px" }}>
                <h3 style={{ margin: 0, color: "#ffffff", fontSize: 20 }}>
                  Underlying Source Records
                </h3>

                <p
                  style={{
                    margin: "6px 0 0",
                    color: "#94a3b8",
                    fontSize: 13,
                    lineHeight: 1.5,
                  }}
                >
                  Review the source rows behind the selected finding and verify
                  whether the detected behavior is expected.
                </p>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                  gap: 20,
                  marginBottom: 20,
                }}
              >
                <DataPreview
                  title={`Raw source records: ${sourceNameA}`}
                  rows={sourceRecordRowsA}
                  joinIssues={activeJoinIssues}
                  onSelectIssue={selectJoinIssue}
                  highlightedRow={highlightedRow}
                  onHighlightRow={scheduleHighlightRow}
                  forceOpen={hasSelectedFinding || expandedSources.includes(sourceNameA)}
                  overlapMarkers={activeOverlapMarkers}
                />

                <DataPreview
                  title={`Raw source records: ${sourceNameB}`}
                  rows={sourceRecordRowsB}
                  joinIssues={activeJoinIssues}
                  onSelectIssue={selectJoinIssue}
                  highlightedRow={highlightedRow}
                  onHighlightRow={scheduleHighlightRow}
                  forceOpen={hasSelectedFinding || expandedSources.includes(sourceNameB)}
                  overlapMarkers={activeOverlapMarkers}
                />
              </div>
            </>
          )}
        </>
      )}
    </details>
  );
}

function ColumnMappingControls({
  maxColumns,
  setMaxColumns,
  showMapping,
  setShowMapping,
  headerMappingsA,
  headerMappingsB,
  columnMappingA,
  columnMappingB,
  setColumnMappingA,
  setColumnMappingB,
}: {
  maxColumns: number | "all";
  setMaxColumns: (value: number | "all") => void;
  showMapping: boolean;
  setShowMapping: (value: boolean) => void;
  headerMappingsA: HeaderMapping[];
  headerMappingsB: HeaderMapping[];
  columnMappingA: Record<string, string>;
  columnMappingB: Record<string, string>;
  setColumnMappingA: (value: Record<string, string>) => void;
  setColumnMappingB: (value: Record<string, string>) => void;
}) {
  return (
    <div
      style={{
        marginTop: 8,
        background: "#111827",
        border: "1px solid #334155",
        borderRadius: 10,
        padding: "10px 16px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 24,
          flexWrap: "wrap",
          marginBottom: showMapping ? 12 : 0,
        }}
      >
        <div>
          <label style={{ fontSize: 12, color: "#94a3b8" }}>
            Column scope
          </label>
          <br />
          <select
            value={maxColumns}
            onChange={(event) => {
              const value =
                event.target.value === "all" ? "all" : Number(event.target.value);
              setMaxColumns(value);
            }}
            style={{
              marginTop: 4,
              padding: "6px 8px",
              borderRadius: 8,
              border: "1px solid #334155",
              background: "#020617",
              color: "#e2e8f0",
              fontSize: 12,
            }}
          >
            <option value={6}>Use first 6 columns</option>
            <option value={8}>Use first 8 columns</option>
            <option value={12}>Use first 12 columns</option>
            <option value="all">Use all columns</option>
          </select>
        </div>

        {(headerMappingsA.length > 0 || headerMappingsB.length > 0) && (
          <button
            type="button"
            onClick={() => setShowMapping(!showMapping)}
            style={{
              background: "transparent",
              border: "none",
              padding: 0,
              color: "#94a3b8",
              fontSize: 13,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            {showMapping ? "▼ Hide column mapping" : "✓ Auto-mapped columns · Click to review"}
          </button>
        )}
      </div>

      {showMapping && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 12,
            background: "#0f172a",
            border: "1px solid #1e293b",
            borderRadius: 10,
            padding: 12,
            marginTop: 12,
          }}
        >
          <MappingBox
            title="Source A mapping"
            headerMappings={headerMappingsA}
            columnMapping={columnMappingA}
            setColumnMapping={setColumnMappingA}
          />

          <MappingBox
            title="Source B mapping"
            headerMappings={headerMappingsB}
            columnMapping={columnMappingB}
            setColumnMapping={setColumnMappingB}
          />
        </div>
      )}
    </div>
  );
}

function MappingBox({
  title,
  headerMappings,
  columnMapping,
  setColumnMapping,
}: {
  title: string;
  headerMappings: HeaderMapping[];
  columnMapping: Record<string, string>;
  setColumnMapping: (value: Record<string, string>) => void;
}) {
  return (
    <div
      style={{
        border: "1px solid #1e293b",
        borderRadius: 8,
        padding: 10,
        background: "#020617",
      }}
    >
      <div style={{ fontSize: 12, color: "#e2e8f0", marginBottom: 8 }}>
        {title}
      </div>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        {headerMappings.map((mapping, index) => (
          <div key={`${mapping.original}-${index}`}>
            <div style={{ fontSize: 10, color: "#64748b" }}>
              {mapping.original}
            </div>

            <select
              value={columnMapping[mapping.original] ?? mapping.normalized}
              onChange={(event) => {
                setColumnMapping({
                  ...columnMapping,
                  [mapping.original]: event.target.value,
                });
              }}
              style={{
                padding: "4px 6px",
                borderRadius: 6,
                border: "1px solid #334155",
                background: "#020617",
                color: "#e2e8f0",
                fontSize: 12,
              }}
            >
              <option value="entity_id">entity_id</option>
              <option value="valid_from">valid_from</option>
              <option value="valid_to">valid_to</option>
              <option value="visible_from">visible_from</option>
              <option value="visible_to">visible_to</option>
              <option value="value">value</option>
              <option value="">ignore</option>
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}

function getComplexityStyle(complexity: "Low" | "Medium" | "High") {
  if (complexity === "Low") {
    return {
      label: "Low Modeling Effort",
      background: "#dcfce7",
      border: "#86efac",
      color: "#166534",
    };
  }

  if (complexity === "Medium") {
    return {
      label: "Medium Modeling Effort",
      background: "#fef3c7",
      border: "#fcd34d",
      color: "#92400e",
    };
  }

  return {
    label: "High Validation Risk",
    background: "#fee2e2",
    border: "#fca5a5",
    color: "#991b1b",
  };
}