# Bitemporal Debugger

Visual debugging tool for temporal SQL joins and historized datasets.

## Detects

- gaps
- overlaps
- ambiguous joins
- visible-time mismatches

## Why?

Temporal joins can produce misleading historical results even when the SQL query itself is technically correct.

Especially once:
- intervals overlap
- data arrives late
- or multiple rows become valid simultaneously.

## Demo

https://bitemporal-debugger.vercel.app/

## Local development

```bash
npm install
npm run dev