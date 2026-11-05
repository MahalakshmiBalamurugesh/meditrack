# Implementation Plan: MediTrack

## Overview

MediTrack is a frontend-only React 18 / TypeScript SPA that lets a single user manage medicines, track dose adherence, log health metrics, and review weekly summaries — all persisted to browser LocalStorage through a storage abstraction layer. Implementation follows the layered architecture defined in the design: data models → storage → pure business-logic modules → React context → pages/components. Each task builds on the previous ones so that no code is left orphaned. Property-based tests (fast-check + Vitest) are written alongside the module they verify; unit and component tests follow immediately after their subjects.

---

## Tasks

- [x] 1. Set up project structure, tooling, and core type definitions
  - Scaffold the Vite + React 18 + TypeScript project with the directory layout from the design (`src/models`, `src/storage`, `src/modules`, `src/context`, `src/hooks`, `src/pages`, `src/components`, `src/styles`)
  - Install and configure Vitest, fast-check, React Testing Library, and Playwright
  - Create `src/models/Medicine.ts`, `src/models/Dose.ts`, `src/models/DoseRecord.ts`, `src/models/HealthReading.ts`, and `src/models/index.ts` with all enumerations, interfaces, and derived/computed types from the design (including `MEDICINE_FORMS`, `MEDICINE_COLORS`, `DoseStatus`, `HealthMetricType`, `DoseClassification`, `ScheduledDose`, `DoseRecordFilter`, `AdherenceResult`, `WeeklySummary`)
  - Create `src/storage/keys.ts` with the `STORAGE_KEYS` constants
  - Create `src/storage/StorageLayer.ts` with the `StorageLayer` interface
  - _Requirements: 1.1, 2.1, 3.1, 6.1, 9.5_

- [x] 2. Implement the LocalStorage persistence layer
  - [x] 2.1 Implement `LocalStorageLayer` class in `src/storage/LocalStorageLayer.ts`
    - Implement all methods from the `StorageLayer` interface using `localStorage.getItem` / `localStorage.setItem`
    - Wrap all reads in `try/catch`; on failure return `[]` and invoke an `onError` callback
    - Wrap all writes in `try/catch`; on quota exceeded throw a `StorageWriteError`
    - Implement idempotent delete (no-op when entity not found)
    - Implement `getDoseRecords(filter?)` applying `DoseRecordFilter` conditions inline
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

  - [ ]* 2.2 Write property test — Medicine serialization round-trip (Property 4)
    - **Property 4: Medicine serialization round-trip**
    - Use `arbitraryMedicine` from the design's fast-check arbitraries
    - Assert `deserialize(serialize(medicine))` deeply equals the original
    - Run with `numRuns: 100`
    - **Validates: Requirements 1.11, 9.6**

  - [ ]* 2.3 Write property test — DoseRecord serialization round-trip (Property 9)
    - **Property 9: DoseRecord serialization round-trip**
    - Use `arbitraryDoseRecord`; assert round-trip equality
    - **Validates: Requirements 3.7, 9.6**

  - [ ]* 2.4 Write property test — HealthReading serialization round-trip (Property 21)
    - **Property 21: HealthReading serialization round-trip**
    - Cover all three subtypes; assert round-trip equality
    - **Validates: Requirements 6.8, 9.6**

  - [ ]* 2.5 Write property test — Schedule serialization round-trip (Property 8)
    - **Property 8: Schedule serialization round-trip**
    - Use array of `arbitraryDose`; assert round-trip equality
    - **Validates: Requirements 2.7**

  - [x] 2.6 Write property test — StorageLayer write-then-read consistency (Property 30)
    - **Property 30: StorageLayer write-then-read consistency**
    - For any sequence of write operations, assert that a subsequent read returns the most recently written value
    - **Validates: Requirements 9.7**

  - [ ]* 2.7 Write property test — Serialization idempotence (Property 31)
    - **Property 31: Serialization idempotence**
    - Assert that calling the serialize function twice on the same entity produces identical output
    - **Validates: Requirements 9.8**

  - [ ]* 2.8 Write unit tests for `LocalStorageLayer`
    - Write-then-read round-trip; overwrite-then-read (last-write-wins); read missing key returns `[]`; write when `localStorage.setItem` throws → catches and throws `StorageWriteError`
    - _Requirements: 12.5_

- [x] 3. Implement the Validator module
  - [x] 3.1 Implement `src/modules/Validator.ts`
    - Implement all validation functions: `validateMedicineName`, `validateDosage`, `validateMedicineForm`, `validateMedicineColor`, `validateMedicineNotes`, `validateMedicine`, `validateDoseTime`, `validateNoDuplicateTimes`, `checkProximityWarning`, `validateBloodPressure`, `validateBloodSugar`, `validateWeight`, `validateHealthNote`
    - Use the `ValidationResult<T>` discriminated union return type
    - _Requirements: 1.2, 1.3, 1.4, 2.2, 2.3, 2.4, 6.2, 6.3, 6.4_

  - [ ]* 3.2 Write property test — Medicine name validation invariant (Property 1)
    - **Property 1: Medicine name validation invariant**
    - For any whitespace-only or empty string, assert failure; for any string with ≥1 non-whitespace character, assert success
    - **Validates: Requirements 1.2, 1.12**

  - [ ]* 3.3 Write property test — Dosage format validation invariant (Property 2)
    - **Property 2: Dosage format validation invariant**
    - For any string matching `<positive number> <unit>`, assert acceptance; for all others, assert rejection
    - **Validates: Requirements 1.3, 1.13**

  - [ ]* 3.4 Write property test — Medicine color validation invariant (Property 3)
    - **Property 3: Medicine color validation invariant**
    - For any string not in `MEDICINE_COLORS`, assert failure result
    - **Validates: Requirements 1.4**

  - [ ]* 3.5 Write property test — Dose time format validation invariant (Property 6)
    - **Property 6: Dose time format validation invariant**
    - For any valid HH:MM string (hours 00–23, minutes 00–59), assert acceptance; for all others, assert rejection
    - **Validates: Requirements 2.2, 2.9**

  - [ ]* 3.6 Write property test — Duplicate dose time detection invariant (Property 7)
    - **Property 7: Duplicate dose time detection invariant**
    - For any array with ≥2 identical time strings, assert detection regardless of order
    - **Validates: Requirements 2.3, 2.8**

  - [ ]* 3.7 Write property test — Blood pressure validation invariant (Property 18)
    - **Property 18: Blood pressure validation invariant**
    - For any `(systolic, diastolic)` pair where `systolic <= diastolic`, or either value is out of range, assert failure; for all valid pairs, assert success
    - **Validates: Requirements 6.2, 6.9**

  - [ ]* 3.8 Write property test — Blood sugar validation invariant (Property 19)
    - **Property 19: Blood sugar validation invariant**
    - For any value outside [20, 600] or with >1 decimal place, assert failure; for valid values, assert success
    - **Validates: Requirements 6.3, 6.10**

  - [ ]* 3.9 Write property test — Weight validation invariant (Property 20)
    - **Property 20: Weight validation invariant**
    - For any value outside [10, 500] or with >1 decimal place, assert failure; for valid values, assert success
    - **Validates: Requirements 6.4, 6.11**

  - [ ]* 3.10 Write unit tests for `Validator`
    - Cover: valid medicine; empty name, whitespace-only name, tab/newline name rejected; `"500"` (no unit) rejected; `"mg 500"` (wrong order) rejected; `"500 mg"`, `"0.5 mL"`, `"10 units"` accepted; `"24:00"`, `"08:60"`, `"8:30"`, `"abc"` rejected; `"00:00"`, `"23:59"`, `"08:30"` accepted; BP `(100,70)` accepted, `(70,100)` rejected, `(259,60)` rejected; blood sugar boundaries 20.0 and 600.0 accepted, 19.9 and 600.1 rejected, 20.15 rejected; weight boundaries 10.0 and 500.0 accepted, 9.9 and 500.1 rejected
    - _Requirements: 12.1_

- [x] 4. Checkpoint — core models, storage, and validation
  - Ensure all Vitest tests pass (`npx vitest --run`)
  - Ask the user if questions arise before proceeding.

- [x] 5. Implement the AdherenceCalculator module
  - [x] 5.1 Implement `src/modules/AdherenceCalculator.ts`
    - Implement `calculateAdherence(records)` with the formula `Math.floor(taken / (taken + missed) * 100)`, returning 0 when denominator is 0
    - Implement `calculateAdherenceForDateRange(records, start, end)` filtering by date range then delegating to `calculateAdherence`
    - _Requirements: 5.1, 5.2_

  - [ ]* 5.2 Write property test — AdherenceRate formula invariant (Property 12)
    - **Property 12: AdherenceRate formula invariant**
    - Assert `rate === Math.floor(taken / (taken + missed) * 100)` when denominator > 0, else 0
    - **Validates: Requirements 5.1, 5.2**

  - [ ]* 5.3 Write property test — AdherenceRate range invariant (Property 13)
    - **Property 13: AdherenceRate range invariant**
    - Assert `rate` is always an integer in [0, 100]
    - **Validates: Requirements 5.7**

  - [ ]* 5.4 Write property test — All-taken adherence is 100 (Property 14)
    - **Property 14: All-taken adherence is 100**
    - For any non-empty array where every record has `status === 'taken'`, assert `rate === 100`
    - **Validates: Requirements 5.5**

  - [ ]* 5.5 Write property test — All-missed adherence is 0 (Property 15)
    - **Property 15: All-missed adherence is 0**
    - For any non-empty array where every record has `status === 'missed'`, assert `rate === 0`
    - **Validates: Requirements 5.6**

  - [ ]* 5.6 Write property test — Skipped records are neutral (Property 16)
    - **Property 16: Skipped records are neutral**
    - Assert that removing any subset of skipped records from D does not change the rate
    - **Validates: Requirements 5.8**

  - [ ]* 5.7 Write property test — Taken + missed count conservation (Property 17)
    - **Property 17: Taken + missed count conservation**
    - Assert `taken + missed === count of non-skipped records` in the input set
    - **Validates: Requirements 5.9**

  - [ ]* 5.8 Write unit tests for `AdherenceCalculator`
    - All taken → 100; all missed → 0; mixed 3 taken + 1 missed → 75; all skipped → 0; empty → 0
    - _Requirements: 12.2_

- [x] 6. Implement the Scheduler module
  - [x] 6.1 Implement `src/modules/Scheduler.ts`
    - Implement `classifyDose(dose, medicine, nowMinutes, doseMinutes, existingRecord?)` with all classification rules from the design
    - Implement `getDailySchedule(date, now, doses, medicines, records)` filtering, enriching, and sorting by scheduled time ascending
    - _Requirements: 4.2, 4.3, 4.4, 4.5_

  - [ ]* 6.2 Write property test — Scheduler classification correctness (Property 11)
    - **Property 11: Scheduler classification correctness**
    - For any `(doseMinutes, nowMinutes, existingRecord)` triple, assert the correct classification according to the rules in the design
    - **Validates: Requirements 4.2, 4.3, 4.4**

  - [ ]* 6.3 Write unit tests for `Scheduler`
    - Dose at 08:00 / now 07:52 → `upcoming`; 08:00 / 08:00 → `due_now`; 08:00 / 08:05 → `due_now`; 08:00 / 08:11 → `overdue`; 08:00 / 08:00 with taken record → `completed`; 08:00 / 07:40 → `pending`
    - _Requirements: 12.3_

- [x] 7. Implement the FilterEngine module
  - [x] 7.1 Implement `src/modules/FilterEngine.ts`
    - Implement `filterDoseRecords(records, filter)` applying all active filter conditions as AND logic
    - Calling with an empty filter object returns the full input array unchanged
    - _Requirements: 8.3, 8.4, 8.5, 8.6, 8.7, 8.8_

  - [ ]* 7.2 Write property test — Filter results are a subset (Property 26)
    - **Property 26: Filter results are a subset of unfiltered results**
    - Assert the result is always a subset of or equal to the input records
    - **Validates: Requirements 8.10**

  - [ ]* 7.3 Write property test — FilterEngine idempotence (Property 27)
    - **Property 27: FilterEngine idempotence**
    - Assert applying the filter twice with the same filter returns the same result as applying it once
    - **Validates: Requirements 8.11**

  - [ ]* 7.4 Write property test — More filters produce fewer or equal results (Property 28)
    - **Property 28: More filters produce fewer or equal results**
    - For filters F1 ⊆ F2 (F2 is a superset), assert `count(F2 result) ≤ count(F1 result)`
    - **Validates: Requirements 8.12**

  - [ ]* 7.5 Write property test — FilterEngine AND correctness (Property 29)
    - **Property 29: FilterEngine AND correctness**
    - For any multi-field filter, assert every record in the result satisfies all active conditions simultaneously
    - **Validates: Requirements 8.3, 8.8**

  - [ ]* 7.6 Write unit tests for `FilterEngine`
    - No filter → all records; `medicineId` filter → only matching; `status: 'missed'` → only missed; date range → only in-range; two-filter AND: medicineId + status
    - _Requirements: 12.4_

- [x] 8. Implement the HealthMetricsCalculator module
  - [x] 8.1 Implement `src/modules/HealthMetricsCalculator.ts`
    - Implement `averageBloodPressure`, `averageBloodSugar`, `averageWeight` (return `null` for empty arrays; round to 1 decimal via `Math.round(value * 10) / 10`)
    - Implement `computeWeekRange(monday)` returning `{ start: monday, end: monday + 6 days }`
    - Implement trend indicator (up / down / stable) by comparing first-half vs second-half averages when ≥2 readings exist
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 8.9_

  - [ ]* 8.2 Write property test — Blood pressure average of equal values (Property 22)
    - **Property 22: Blood pressure average of equal values**
    - For any non-empty array where all readings share the same systolic/diastolic, assert the average equals that value
    - **Validates: Requirements 7.5**

  - [ ]* 8.3 Write property test — Blood sugar average formula (Property 23)
    - **Property 23: Blood sugar average formula**
    - Assert `averageBloodSugar([v₁…vₙ]) === Math.round((v₁+…+vₙ)/n * 10) / 10`
    - **Validates: Requirements 7.6**

  - [ ]* 8.4 Write property test — Weight average formula (Property 24)
    - **Property 24: Weight average formula**
    - Assert `averageWeight([v₁…vₙ]) === Math.round((v₁+…+vₙ)/n * 10) / 10`
    - **Validates: Requirements 7.7**

  - [ ]* 8.5 Write property test — Week range spans exactly 7 days (Property 25)
    - **Property 25: Week range spans exactly 7 days**
    - For any valid Monday date M, assert `computeWeekRange(M)` returns `{ start: M, end: M + 6 days }`
    - **Validates: Requirements 8.9**

- [x] 9. Checkpoint — all pure modules complete
  - Ensure all Vitest tests pass (`npx vitest --run`)
  - Ask the user if questions arise before proceeding.

- [ ] 10. Implement React Context providers and custom hooks
  - [x] 10.1 Implement `src/context/ClockContext.tsx` and `src/hooks/useClock.ts`
    - Provide a `Date` object updated every 30 seconds via `setInterval`
    - _Requirements: 4.5_

  - [x] 10.2 Implement `src/context/AppDataContext.tsx`
    - Initialize `LocalStorageLayer` and load all entities on mount
    - Expose state slices: `medicines`, `doses`, `doseRecords`, `healthReadings`, `storageError`
    - Expose mutation dispatchers: add/edit/delete medicine (with cascading delete of doses and doseRecords), add/delete dose, add/undo doseRecord (enforcing at-most-one-per-dose-per-date), add/delete healthReading
    - Catch `StorageWriteError` and set `storageError` state for `<ErrorBanner>`
    - _Requirements: 1.5, 1.8, 1.10, 3.2, 3.3, 3.4, 3.5, 3.6, 6.5, 9.1, 9.2, 9.3, 9.4_

  - [ ]* 10.3 Write property test — Cascading deletion consistency (Property 5)
    - **Property 5: Cascading deletion consistency**
    - For any Medicine with associated Doses and DoseRecords, after `deleteMedicine(id)`, assert no Dose or DoseRecord with that `medicineId` remains
    - **Validates: Requirements 1.10**

  - [ ]* 10.4 Write property test — At-most-one DoseRecord per Dose per date (Property 10)
    - **Property 10: At-most-one DoseRecord per Dose per date**
    - Assert that attempting to save a second DoseRecord for the same `(doseId, date)` pair is rejected
    - **Validates: Requirements 3.5, 3.8**

  - [ ] 10.5 Implement `src/hooks/useAppData.ts` and `src/hooks/useScheduler.ts`
    - `useAppData`: consume `AppDataContext` with a helpful error if used outside provider
    - `useScheduler`: call `getDailySchedule` on every clock tick from `ClockContext`
    - _Requirements: 4.1, 4.5_

- [ ] 11. Implement shared UI components
  - [ ] 11.1 Implement `src/components/shared/` components
    - `Button` (primary / secondary / danger variants, min 44×44px tap target)
    - `FormField` (label + input + error message with `aria-describedby`)
    - `ConfirmDialog` (generic confirmation modal)
    - `ErrorBanner` (dismissible storage error alert)
    - `LoadingSpinner`
    - `EmptyState` (message + optional CTA)
    - `MedicineColorBadge`
    - Apply mobile-first light theme styles, ≥16px body font, ≥14px secondary font, teal/blue primary color, WCAG 2.1 AA contrast ≥4.5:1
    - _Requirements: 10.1, 10.2, 10.3, 10.5, 10.6, 10.7, 10.8_

- [ ] 12. Implement the Medicines page
  - [ ] 12.1 Implement `src/pages/MedicinesPage.tsx` and `src/components/medicine/` components
    - `MedicineCard` with `MedicineColorBadge`, `MedicineMeta`, `SchedulePreview`, `MedicineActions` (edit / delete)
    - `MedicineList` rendering a list of `MedicineCard`
    - `MedicineForm` (create / edit) with `NameField`, `DosageField`, `FormSelect`, `ColorPicker`, `NotesField`, `DoseScheduleEditor` (add/remove `DoseTimeInput` entries)
    - `ConfirmDeleteDialog` wired to AppDataContext's delete dispatcher
    - Display inline validation errors adjacent to fields with ARIA attributes
    - Show proximity warning (within 15 min) but allow confirmation and save
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 1.10, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 10.4, 10.6, 10.8_

  - [ ]* 12.2 Write component tests for `MedicineForm`
    - Submits valid data; displays inline error on empty name; displays error on invalid dosage
    - _Requirements: 12.6_

- [ ] 13. Implement the Today View page
  - [ ] 13.1 Implement `src/pages/TodayPage.tsx` and `src/components/dose/` components
    - `DoseSectionHeader` (date display)
    - `EmptyScheduleMessage` (when no doses)
    - `DoseList` and `DoseCard` with `MedicineColorBadge`, `DoseTimeLabel`, `DoseStatusBadge`, `DoseActionButtons` (taken / missed / skip / undo)
    - Use `useScheduler` for real-time classification; re-evaluate every ≤60 seconds via `ClockContext`
    - Immediately remove due-now/overdue alert when dose is marked taken or skipped
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7_

  - [ ]* 13.2 Write component tests for `TodayPage`
    - Renders dose list; marks dose as taken and reflects change; overdue badge appears; empty-state message when no doses
    - _Requirements: 12.6_

- [ ] 14. Implement the Health Log page
  - [ ] 14.1 Implement `src/pages/HealthLogPage.tsx` and `src/components/health/` components
    - `HealthReadingForm` with `MetricTypeSelector`, conditional `BPFields` (systolic + diastolic), `SingleValueField`, `NoteField`
    - `HealthReadingList` grouped by metric type
    - `HealthReadingCard` with `MetricTypeIcon`, `ValueDisplay`, `DeleteButton` (with confirm dialog)
    - Apply Validator rules inline; display errors adjacent to fields
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 10.6, 10.8_

  - [ ]* 14.2 Write component tests for `HealthReadingForm`
    - Submits valid BP reading; rejects systolic ≤ diastolic with error message
    - _Requirements: 12.6_

- [ ] 15. Implement the Weekly Summary page
  - [ ] 15.1 Implement `src/pages/WeeklySummaryPage.tsx` and `src/components/summary/` components
    - `WeekSelector` (prev / next week navigation based on Monday anchor)
    - `SummaryStatsBar` (taken / missed / skipped counts + adherence %)
    - `FilterPanel` with `MedicineFilter`, `StatusFilter`, `DateRangeFilter`
    - `FilteredDoseRecordList` and `DoseRecordRow`
    - Wire `FilterEngine.filterDoseRecords` and `AdherenceCalculator.calculateAdherenceForDateRange`
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8_

  - [ ]* 15.2 Write component tests for `WeeklySummaryPage`
    - Renders records for selected week; filter by medicine hides unrelated records; no filters = all records shown
    - _Requirements: 12.6_

- [ ] 16. Implement the Trends page
  - [ ] 16.1 Implement `src/pages/TrendsPage.tsx`
    - `MetricTabSelector` (BP / blood sugar / weight)
    - `DateRangePicker`
    - `AverageSummaryCard` showing computed averages from `HealthMetricsCalculator`
    - `TrendIndicator` (up / down / stable) — shown only when ≥2 readings exist
    - `ReadingTimelineList` and `ReadingCard`
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [ ] 17. Wire routing and bottom navigation
  - [ ] 17.1 Implement `src/main.tsx` with `<HashRouter>`, route table (`/`, `/medicines`, `/health`, `/summary`, `/trends`), and `AppDataContext` + `ClockContext` providers wrapping all routes
    - Implement the persistent bottom navigation bar (mobile-first, links to all five routes)
    - Render `<ErrorBanner>` at the app root when `storageError` is set
    - _Requirements: 4.1, 9.3, 9.4, 10.4_

- [ ] 18. Integration and end-to-end tests
  - [ ]* 18.1 Write integration tests
    - Full mutation cycle: create Medicine → add Dose → open TodayView → verify dose appears
    - Data persistence: write records → re-instantiate `LocalStorageLayer` → verify records restored
    - Cascading delete: create Medicine with Doses and DoseRecords → delete Medicine → verify all associated data removed
    - Storage error handling: mock `localStorage.setItem` to throw → verify `<ErrorBanner>` renders and app does not crash
    - _Requirements: 12.5_

  - [ ]* 18.2 Write Playwright end-to-end tests
    - Primary workflow: add Medicine → define Schedule → open TodayView → mark Dose as taken → WeeklySummary shows 100% adherence
    - Log a blood pressure reading → verify it appears in Health Log grouped under BP
    - Navigate between all five pages via bottom nav → verify no crashes
    - Attempt to add medicine with empty name → verify inline error; form does not submit
    - _Requirements: 12.7_

- [ ] 19. Final checkpoint — all tests pass
  - Ensure all Vitest unit, property, component, and integration tests pass (`npx vitest --run`)
  - Ensure Playwright E2E tests pass
  - Ask the user if questions arise.

---

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP iteration; all core implementation tasks are unmarked and must be completed.
- Each task references specific requirements for traceability back to `requirements.md`.
- Property-based tests reference their property number from `design.md` (Properties 1–31) and use the fast-check arbitraries defined in the Testing Strategy section.
- Each property test must run with `numRuns: 100` minimum and carry the tag comment `// Feature: meditrack, Property N: <property_text>`.
- **Open Decision — Refill Tracking:** Low-stock warnings and refill tracking remain an unresolved open decision. No task has been created for this feature. If confirmed in scope, new tasks should be added after Task 12 (Medicines page) to extend the Medicine model, StorageLayer, and UI.
- Checkpoint tasks (4, 9, 19) are not included in the dependency graph below as they are gate tasks that block their wave.

---

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1"] },
    { "id": 1, "tasks": ["2.1", "3.1"] },
    { "id": 2, "tasks": ["2.2", "2.3", "2.4", "2.5", "2.6", "2.7", "2.8", "3.2", "3.3", "3.4", "3.5", "3.6", "3.7", "3.8", "3.9", "3.10"] },
    { "id": 3, "tasks": ["5.1", "6.1", "7.1", "8.1"] },
    { "id": 4, "tasks": ["5.2", "5.3", "5.4", "5.5", "5.6", "5.7", "5.8", "6.2", "6.3", "7.2", "7.3", "7.4", "7.5", "7.6", "8.2", "8.3", "8.4", "8.5"] },
    { "id": 5, "tasks": ["10.1", "10.2"] },
    { "id": 6, "tasks": ["10.3", "10.4", "10.5"] },
    { "id": 7, "tasks": ["11.1"] },
    { "id": 8, "tasks": ["12.1", "13.1", "14.1", "15.1", "16.1"] },
    { "id": 9, "tasks": ["12.2", "13.2", "14.2", "15.2"] },
    { "id": 10, "tasks": ["17.1"] },
    { "id": 11, "tasks": ["18.1", "18.2"] }
  ]
}
```
