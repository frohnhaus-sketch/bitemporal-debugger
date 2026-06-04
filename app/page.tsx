"use client";
import {
  analyzeSourceRelationship,
  detectHistoricalPatterns,
} from "@/lib/sourceRelationships";
import { buildTemporalIssues } from "../lib/temporalIssues";
import type { TemporalIssue } from "../lib/types";
import { track } from "@/lib/analytics";
import { TwoSourceInputPanel } from "@/components/TwoSourceInputPanel";
import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { parseCSV } from "../lib/parser";
import type { HeaderMapping } from "../lib/parser";
import { Timeline } from "@/components/Timeline";
import { analyzeJoinability } from "../lib/joinability";
import type {
  BitemporalRow,
  AggregatedJoinabilityIssue,
  OverlapIssue,
  ValidationMode,
  DriftSummary,
  HighlightTarget,
} from "../lib/types";
import {
  detectDrift,
  detectGaps,
  detectOverlapMarkers,
} from "../lib/analysis";
import { TimelineLegend } from "@/components/TimelineLegend";
import { Analytics } from "@vercel/analytics/next";
import { Footer } from "@/components/Footer";
import { SqlPanel } from "@/components/SqlPanel";
import { IssuesPanel } from "@/components/IssuesPanel";
import { DataPreview } from "@/components/DataPreview";
import {
  detectSourcePattern,
  type SourcePatternResult,
} from "@/lib/sourcePatterns";

const EXAMPLE_A = `entity_id,value,valid_from,valid_to,visible_from,visible_to
1,contract_active,2024-01-01,2024-12-31,2024-01-01T00:00:00,2024-06-01T00:00:00
2,contract_active,2024-01-01,2024-12-31,2024-01-01T00:00:00,9999-12-31T00:00:00
3,contract_active,2024-01-01,2024-12-31,2024-01-01T00:00:00,9999-12-31T00:00:00
4,contract_active,2024-01-01,2024-03-31,2024-01-01T00:00:00,9999-12-31T00:00:00
4,contract_active,2024-05-01,2024-12-31,2024-01-01T00:00:00,9999-12-31T00:00:00
5,contract_active,2024-01-01,2024-12-31,2024-01-01T00:00:00,9999-12-31T00:00:00`;

const EXAMPLE_B = `entity_id,value,valid_from,valid_to,visible_from,visible_to
1,object_active,2024-01-01,2024-12-31,2024-07-01T00:00:00,9999-12-31T00:00:00
2,object_active,2024-04-01,2024-12-31,2024-01-01T00:00:00,9999-12-31T00:00:00
3,object_v1,2024-01-01,2024-12-31,2024-01-01T00:00:00,2024-12-31T00:00:00
3,object_v2,2024-01-01,2024-12-31,2025-01-01T00:00:00,9999-12-31T00:00:00
5,object_v1,2024-01-01,2024-12-31,2024-01-01T00:00:00,9999-12-31T00:00:00
5,object_v2,2024-01-01,2024-12-31,2024-01-01T00:00:00,9999-12-31T00:00:00`;

export default function Home() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth < 900);

    update();
    window.addEventListener("resize", update);

    return () => window.removeEventListener("resize", update);
  }, []);
  const [showMapping, setShowMapping] = useState(false);
  const [maxColumns, setMaxColumns] = useState<number | "all">(8);
  const [fileNameA, setFileNameA] = useState("");
  const [fileNameB, setFileNameB] = useState("");
  const [expandedSources, setExpandedSources] = useState<string[]>([]);
  const [highlightedRow, setHighlightedRow] = useState<HighlightTarget | null>(null);
  const [headerMappingsA, setHeaderMappingsA] = useState<HeaderMapping[]>([]);
  const [headerMappingsB, setHeaderMappingsB] = useState<HeaderMapping[]>([]);
  const [columnMappingA, setColumnMappingA] = useState<Record<string, string>>({});
  const [columnMappingB, setColumnMappingB] = useState<Record<string, string>>({});
  const [rows, setRows] = useState<BitemporalRow[]>([]);
  const [joinIssues, setJoinIssues] = useState<AggregatedJoinabilityIssue[]>([]);
  const [selectedIssue, setSelectedIssue] = useState<AggregatedJoinabilityIssue | null>(null);
  const [selectedTemporalIssue, setSelectedTemporalIssue] = useState<TemporalIssue | null>(null);
  const [inputA, setInputA] = useState("");
  const [inputB, setInputB] = useState("");
  const [sourceNameA, setSourceNameA] = useState("source_a");
  const [sourceNameB, setSourceNameB] = useState("source_b");
  const [gaps, setGaps] = useState<any[]>([]);
  const [drifts, setDrifts] = useState<DriftSummary[]>([]);
  const [overlapMarkers, setOverlapMarkers] = useState<OverlapIssue[]>([]);
  const [asOfDate, setAsOfDate] = useState("");
  const [visibleAsOf, setVisibleAsOf] = useState("");
  const [sql, setSql] = useState("")
  const [validationMode, setValidationMode] = useState<ValidationMode>("monotemporal");
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const [showAssessmentGenerated, setShowAssessmentGenerated] =
    useState(false);
  const [sourcePatterns, setSourcePatterns] = useState<{
    sourceA: SourcePatternResult | null;
    sourceB: SourcePatternResult | null;
  }>({
    sourceA: null,
    sourceB: null,
  });
  const timelineRef = useRef<HTMLDivElement | null>(null);
  const analysisRef = useRef<HTMLDivElement>(null);
  const assessmentRef = useRef<HTMLDivElement>(null);
  const highlightTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function scheduleHighlightRow(row: HighlightTarget | null) {
    if (highlightTimeoutRef.current) {
      clearTimeout(highlightTimeoutRef.current);
    }

    highlightTimeoutRef.current = setTimeout(() => {
      setHighlightedRow(row);
    }, 300);
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

  useEffect(() => {
    track("page_view");
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

    mappings.forEach((m) => {
      nextMapping[m.original] = currentMapping[m.original] ?? m.normalized;
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
    setColumnMappingA(buildColumnMapping(parsedA.headerMappings, columnMappingA));
  }

  function updateMappingForSourceB(nextInputB = inputB) {
    if (!nextInputB.trim()) {
      setHeaderMappingsB([]);
      setColumnMappingB({});
      return;
    }

    const parsedB = parseCSV(nextInputB, { maxColumns });
    setHeaderMappingsB(parsedB.headerMappings);
    setColumnMappingB(buildColumnMapping(parsedB.headerMappings, columnMappingB));
  }

  function updateMappingsFromInputs(nextInputA = inputA, nextInputB = inputB) {
    if (nextInputA.trim()) {
      const parsedA = parseCSV(nextInputA, { maxColumns });
      setHeaderMappingsA(parsedA.headerMappings);
      setColumnMappingA(buildColumnMapping(parsedA.headerMappings, columnMappingA));
    } else {
      setHeaderMappingsA([]);
      setColumnMappingA({});
    }

    if (nextInputB.trim()) {
      const parsedB = parseCSV(nextInputB, { maxColumns });
      setHeaderMappingsB(parsedB.headerMappings);
      setColumnMappingB(buildColumnMapping(parsedB.headerMappings, columnMappingB));
    } else {
      setHeaderMappingsB([]);
      setColumnMappingB({});
    }
  }

  function loadExample() {
    track("example_loaded", {
      type: "default_example"
    });

    setInputA(EXAMPLE_A);
    setInputB(EXAMPLE_B);
    setFileNameA("");
    setFileNameB("");
    setSourceNameA("Source_A");
    setSourceNameB("Source_B");
    updateMappingsFromInputs(EXAMPLE_A, EXAMPLE_B);

    resetAnalysis();

    setTimeout(() => {
      analyzeTwoSourcesFromValues(
        EXAMPLE_A,
        EXAMPLE_B,
        "Source_A",
        "Source_B",
        validationMode
      );
    }, 0);
  }

  function copySourceAToB() {
    track("copy_a_to_b");
    setInputB(inputA);
    updateMappingsFromInputs(inputA, inputA);
    resetAnalysis();
  }

  function applyColumnMapping(
    rows: any[],
    mappings: HeaderMapping[],
    activeMapping: Record<string, string>
  ) {
    return rows.map((row) => {
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
    parsed.headerMappings.forEach((m) => {
      initialMapping[m.original] = m.normalized;
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

  const REQUIRED_COLUMNS = ["entity_id", "valid_from", "valid_to"];

  function hasRequiredColumns(parsedRows: any[]) {
    if (parsedRows.length === 0) return false;

    return REQUIRED_COLUMNS.every((column) =>
      Object.prototype.hasOwnProperty.call(parsedRows[0], column)
    );
  }

  function slowScrollTo(element: HTMLElement) {
    const target =
      element.getBoundingClientRect().top +
      window.scrollY -
      20;
  
    const start = window.scrollY;
    const distance = target - start;
  
    const duration = 1200; // 1.2 Sekunden
  
    let startTime: number | null = null;
  
    function animate(currentTime: number) {
      if (!startTime) startTime = currentTime;
    
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
    
      const ease =
        1 - Math.pow(1 - progress, 3);
    
      window.scrollTo(
        0,
        start + distance * ease
      );
    
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    }
  
    requestAnimationFrame(animate);
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

    const parsedA = parseOneSource(
      rawA,
      sourceAName || "source_a",
      columnMappingA
    );

    const parsedB = parseOneSource(
      rawB,
      sourceBName || "source_b",
      columnMappingB
    );

    const patternA = detectSourcePattern(parsedA.rows);
    const patternB = detectSourcePattern(parsedB.rows);

    if (
      !hasRequiredColumns(parsedA.rows) ||
      !hasRequiredColumns(parsedB.rows)
    ) {
      track("analysis_failed", {
        reason: "missing_required_columns",
        sourceA: sourceAName,
        sourceB: sourceBName,
        mode,
      });

      alert(
        "Could not analyze the input. Please provide tabular data with at least entity_id, valid_from and valid_to columns."
      );

      resetAnalysis();
      return;
    }

    const combinedRows = [...parsedA.rows, ...parsedB.rows] as BitemporalRow[];

    setRows(combinedRows);
    setHeaderMappingsA(parsedA.headerMappings);
    setHeaderMappingsB(parsedB.headerMappings);
    setColumnMappingA(parsedA.mapping);
    setColumnMappingB(parsedB.mapping);

    setGaps(detectGaps(combinedRows));
    setDrifts(detectDrift(combinedRows));
    setOverlapMarkers(detectOverlapMarkers(combinedRows, mode));
    setSelectedIssue(null);
    setSelectedTemporalIssue(null);
    if (combinedRows.length > 0) {
      // beide Sources aufklappen
      setExpandedSources([sourceAName, sourceBName]);
    }

    const computedJoinIssues = analyzeJoinability(
      combinedRows,
      sourceAName,
      sourceBName,
      mode
    );

    track("analysis_completed", {
      rowCount: combinedRows.length,
      sourceA: sourceAName,
      sourceB: sourceBName,
      hasUploadedA: !!fileNameA,
      hasUploadedB: !!fileNameB,
      ownData: !!fileNameA || !!fileNameB,
      joinIssues: computedJoinIssues.length,
      joinGaps: computedJoinIssues.filter((i) => i.type === "JOIN_GAP").length,
      ambiguities: computedJoinIssues.filter((i) => i.type === "JOIN_AMBIGUITY").length,
      validGaps: detectGaps(combinedRows).length,
      overlaps: detectOverlapMarkers(combinedRows, mode).length,
      mode,
      snapshotActive: !!(asOfDate || visibleAsOf),
      hasValidAsOf: !!asOfDate,
      hasVisibleAsOf: !!visibleAsOf,
    });

    setSourcePatterns({
      sourceA: patternA,
      sourceB: patternB,
    });

    setJoinIssues(computedJoinIssues);
    setHasAnalyzed(true);

    setShowAssessmentGenerated(true);
      
    setTimeout(() => {
      setShowAssessmentGenerated(false);
    }, 2500);

    setTimeout(() => {
      if (assessmentRef.current) {
        slowScrollTo(assessmentRef.current);
      }
    }, 100);
  }

  function analyzeTwoSources() {
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
      analyzeTwoSourcesFromValues(
        inputA,
        inputB,
        sourceNameA,
        sourceNameB,
        next
      );
    }
  }

  function resetDates() {
    setAsOfDate("");
    setVisibleAsOf("");
    track("snapshot_cleared");
  }

  function getPosition(date: string) {
    const current = new Date(date).getTime();
    return ((current - minDate) / (maxDate - minDate)) * 100;
  }

  function getWidth(from: string, to: string) {
    const fromTime = new Date(from).getTime();
    const toTime = new Date(to).getTime();

    const isDateOnly = !to.includes("T");
    const adjustedToTime = isDateOnly
      ? toTime + 24 * 60 * 60 * 1000
      : toTime;

    return ((adjustedToTime - fromTime) / (maxDate - minDate)) * 100;
  }

  function getSourceColor(source: string) {
    return source === sourceNameA ? "#475569" : "#64748b";
  }

  const snapshotRows = rows.filter((r) => {
    const validOk = asOfDate
      ? new Date(asOfDate) >= new Date(r.valid_from) &&
        new Date(asOfDate) <= new Date(r.valid_to)
      : true;

    const visibleOk = visibleAsOf
      ? new Date(visibleAsOf) >= new Date(r.visible_from) &&
        new Date(visibleAsOf) < new Date(r.visible_to || "9999-12-31T00:00:00")
      : true;

    return validOk && visibleOk;
  });

  const snapshotActive = Boolean(asOfDate || visibleAsOf);

  const activeRows = useMemo(() => {
    if (!snapshotActive) return rows;

    return rows.filter((r) => {
      const validOk = asOfDate
        ? new Date(asOfDate) >= new Date(r.valid_from) &&
          new Date(asOfDate) <= new Date(r.valid_to)
        : true;

      const visibleOk = visibleAsOf
        ? new Date(visibleAsOf) >= new Date(r.visible_from) &&
          new Date(visibleAsOf) <
            new Date(r.visible_to || "9999-12-31T00:00:00")
        : true;

      return validOk && visibleOk;
    });
  }, [rows, asOfDate, visibleAsOf, snapshotActive]);

  const activeJoinIssues = useMemo(
    () =>
      analyzeJoinability(
        activeRows,
        sourceNameA,
        sourceNameB,
        validationMode
      ),
    [activeRows, sourceNameA, sourceNameB, validationMode]
  );

  const activeGaps = useMemo(
    () => detectGaps(activeRows),
    [activeRows]
  );

  const activeDrifts = useMemo(
    () => detectDrift(activeRows),
    [activeRows]
  );

  const activeOverlapMarkers = useMemo(
    () => detectOverlapMarkers(activeRows, validationMode),
    [activeRows, validationMode]
  );

  const activeTemporalIssues = useMemo(
    () =>
      buildTemporalIssues({
        joinIssues: activeJoinIssues,
        gaps: activeGaps,
        overlapMarkers: activeOverlapMarkers,
        drifts: activeDrifts,
        validationMode,
      }),
    [activeJoinIssues, activeGaps, activeOverlapMarkers, activeDrifts, validationMode]
  );

  function buildSourceSummary(sourceName: string) {
    const sourceRows = activeRows.filter((r) => r.source === sourceName);

    const entityIds = new Set(sourceRows.map((r) => String(r.entity_id)));

    const sourceGaps = activeGaps.filter((gap: any) => gap.source === sourceName);

    const sourceOverlaps = activeOverlapMarkers.filter(
      (overlap) => overlap.source === sourceName
    );

    const validTimeOverlaps = detectOverlapMarkers(sourceRows, "monotemporal").length;
    const bitemporalOverlaps = detectOverlapMarkers(sourceRows, "bitemporal").length;

    const recordsPerEntity =
      entityIds.size > 0 ? sourceRows.length / entityIds.size : 0;

    return {
      sourceName,
      entities: entityIds.size,
      records: sourceRows.length,
      recordsPerEntity,
      gaps: sourceGaps.length,
      overlaps: sourceOverlaps.length,
      validTimeOverlaps,
      bitemporalOverlaps,
    };
  }

  const sourceSummaryA = buildSourceSummary(sourceNameA);
  const sourceSummaryB = buildSourceSummary(sourceNameB);

  const densityRatio =
    Math.max(
      sourceSummaryA.recordsPerEntity,
      sourceSummaryB.recordsPerEntity
    ) /
    Math.max(
      1,
      Math.min(
        sourceSummaryA.recordsPerEntity,
        sourceSummaryB.recordsPerEntity
      )
    );

  const denserSource =
    sourceSummaryA.recordsPerEntity >= sourceSummaryB.recordsPerEntity
      ? sourceSummaryA
      : sourceSummaryB;

  const temporalIssues = buildTemporalIssues({
    joinIssues,
    gaps,
    overlapMarkers,
    drifts,
    validationMode,
  });

  function selectTemporalIssue(issue: TemporalIssue | null) {
    setSelectedTemporalIssue(issue);

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
  }

  function selectJoinIssue(issue: AggregatedJoinabilityIssue | null) {
    setSelectedIssue(issue);

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
      temporalIssues.find(
        (temporalIssue) =>
          temporalIssue.originalIssue?.kind === "join" &&
          temporalIssue.originalIssue.issue === issue
      ) ?? null;

    setSelectedTemporalIssue(matchingTemporalIssue);
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

  useEffect(() => {
    generateSQL();
  }, [asOfDate, visibleAsOf]);

  const joinGapCount = joinIssues.filter((i) => i.type === "JOIN_GAP").length;
  const joinAmbiguityCount = joinIssues.filter(
    (i) => i.type === "JOIN_AMBIGUITY"
  ).length;

  const validGapCount = gaps.length;

  const relationshipAnalysis =
    sourcePatterns.sourceA && sourcePatterns.sourceB
      ? analyzeSourceRelationship(
          sourcePatterns.sourceA,
          sourcePatterns.sourceB
        )
      : null;

  const historicalPatterns = detectHistoricalPatterns(
    joinAmbiguityCount,
    joinGapCount,
    drifts.length
  );

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
      label: "High Modeling Effort",
      background: "#fee2e2",
      border: "#fca5a5",
      color: "#991b1b",
    };
  }

  const relationshipComplexityStyle = relationshipAnalysis
    ? getComplexityStyle(relationshipAnalysis.complexity)
    : null;

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0f172a",
        padding: isMobile ? "16px 10px" : "40px",
        fontFamily: "Inter, Arial, sans-serif",
        color: "#0f172a",
      }}
    >
    <div style={{ maxWidth: 1280, margin: "0 auto" }}>
      <section style={{ marginBottom: -12 }}>
        <div style={{ marginBottom: 28 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 10px",
              borderRadius: 999,
              background: "#e0f2fe",
              color: "#075985",
              fontSize: 12,
              fontWeight: 700,
              marginBottom: 12,
            }}
          >
            HISTORIZED DATA MODELING
          </div>
          <h1
            style={{
              margin: 0,
              fontSize: isMobile ? 32 : 42,
              lineHeight: 1.05,
              letterSpacing: "-0.04em",
              color: "#ffffff",
            }}
          >
            Understand and Debug Historical Data Models
          </h1>
          
          <p
            style={{
              margin: "12px 0 0",
              maxWidth: 760,
              fontSize: 18,
              lineHeight: 1.45,
              color: "#cbd5e1",
            }}
          >
            Identify historical modeling risks, temporal join issues and snapshot reproducibility problems before they reach production.
          </p>
          
          <p
            style={{
              margin: "8px 0 18px",
              maxWidth: 820,
              fontSize: 15,
              lineHeight: 1.45,
              color: "#cbd5e1",
            }}
          >
            Built for Data Engineers working with SCD2 dimensions, historized tables,
            snapshot reporting and temporal joins.
          </p>
        </div>
      </section>
        <TwoSourceInputPanel
          fileNameA={fileNameA}
          fileNameB={fileNameB}
          onUploadA={(event) => loadCsvFile(event, "A")}
          onUploadB={(event) => loadCsvFile(event, "B")}
          inputA={inputA}
          inputB={inputB}
          setInputA={(value) => {
            setInputA(value);
            if (!value.trim()) resetAnalysis();
            updateMappingForSourceA(value);
          }}
          setInputB={(value) => {
            setInputB(value);
            if (!value.trim()) resetAnalysis();
            updateMappingForSourceB(value);
          }}
          sourceNameA={sourceNameA}
          sourceNameB={sourceNameB}
          setSourceNameA={setSourceNameA}
          setSourceNameB={setSourceNameB}
          onAnalyze={analyzeTwoSources}
          onLoadExample={loadExample}
          onCopyAtoB={copySourceAToB}
          analysisModeControl={
            <div>
              <label style={{ fontSize: 12, color: "#94a3b8" }}>
                Temporal validation mode
              </label>
              <br />
              <select
                value={validationMode}
                onChange={(e) =>
                  setValidationModeAndAnalyze(e.target.value as ValidationMode)
                }
                style={{
                  padding: "8px 10px",
                  borderRadius: 8,
                  border: "1px solid #334155",
                  background: "#020617",
                  color: "#e2e8f0",
                }}
              >
                <option value="monotemporal">Valid-time only (strict)</option>
                <option value="bitemporal">Bitemporal (valid + visible time)</option>
              </select>
            </div>
          }
          controls={
            <div
              style={{
                marginTop: 8,
                background: "#111827",
                border: "1px solid #334155",
                boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                borderRadius: 10,
                padding: "10px 16px",
                marginBottom: 0,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-start",
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
                    onChange={(e) => {
                      const value =
                        e.target.value === "all" ? "all" : Number(e.target.value);
                      setMaxColumns(value);
                      updateMappingsFromInputs(inputA, inputB);
                      resetAnalysis();
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
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-1px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    {showMapping ? (
                      <>
                        ▼{" "}
                        <span style={{ color: "#2563eb", fontWeight: 700 }}>
                          Hide column mapping
                        </span>
                      </>
                    ) : (
                      <>
                        ✓ Auto-mapped columns{" "}
                        <span style={{ color: "#2563eb", fontWeight: 700 }}>
                          · Click to review
                        </span>
                      </>
                    )}
                  </button>
                )}
              </div>
              
              {showMapping && (
                <div
                  style={{
                    width: "100%",
                    background: "#0f172a",
                    border: "1px solid #1e293b",
                    borderRadius: 10,
                    padding: 12,
                    marginTop: 12,
                  }}
                >
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                      gap: 12,
                    }}
                  >
                    <div
                      style={{
                        border: "1px solid #1e293b",
                        borderRadius: 8,
                        padding: 10,
                        background: "#020617",
                      }}
                    >
                      <div style={{ fontSize: 12, color: "#e2e8f0", marginBottom: 8 }}>
                        Source A mapping
                      </div>
                    
                      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                        {headerMappingsA.map((m, i) => (
                          <div key={`a-${m.original}-${i}`}>
                            <div style={{ fontSize: 10, color: "#64748b" }}>
                              {m.original}
                            </div>
                        
                            <select
                              value={columnMappingA[m.original] ?? m.normalized}
                              onChange={(e) => {
                                setColumnMappingA({
                                  ...columnMappingA,
                                  [m.original]: e.target.value,
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
                      
                    <div
                      style={{
                        border: "1px solid #1e293b",
                        borderRadius: 8,
                        padding: 10,
                        background: "#020617",
                      }}
                    >
                      <div style={{ fontSize: 12, color: "#e2e8f0", marginBottom: 8 }}>
                        Source B mapping
                      </div>
                    
                      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                        {headerMappingsB.map((m, i) => (
                          <div key={`b-${m.original}-${i}`}>
                            <div style={{ fontSize: 10, color: "#64748b" }}>
                              {m.original}
                            </div>
                        
                            <select
                              value={columnMappingB[m.original] ?? m.normalized}
                              onChange={(e) => {
                                setColumnMappingB({
                                  ...columnMappingB,
                                  [m.original]: e.target.value,
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
                  </div>
                </div>
              )}
            </div>
          }
        />
        {hasAnalyzed && (
          <div ref={assessmentRef}>
            {showAssessmentGenerated && (
              <div
                style={{
                  marginBottom: 16,
                  padding: "12px 16px",
                  borderRadius: 10,
                  background: "#ecfdf5",
                  border: "1px solid #22c55e",
                  color: "#166534",
                  fontWeight: 700,
                  textAlign: "center",
                }}
              >
                ✓ Historical Modeling Assessment ready
              </div>
            )}
            {sourcePatterns.sourceA && sourcePatterns.sourceB && (
              <>
              <section
                style={{
                  background: "#ffffff",
                  border: "1px solid #e5e7eb",
                  borderRadius: 16,
                  padding: 20,
                  marginTop: 18,
                  marginBottom: 18,
                }}
              >
                <h2 style={{ marginTop: 0 }}>Historical Modeling Assessment</h2>

                <div
                  style={{
                    padding: 16,
                    borderRadius: 12,
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      textTransform: "uppercase",
                      letterSpacing: 0.7,
                      color: "#64748b",
                      marginBottom: 8,
                    }}
                  >
                    Detected Source Relationship
                  </div>

                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: 800,
                      marginBottom: 8,
                    }}
                  >
                    {relationshipAnalysis?.relationship}
                  </div>

                  {relationshipComplexityStyle && (
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        padding: "6px 10px",
                        borderRadius: 999,
                        background: relationshipComplexityStyle.background,
                        border: `1px solid ${relationshipComplexityStyle.border}`,
                        color: relationshipComplexityStyle.color,
                        fontSize: 12,
                        fontWeight: 800,
                        marginBottom: 0,
                      }}
                    >
                      {relationshipComplexityStyle.label}
                    </div>
                  )}

                  <div style={{ marginTop: 16, marginBottom: 16 }}>
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 800,
                        textTransform: "uppercase",
                        letterSpacing: 0.7,
                        color: "#64748b",
                        marginBottom: 8,
                      }}
                    >
                      Recommended Modeling Strategy
                    </div>

                    <div
                      style={{
                        fontSize: 22,
                        fontWeight: 800,
                        lineHeight: 1.25,
                      }}
                    >
                      {relationshipAnalysis?.recommendation}
                    </div>
                    
                    <div
                      style={{
                        marginTop: 8,
                        fontSize: 13,
                        color: "#64748b",
                      }}
                    >
                      Pattern: <strong>{relationshipAnalysis?.recommendedPattern}</strong>
                    </div>
                  </div>

                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      textTransform: "uppercase",
                      letterSpacing: 0.7,
                      color: "#64748b",
                      marginTop: 12,
                      marginBottom: 8,
                    }}
                  >
                    Expected Modeling Challenges
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 8,
                      marginBottom: 16,
                    }}
                  >
                    {relationshipAnalysis?.challenges.map((challenge) => (
                      <div
                        key={challenge}
                        style={{
                          background: "#f1f5f9",
                          border: "1px solid #cbd5e1",
                          borderRadius: 999,
                          padding: "6px 10px",
                          fontSize: 13,
                        }}
                      >
                        {challenge}
                      </div>
                    ))}
                  </div>
                {historicalPatterns.length > 0 && (
                  <div
                    style={{
                      marginTop: 20,
                      paddingTop: 16,
                      borderTop: "1px solid #e2e8f0",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 800,
                        textTransform: "uppercase",
                        letterSpacing: 0.7,
                        color: "#64748b",
                        marginBottom: 8,
                      }}
                    >
                      Detected Historical Modeling Patterns
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        color: "#64748b",
                        marginBottom: 12,
                      }}
                    >
                      Click a pattern to investigate the underlying findings.
                    </div>
                    {historicalPatterns.map((pattern) => {
                      const isPossiblePattern =
                        pattern.name.startsWith("Possible");
                    
                      return (
                        <div
                          key={pattern.name}
                          style={{
                            background: isPossiblePattern
                              ? "#fffbeb"
                              : "#fef2f2",
                            cursor: "pointer",
                            transition: "all 0.15s ease",
                            border: isPossiblePattern
                              ? "1px solid #fde68a"
                              : "1px solid #fecaca",
                            borderRadius: 10,
                            padding: 12,
                            marginBottom: 8,
                          }}
                          onClick={() => {
                            analysisRef.current?.scrollIntoView({
                              behavior: "smooth",
                              block: "start",
                            });
                          }}
                        >
                          <div
                            style={{
                              fontWeight: 800,
                              marginBottom: 4,
                              color: isPossiblePattern
                                ? "#92400e"
                                : "#b91c1c",
                            }}
                          >
                            {pattern.name}
                          </div>
                          
                          <div
                            style={{
                              fontSize: 13,
                              color: "#334155",
                            }}
                          >
                          <div
                            style={{
                              marginBottom: 8,
                              fontSize: 12,
                              color: "#64748b",
                            }}
                          >
                            <strong>Evidence</strong>
                          
                            {pattern.evidence.map((item) => (
                              <div key={item}>
                                • {item}
                              </div>
                            ))}
                          </div>
                            {pattern.description}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                </div>
                <details
                  style={{
                    background: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: 12,
                    padding: 16,
                    color: "#0f172a",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
                    marginTop: 8,
                  }}
                >
                  <summary
                  style={{
                    cursor: "pointer",
                    fontSize: 16,
                    fontWeight: 700,
                    color: "#475569",
                  }}
                  >
                    Source Patterns
                  </summary>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                      gap: 16,
                      marginTop: 16,
                    }}
                  >
                    {[sourcePatterns.sourceA, sourcePatterns.sourceB].map(
                      (pattern, index) => (
                        <div
                          key={index}
                          style={{
                            border: "1px solid #e5e7eb",
                            borderRadius: 12,
                            padding: 16,
                            background: "#f8fafc",
                            minWidth: 0,
                            boxSizing: "border-box",
                          }}
                        >
                          <div
                            style={{
                              fontSize: 13,
                              color: "#64748b",
                              marginBottom: 4,
                            }}
                          >
                            {index === 0 ? "Source A" : "Source B"}
                          </div>

                          <div
                            style={{
                              fontSize: 11,
                              fontWeight: 800,
                              textTransform: "uppercase",
                              letterSpacing: 0.7,
                              color: "#64748b",
                              marginBottom: 6,
                            }}
                          >
                            Detected Pattern
                          </div>

                          <div
                            style={{
                              fontSize: 24,
                              fontWeight: 800,
                              marginBottom: 14,
                            }}
                          >
                            {pattern.label.replace("Likely ", "")}
                          </div>

                          <div
                            style={{
                              fontSize: 11,
                              fontWeight: 800,
                              textTransform: "uppercase",
                              letterSpacing: 0.7,
                              color: "#64748b",
                              marginBottom: 8,
                            }}
                          >
                            Indicators
                          </div>

                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 8,
                              marginBottom: 16,
                            }}
                          >
                            {pattern.indicators.map((indicator) => (
                              <div
                                key={indicator}
                                style={{
                                  display: "flex",
                                  gap: 8,
                                  alignItems: "center",
                                }}
                              >
                                <span style={{ color: "#16a34a", fontWeight: 700 }}>
                                  ✓
                                </span>
                                <span>{indicator}</span>
                              </div>
                            ))}
                          </div>

                          <div
                            style={{
                              background: "#ffffff",
                              border: "1px solid #e2e8f0",
                              borderRadius: 10,
                              padding: 14,
                            }}
                          >
                            <div
                              style={{
                                fontSize: 11,
                                fontWeight: 800,
                                textTransform: "uppercase",
                                letterSpacing: 0.7,
                                color: "#64748b",
                                marginBottom: 8,
                              }}
                            >
                              Modeling Implication
                            </div>

                            <div
                              style={{
                                color: "#334155",
                                lineHeight: 1.5,
                              }}
                            >
                              {pattern.modelingInsight}
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </details>
              </section>
            <div style={{ marginBottom: 18, marginTop: 18 }}>
              <details
                style={{
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: 12,
                  padding: 16,
                  color: "#0f172a",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
                }}
              >
                <summary
                style={{
                  cursor: "pointer",
                  fontSize: 16,
                  fontWeight: 700,
                  color: "#475569",
                }}
                >
                  Historical Snapshot
                </summary>
                
                <div style={{ marginTop: 12 }}>
                  <div
                    style={{
                      fontSize: 14,
                      color: "#64748b",
                      lineHeight: 1.5,
                      marginBottom: 12,
                    }}
                  >
                    Analyze the model at a specific point in time.
                    The timeline, findings and SQL predicate are updated automatically.
                  </div>
                  
                  <div
                    style={{
                      display: "flex",
                      gap: 16,
                      flexWrap: "wrap",
                      alignItems: "flex-end",
                    }}
                  >
                    <div>
                      <label style={{ fontSize: 12 }}>Valid As-of Date</label>
                      <br />
                      <input
                        type="date"
                        value={asOfDate || ""}
                        onChange={(e) => setAsOfDate(e.target.value || "")}
                      />
                    </div>
                  
                    <div>
                      <label style={{ fontSize: 12 }}>Visible As-of Timestamp</label>
                      <br />
                      <input
                        type="datetime-local"
                        value={visibleAsOf || ""}
                        onChange={(e) => setVisibleAsOf(e.target.value || "")}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={resetDates}
                      style={{
                        padding: "9px 13px",
                        borderRadius: 8,
                        background: "#e2e8f0",
                        color: "#334155",
                        border: "1px solid #cbd5e1",
                        cursor: "pointer",
                        fontWeight: 700,
                        fontSize: 13,
                        boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                        transition: "all 0.15s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-1px)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                      }}
                    >
                      Reset Dates
                    </button>
                  </div>
                </div>
              </details>
            </div>
              </>
            )}
          </div>
        )}
        {hasAnalyzed && (
          <>                  
            {(asOfDate || visibleAsOf) && (
              <div
                style={{
                  marginBottom: 16,
                  padding: 16,
                  borderRadius: 10,
                  background: "#1e3a8a",
                  border: "1px solid #3b82f6",
                  color: "#dbeafe",
                }}
              >
                <div
                  style={{
                    fontWeight: 700,
                    marginBottom: 10,
                  }}
                >
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
                
                <div
                  style={{
                    fontSize: 13,
                    opacity: 0.95,
                  }}
                >
                  Showing {activeTemporalIssues.length} findings
                  {temporalIssues.length !== activeTemporalIssues.length &&
                    ` (filtered from ${temporalIssues.length} historical findings)`}
                </div>
              </div>
            )}

            <div
              ref={analysisRef}
              style={{
                display: "grid",
                gridTemplateColumns: isMobile
                  ? "1fr"
                  : "minmax(0, 1.05fr) minmax(340px, 1.1fr)",
                gap: 20,
                alignItems: "start",
                marginBottom: 20,
              }}
            >
              <div>
                <IssuesPanel
                  joinIssues={activeJoinIssues}
                  selectedIssue={selectedIssue}
                  setSelectedIssue={selectJoinIssue}
                  temporalIssues={activeTemporalIssues}
                  selectedTemporalIssue={selectedTemporalIssue}
                  onSelectTemporalIssue={selectTemporalIssue}
                  hasAnalyzed={hasAnalyzed}
                />

                <div ref={timelineRef} style={{ marginTop: 20 }}>
                  <Timeline
                    rows={activeRows}
                    gaps={activeGaps}
                    overlapMarkers={activeOverlapMarkers}
                    selectedIssue={selectedIssue}
                    temporalIssues={activeTemporalIssues}
                    selectedTemporalIssue={selectedTemporalIssue}
                    onSelectTemporalIssue={selectTemporalIssue}
                    getPosition={getPosition}
                    getWidth={getWidth}
                    highlightedEntityId={highlightedRow?.entity_id ?? null}
                  />
                  <TimelineLegend />
                </div>
              </div>
            
              <div
                style={{
                  position: isMobile ? "static" : "sticky",
                  top: isMobile ? undefined : 20,
                }}
              >
                <SqlPanel
                  sql={sql}
                  selectedIssue={selectedIssue}
                  selectedTemporalIssue={selectedTemporalIssue}
                />
              </div>
            </div>

            <div style={{ margin: "24px 0 12px" }}>
              <h3 style={{ margin: 0, color: "#ffffff", fontSize: 20 }}>
                Source Record Details
              </h3>
              <p
                style={{
                  margin: "6px 0 0",
                  color: "#94a3b8",
                  fontSize: 13,
                  lineHeight: 1.5,
                }}
              >
                Inspect the underlying rows behind the selected finding.
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
              rows={activeRows.filter((r) => r.source === sourceNameA)}
              joinIssues={activeJoinIssues}
              onSelectIssue={selectJoinIssue}
              highlightedRow={highlightedRow}
              onHighlightRow={scheduleHighlightRow}
              forceOpen={expandedSources.includes(sourceNameA)}
              overlapMarkers={overlapMarkers}
            />

            <DataPreview
              title={`Raw source records: ${sourceNameB}`}
              rows={activeRows.filter((r) => r.source === sourceNameB)}
              joinIssues={activeJoinIssues}
              onSelectIssue={selectJoinIssue}
              highlightedRow={highlightedRow}
              onHighlightRow={scheduleHighlightRow}
              forceOpen={expandedSources.includes(sourceNameB)}
              overlapMarkers={overlapMarkers}
            />
            </div>
            {/* <div style={{ marginTop: 24 }}>
            <details
              style={{
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: 12,
                padding: 16,
                color: "#0f172a",
                boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
                marginBottom: 18,
              }}
            >
              <summary
              style={{
                cursor: "pointer",
                fontSize: 16,
                fontWeight: 700,
                color: "#475569",
              }}
              >
                Source Summary
              </summary>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                  gap: 14,
                  marginTop: 16,
                }}
              >
                {[sourceSummaryA, sourceSummaryB].map((summary) => (
                  <div
                    key={summary.sourceName}
                    style={{
                      background: "#ffffff",
                      border: "1px solid #e2e8f0",
                      borderRadius: 12,
                      padding: 16,
                      color: "#0f172a",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 800,
                        letterSpacing: 0.7,
                        textTransform: "uppercase",
                        color: "#64748b",
                        marginBottom: 8,
                      }}
                    >
                      Historical source summary
                    </div>

                    <div
                      style={{
                        fontSize: 17,
                        fontWeight: 900,
                        marginBottom: 12,
                      }}
                    >
                      {summary.sourceName}
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(6, minmax(0, 1fr))",
                        gap: 8,
                      }}
                    >
                      {[
                        { label: "Entities", value: summary.entities, tone: "neutral" },
                        { label: "Records", value: summary.records, tone: "neutral" },
                        {
                          label: "Avg. Records / Entity",
                          value: summary.recordsPerEntity.toFixed(1),
                          tone: "neutral",
                        },
                        { label: "Gaps", value: summary.gaps, tone: "neutral" },
                        {
                          label: "Valid overlaps",
                          value: summary.validTimeOverlaps,
                          tone: "red",
                        },
                        {
                          label: "Bitemp. overlaps",
                          value: summary.bitemporalOverlaps,
                          tone: "purple",
                        },
                      ].map((metric) => {
                        const hasFinding = Number(metric.value) > 0;

                        const metricColor =
                          !hasFinding
                            ? "#64748b"
                            : metric.tone === "orange"
                            ? "#d97706"
                            : metric.tone === "red"
                            ? "#dc2626"
                            : metric.tone === "purple"
                            ? "#7c3aed"
                            : "#0f172a";

                        return (
                          <div
                            key={metric.label}
                            style={{
                              background: "#f8fafc",
                              border: "1px solid #e2e8f0",
                              borderRadius: 8,
                              padding: "8px 10px",
                            }}
                          >
                            <div
                              style={{
                                fontSize: 18,
                                fontWeight: 900,
                                lineHeight: 1,
                                color: metricColor,
                              }}
                            >
                              {metric.value}
                            </div>

                            <div
                              style={{
                                marginTop: 5,
                                fontSize: 11,
                                color: "#64748b",
                                lineHeight: 1.2,
                              }}
                            >
                              {metric.label}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {sourceSummaryA.entities > 0 &&
                sourceSummaryB.entities > 0 &&
                densityRatio >= 1.5 && (
                  <div
                    style={{
                      marginTop: 14,
                      padding: "10px 12px",
                      borderRadius: 10,
                      background: "#eff6ff",
                      border: "1px solid #bfdbfe",
                      color: "#1e3a8a",
                      fontSize: 13,
                      fontWeight: 700,
                    }}
                  >
                    {denserSource.sourceName} has {densityRatio.toFixed(1)}× more
                    records per entity.
                  </div>
                )}
            </details>
            </div> */}
          </>
        )}
        <Footer />
      </div>
      <Analytics />
    </main>
  );
}