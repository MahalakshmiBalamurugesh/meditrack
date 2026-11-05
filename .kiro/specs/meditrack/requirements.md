# Requirements Document

## Introduction

MediTrack is a frontend-only medicine and health tracking web application built with React and TypeScript. It allows a single user to manage medications, track dose adherence, log health metrics, and review weekly summaries — all without a backend. All data is persisted in browser LocalStorage behind a storage abstraction layer to enable future backend migration. The application presents a clean, calm, medical-friendly light theme with teal/blue primary colors, large readable text, mobile-first layout, high contrast, and large tap targets.

> **Open Decision:** Refill tracking with low-stock warnings has not been confirmed in or out of MVP scope. This feature is flagged as unresolved and is excluded from the requirements below until a decision is made.

---

## Glossary

- **App**: The MediTrack React/TypeScript single-page web application.
- **User**: The single authenticated-free local user of the App.
- **Medicine**: A named medication record containing a name, dosage, form, color, and optional notes.
- **Dose**: A single scheduled intake event for a Medicine at a specified time of day.
- **DoseRecord**: An immutable log entry recording the outcome (taken, missed, or skipped) of a Dose for a specific calendar date.
- **Schedule**: The set of Doses associated with a Medicine, each with a validated time.
- **TodayView**: The main screen showing the current day's scheduled Doses and their statuses.
- **HealthLog**: The record of User-entered health metric readings.
- **HealthReading**: A single timestamped entry for one health metric — either blood pressure, blood sugar, or weight.
- **WeeklySummary**: An aggregated report covering a Monday-to-Sunday calendar week.
- **AdherenceRate**: The percentage of expected Doses that were marked taken within a given time window, calculated as `(taken / (taken + missed)) × 100`, excluding skipped Doses from the denominator.
- **StorageLayer**: The abstraction over browser LocalStorage that serializes and deserializes all App data.
- **Validator**: The module responsible for validating all user inputs before persistence.
- **Scheduler**: The module responsible for computing due, upcoming, and overdue Doses for a given calendar date.
- **AdherenceCalculator**: The module responsible for computing AdherenceRate and dose counts.
- **FilterEngine**: The module responsible for applying AND-combined filters to DoseRecords.
- **Pretty_Printer**: The module responsible for converting internal data structures back into their canonical string or serialized forms.

---

## Requirements

---

### Requirement 1: Medicine Management

**User Story:** As a User, I want to add, edit, and delete medicines, so that I can maintain an accurate list of my current medications.

#### Acceptance Criteria

1. THE App SHALL provide a form for the User to create a Medicine with the following fields: name (required, non-empty string), dosage (required, string in the format `<number> <unit>` e.g. "500 mg"), form (required, one of: tablet, capsule, liquid, injection, patch, inhaler, drops, other), color (required, selected from a predefined fixed set of colors), and notes (optional, free-text string up to 500 characters).
2. WHEN the User submits a create Medicine form, THE Validator SHALL reject any submission where the name field is empty or contains only whitespace.
3. WHEN the User submits a create Medicine form, THE Validator SHALL reject any dosage value that does not match the pattern of a positive number followed by a unit string.
4. WHEN the User submits a create Medicine form with a color not in the predefined color set, THE Validator SHALL reject the submission and display the list of valid color options.
5. WHEN a Medicine is successfully created, THE StorageLayer SHALL persist the Medicine record to LocalStorage and THE App SHALL display the updated Medicine list.
6. WHEN the User selects a Medicine to edit, THE App SHALL populate the edit form with the existing Medicine field values.
7. WHEN the User submits an edit Medicine form, THE Validator SHALL apply the same validation rules as creation (criteria 2–4).
8. WHEN a Medicine is successfully edited, THE StorageLayer SHALL update the persisted record and THE App SHALL reflect the changes immediately.
9. WHEN the User requests to delete a Medicine, THE App SHALL prompt the User to confirm the deletion before proceeding.
10. WHEN the User confirms deletion of a Medicine, THE StorageLayer SHALL remove the Medicine record and all associated Schedule and DoseRecord data from LocalStorage.
11. FOR ALL valid Medicine objects, serializing then deserializing via THE StorageLayer SHALL produce an object equal to the original (round-trip property).
12. FOR ALL Medicine name inputs, THE Validator SHALL consistently accept names that are non-empty strings and reject names that are empty or whitespace-only (invariant property).
13. FOR ALL dosage string inputs, THE Validator SHALL consistently accept well-formed dosage strings and reject malformed ones, regardless of the order in which inputs are evaluated (invariant property).

---

### Requirement 2: Dose Schedule Management

**User Story:** As a User, I want to define one or more dose times for each medicine, so that the app can remind me when to take each medication.

#### Acceptance Criteria

1. THE App SHALL allow the User to associate one or more Doses with a Medicine, each Dose specifying a time of day in HH:MM (24-hour) format.
2. WHEN the User submits a Dose time, THE Validator SHALL reject any time string that does not represent a valid 24-hour clock time (i.e., hours 00–23, minutes 00–59).
3. WHEN the User adds a Dose to a Medicine's Schedule that has the same time as an existing Dose for that Medicine, THE Validator SHALL reject the duplicate and display an error message identifying the conflicting time.
4. WHEN the User attempts to save a Schedule where two or more Doses for the same Medicine have times within 15 minutes of each other, THE App SHALL display a warning, but SHALL allow the User to confirm and save if the User explicitly accepts the warning.
5. WHEN a Schedule is successfully saved, THE StorageLayer SHALL persist all Doses for the Medicine and THE App SHALL display the updated Schedule.
6. WHEN the User deletes a Dose from a Schedule, THE StorageLayer SHALL remove that Dose and THE Scheduler SHALL no longer include it in future daily calculations.
7. FOR ALL valid Schedule configurations, serializing then deserializing via THE StorageLayer SHALL produce a Schedule equal to the original (round-trip property).
8. FOR ALL pairs of Dose times within a single Medicine's Schedule, THE Validator SHALL detect and report duplicates regardless of the order in which Doses were added (invariant property).
9. FOR ALL valid time strings in HH:MM format, THE Validator SHALL accept the input; for all strings outside this format, THE Validator SHALL reject the input (invariant property).

---

### Requirement 3: Dose Tracking

**User Story:** As a User, I want to mark each dose as taken, missed, or skipped, so that I have an accurate record of my medication adherence.

#### Acceptance Criteria

1. THE App SHALL display each scheduled Dose for the current day with an action to mark it as taken, missed, or skipped.
2. WHEN the User marks a Dose as taken, THE StorageLayer SHALL create a DoseRecord with status "taken", the current timestamp, and the associated Medicine and Dose identifiers.
3. WHEN the User marks a Dose as missed, THE StorageLayer SHALL create a DoseRecord with status "missed" and the current calendar date.
4. WHEN the User marks a Dose as skipped, THE StorageLayer SHALL create a DoseRecord with status "skipped" and the current calendar date.
5. WHEN a DoseRecord has already been created for a Dose on the current date, THE App SHALL display the recorded status and SHALL prevent the User from recording a second status for that same Dose on that date without first undoing the existing record.
6. WHEN the User undoes a DoseRecord, THE StorageLayer SHALL remove that DoseRecord and THE App SHALL restore the Dose to its pending state.
7. FOR ALL DoseRecord objects, serializing then deserializing via THE StorageLayer SHALL produce a record equal to the original (round-trip property).
8. FOR ALL calendar dates, the set of DoseRecords persisted via THE StorageLayer SHALL contain at most one record per Dose per date (invariant property).

---

### Requirement 4: Today View and In-App Reminders

**User Story:** As a User, I want to see today's medication schedule and receive in-app alerts for due and overdue doses, so that I never miss a medication while the app is open.

#### Acceptance Criteria

1. THE App SHALL display a TodayView listing all Doses scheduled for the current calendar date, grouped or ordered by scheduled time.
2. WHEN the current clock time is within 10 minutes before a Dose's scheduled time, THE Scheduler SHALL classify the Dose as "upcoming" and THE TodayView SHALL display it in an "Upcoming today" section.
3. WHEN the current clock time is at or past a Dose's scheduled time and no DoseRecord with status "taken" or "skipped" exists for that Dose on the current date, THE Scheduler SHALL classify the Dose as "due now" and THE TodayView SHALL display an alert indicator for that Dose.
4. WHEN a Dose's scheduled time has passed by more than 10 minutes and no DoseRecord with status "taken" or "skipped" exists for that Dose on the current date, THE Scheduler SHALL classify the Dose as "overdue" and THE TodayView SHALL display a distinct overdue alert for that Dose.
5. WHILE the TodayView is open, THE App SHALL re-evaluate Dose statuses at intervals no greater than 60 seconds so that status transitions (upcoming → due → overdue) are reflected without requiring a page reload.
6. WHEN the User marks a Dose as taken or skipped from the TodayView, THE App SHALL immediately remove the due-now or overdue alert for that Dose.
7. IF the User has no Medicines with Doses scheduled for the current date, THEN THE TodayView SHALL display a message indicating no doses are scheduled today.

---

### Requirement 5: Adherence Tracking

**User Story:** As a User, I want to see my adherence percentage and dose counts, so that I can understand how consistently I am taking my medications.

#### Acceptance Criteria

1. THE AdherenceCalculator SHALL compute the AdherenceRate as `floor((taken / (taken + missed)) × 100)` percent for a given set of DoseRecords, where skipped DoseRecords are excluded from both the numerator and the denominator.
2. WHEN the set of DoseRecords contains zero taken and zero missed records, THE AdherenceCalculator SHALL return an AdherenceRate of 0 percent and SHALL NOT perform a division operation that would result in a divide-by-zero error.
3. THE App SHALL display the AdherenceRate alongside the total count of taken doses and missed doses for at least the current week and the last 30 days.
4. WHEN a new DoseRecord is created or deleted, THE AdherenceCalculator SHALL recompute and THE App SHALL display the updated AdherenceRate without requiring a page reload.
5. FOR ALL non-empty sets of DoseRecords containing only "taken" records, THE AdherenceCalculator SHALL return an AdherenceRate of 100 (invariant property).
6. FOR ALL non-empty sets of DoseRecords containing only "missed" records, THE AdherenceCalculator SHALL return an AdherenceRate of 0 (invariant property).
7. FOR ALL sets of DoseRecords, THE AdherenceCalculator SHALL return a value in the range [0, 100] inclusive (invariant property).
8. FOR ALL sets of DoseRecords D and any subset S of D containing only "skipped" records, removing S from D SHALL NOT change THE AdherenceCalculator result (invariant: skipped records are neutral).
9. FOR ALL sets of DoseRecords, the sum of taken count and missed count reported by THE AdherenceCalculator SHALL equal the total number of non-skipped records in the input set (invariant property).

---

### Requirement 6: Health Log

**User Story:** As a User, I want to log blood pressure, blood glucose, and weight readings, so that I can track health trends over time.

#### Acceptance Criteria

1. THE App SHALL provide a form for the User to record a HealthReading with a metric type (blood pressure, blood sugar, or weight), a value appropriate to the metric, and an optional note up to 200 characters.
2. WHEN the User records a blood pressure HealthReading, THE Validator SHALL require a systolic value in the range [60, 250] mmHg (integer) and a diastolic value in the range [40, 150] mmHg (integer), and SHALL require systolic to be strictly greater than diastolic.
3. WHEN the User records a blood sugar HealthReading, THE Validator SHALL require a value in the range [20, 600] mg/dL (numeric, up to one decimal place).
4. WHEN the User records a weight HealthReading, THE Validator SHALL require a value in the range [10, 500] kg (numeric, up to one decimal place).
5. WHEN a HealthReading passes validation, THE StorageLayer SHALL persist the reading with an ISO 8601 timestamp and THE App SHALL display it in the health log list.
6. THE App SHALL display a chronological list of HealthReadings, grouped by metric type, showing value, unit, timestamp, and note.
7. WHEN the User deletes a HealthReading, THE App SHALL prompt for confirmation, and upon confirmation THE StorageLayer SHALL remove the record and THE App SHALL update the displayed list.
8. FOR ALL valid HealthReading objects, serializing then deserializing via THE StorageLayer SHALL produce a reading equal to the original (round-trip property).
9. FOR ALL blood pressure HealthReading inputs where systolic ≤ diastolic, THE Validator SHALL reject the input (invariant property).
10. FOR ALL blood sugar inputs outside [20, 600], THE Validator SHALL reject the input; for all inputs in [20, 600] with at most one decimal place, THE Validator SHALL accept the input (invariant property).
11. FOR ALL weight inputs outside [10, 500], THE Validator SHALL reject the input; for all inputs in [10, 500] with at most one decimal place, THE Validator SHALL accept the input (invariant property).

---

### Requirement 7: Health Metric Trends and Averages

**User Story:** As a User, I want to see averages and trends for my health readings, so that I can understand how my health metrics are changing over time.

#### Acceptance Criteria

1. THE App SHALL compute and display the average systolic and average diastolic blood pressure across all blood pressure HealthReadings within a selected date range.
2. THE App SHALL compute and display the average blood sugar across all blood sugar HealthReadings within a selected date range.
3. THE App SHALL compute and display the average weight across all weight HealthReadings within a selected date range.
4. WHEN fewer than two HealthReadings of a given metric type exist within the selected date range, THE App SHALL display the available reading(s) without a trend indicator and SHALL NOT produce a calculation error.
5. FOR ALL non-empty sets of identical blood pressure HealthReadings, the computed average systolic and average diastolic values SHALL equal the value of any single reading in the set (invariant: average of equal values is that value).
6. FOR ALL non-empty sets of blood sugar HealthReadings with values v₁…vₙ, the computed average SHALL equal `(v₁ + v₂ + … + vₙ) / n` rounded to one decimal place (invariant property).
7. FOR ALL non-empty sets of weight HealthReadings with values v₁…vₙ, the computed average SHALL equal `(v₁ + v₂ + … + vₙ) / n` rounded to one decimal place (invariant property).

---

### Requirement 8: Weekly Summary

**User Story:** As a User, I want to view a Monday-to-Sunday weekly summary of my doses and adherence, so that I can review my medication patterns at a glance.

#### Acceptance Criteria

1. THE App SHALL display a WeeklySummary for a User-selected Monday-to-Sunday calendar week, showing all DoseRecords within that week.
2. THE WeeklySummary SHALL display: total doses taken, total doses missed, total doses skipped, and the AdherenceRate for the selected week.
3. THE App SHALL allow the User to filter the WeeklySummary by Medicine name, DoseRecord status (taken, missed, skipped), and date range within the selected week, with all active filters applied as AND conditions.
4. WHEN no filters are active, THE WeeklySummary SHALL display all DoseRecords for the selected week.
5. WHEN a Medicine filter is active, THE WeeklySummary SHALL include only DoseRecords associated with the selected Medicine.
6. WHEN a status filter is active, THE WeeklySummary SHALL include only DoseRecords with the selected status.
7. WHEN a date range filter is active, THE WeeklySummary SHALL include only DoseRecords whose date falls within [filterStart, filterEnd] inclusive.
8. WHEN multiple filters are active simultaneously, THE FilterEngine SHALL apply all filters as AND conditions so that only DoseRecords satisfying all active filters are included.
9. FOR ALL Monday dates M, THE App SHALL correctly identify the week as spanning M through M+6 days (Sunday) inclusive (invariant property).
10. FOR ALL filter combinations applied to a fixed set of DoseRecords, the result set returned by THE FilterEngine SHALL be a subset of (or equal to) the unfiltered result set (metamorphic: filtering reduces or preserves record count).
11. FOR ALL filter combinations, applying THE FilterEngine twice with the same filters SHALL return the same result as applying it once (idempotence property).
12. FOR ALL pairs of filter combinations F1 and F2 where F2 is a superset of the active filters in F1, the result count for F2 SHALL be less than or equal to the result count for F1 (metamorphic: more filters ≤ fewer results).

---

### Requirement 9: Data Persistence and Storage Abstraction

**User Story:** As a User, I want my data to persist between browser sessions, so that I do not have to re-enter my medicines and logs every time I open the app.

#### Acceptance Criteria

1. THE StorageLayer SHALL persist all Medicine, Schedule, Dose, DoseRecord, and HealthReading data to browser LocalStorage using JSON serialization.
2. WHEN the App is loaded, THE StorageLayer SHALL deserialize and restore all previously persisted data before rendering any data-dependent UI components.
3. WHEN LocalStorage is unavailable or returns a read error, THE App SHALL display an error message informing the User that data cannot be loaded and SHALL NOT crash or render corrupted state.
4. WHEN a write operation to LocalStorage fails (e.g., storage quota exceeded), THE App SHALL display an error message and SHALL NOT silently discard the write.
5. THE StorageLayer SHALL expose an interface that does not directly reference LocalStorage APIs, so that future implementations can substitute a different persistence mechanism without changing consumer code.
6. FOR ALL App data entity types (Medicine, Schedule, Dose, DoseRecord, HealthReading), THE StorageLayer SHALL guarantee that `deserialize(serialize(entity))` produces an entity deeply equal to the original (round-trip property).
7. FOR ALL sequences of write-then-read operations performed via THE StorageLayer, the read result SHALL equal the most recently written value for that entity key (invariant: last-write-wins consistency).
8. FOR ALL entity types, calling THE StorageLayer serialize function twice on the same entity SHALL produce identical output (idempotence of serialization).

---

### Requirement 10: Accessibility and Visual Design

**User Story:** As a User, I want the app to be readable and usable on mobile devices with clear visual cues, so that I can track my medications comfortably regardless of my visual ability.

#### Acceptance Criteria

1. THE App SHALL render a light theme with teal/blue as the primary color and SHALL maintain a contrast ratio of at least 4.5:1 between text and its background for all body text, following WCAG 2.1 AA guidelines.
2. THE App SHALL use a base font size of at least 16px for body text and at least 14px for secondary/supporting text.
3. THE App SHALL use tap targets with a minimum touch area of 44×44 CSS pixels for all interactive elements.
4. THE App SHALL be mobile-first: all primary workflows (adding a medicine, marking a dose, logging a health reading) SHALL be completable on a viewport width of 375px without horizontal scrolling.
5. THE App SHALL assign each Medicine a color from the predefined color set and SHALL display that color visually (e.g., as a badge or indicator) adjacent to the Medicine name throughout the App.
6. THE App SHALL provide descriptive `aria-label` or visible label text for all form inputs, buttons, and interactive controls.
7. THE App SHALL support keyboard navigation for all primary workflows.
8. WHERE a user interacts with a form that has validation errors, THE App SHALL display error messages adjacent to the invalid fields and SHALL associate each error message with its field using appropriate ARIA attributes.

---

### Requirement 11: Testing — Property-Based Tests

**User Story:** As a developer, I want comprehensive property-based tests for all core logic modules, so that edge cases and invariants are systematically verified using fast-check and Vitest.

#### Acceptance Criteria

1. THE App's test suite SHALL use Vitest as the test runner and fast-check as the property-based testing library for all property-based tests.
2. FOR ALL Medicine input objects generated by a fast-check arbitrary, THE Validator's medicine validation function SHALL exhibit the invariant described in Requirement 1 criteria 12–13.
3. FOR ALL Schedule input configurations generated by a fast-check arbitrary, THE Validator's duplicate-time detection SHALL exhibit the invariant described in Requirement 2 criteria 8–9.
4. FOR ALL DoseRecord sets generated by a fast-check arbitrary, THE AdherenceCalculator SHALL exhibit the invariants described in Requirement 5 criteria 5–9.
5. FOR ALL HealthReading input objects generated by a fast-check arbitrary, THE Validator SHALL exhibit the invariants described in Requirement 6 criteria 9–11.
6. FOR ALL non-empty HealthReading sets generated by a fast-check arbitrary, the average calculation functions SHALL exhibit the invariants described in Requirement 7 criteria 5–7.
7. FOR ALL Monday dates and DoseRecord sets generated by a fast-check arbitrary, THE WeeklySummary calculations and THE FilterEngine SHALL exhibit the properties described in Requirement 8 criteria 9–12.
8. FOR ALL App entity objects generated by a fast-check arbitrary, THE StorageLayer serialize/deserialize cycle SHALL exhibit the round-trip property described in Requirement 9 criterion 6.
9. FOR ALL entity objects generated by a fast-check arbitrary, calling THE StorageLayer serialize function twice SHALL produce identical output (idempotence, Requirement 9 criterion 8).

---

### Requirement 12: Testing — Unit, Integration, Component, and E2E Tests

**User Story:** As a developer, I want a complete test suite beyond property-based tests, so that individual modules, component rendering, user interactions, and full workflows are all verified.

#### Acceptance Criteria

1. THE App's test suite SHALL include unit tests for THE Validator covering at least: valid medicine creation, invalid medicine names (empty, whitespace-only), invalid dosage formats, valid and invalid time strings, valid and invalid blood pressure pairs (including systolic ≤ diastolic), out-of-range blood sugar values, and out-of-range weight values.
2. THE App's test suite SHALL include unit tests for THE AdherenceCalculator covering: all-taken input, all-missed input, mixed input, all-skipped input (expect 0%), and empty input (expect 0%).
3. THE App's test suite SHALL include unit tests for THE Scheduler covering: a Dose classified as upcoming, due now, overdue, and completed for representative clock times.
4. THE App's test suite SHALL include unit tests for THE FilterEngine covering: no filters active (all records returned), single Medicine filter, single status filter, date range filter, and two-filter AND combination.
5. THE App's test suite SHALL include unit tests for THE StorageLayer covering: write then read round-trip, overwrite then read (last-write-wins), read of a missing key (returns null or defined default), and behavior when LocalStorage throws an error on write.
6. THE App's test suite SHALL include component tests (using React Testing Library) for: the TodayView rendering a list of Doses, the TodayView marking a Dose as taken and reflecting the change, the Medicine form submitting valid data, the Medicine form displaying validation errors for invalid input, and the WeeklySummary rendering with and without active filters.
7. THE App's test suite SHALL include at least one end-to-end test (using a browser automation tool compatible with Vitest or a dedicated E2E runner such as Playwright) that verifies the workflow: add a Medicine → define a Schedule → open TodayView → mark a Dose as taken → view AdherenceRate showing 100%.
8. WHEN any test in the suite fails, THE test runner SHALL report the failing test name, the input that caused the failure, and the expected vs. actual output.
