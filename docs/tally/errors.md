# Application Errors

This document lists all the possible errors that can be triggered in the Tournament Schedule Generator and Settings Modals. These errors are explicitly mapped to their corresponding input fields to provide clear user feedback.

## `ScheduleModal` (Tournament Generator) Errors
The following 9 errors are thrown by the underlying scheduling algorithm (`scheduler.ts`) and caught by the `ScheduleModal`:

1. **Empty Team List**
   - **Error:** `"Team list is empty or incorrectly formatted."`
   - **Trigger:** The team list textarea is empty or the entries don't match the expected `ID, Name` format.

2. **Invalid Start/End Time**
   - **Error:** `"Start time must be before end time."`
   - **Trigger:** The Tournament Start time is set to the same time or after the Tournament End time.

3. **Invalid Lunch Time**
   - **Error:** `"Lunch start must be before lunch end."`
   - **Trigger:** The "Specific Time" lunch option is selected, but the lunch start time is set to the same time or after the lunch end time.

4. **No Time Slots Available**
   - **Error:** `"No available time slots within bounds. Check your start time, end time, and base period."`
   - **Trigger:** The gap between the tournament start and end time is smaller than a single match period, leaving no room to schedule anything.

5. **Judging Exceeds Event End Time**
   - **Error:** `"Not enough time before event end to finish judging for all teams. Reached capacity at team X."`
   - **Trigger:** The judging multiplier is too high or the tournament end time is too early, making it mathematically impossible to finish even the first round of judging before the event ends.

6. **Judging Cannot Fit**
   - **Error:** `"Could not fit all judging sessions into the allotted time frame."`
   - **Trigger:** There aren't enough judging areas to process all the teams within the available tournament hours.

7. **Matches Exceed Hours**
   - **Error:** `"Schedule exceeded hours while trying to schedule Round X. Need more time or fields."`
   - **Trigger:** The generator runs out of available time slots before it finishes scheduling all requested rounds for all teams.

8. **Schedule Ends Late**
   - **Error:** `"Schedule exceeded tournament hours. Need more time or fields. The schedule would end at [Time]."`
   - **Trigger:** The schedule was successfully generated, but the final match block lands after the specified tournament end time.

9. **Invalid Number of Rounds**
   - **Error:** `"Number of rounds must be at least 2."`
   - **Trigger:** The `# Rounds` field is set to less than 2.

## `SettingsModal` Errors
The following 2 errors are triggered when attempting to save the Google Sheet Configuration:

10. **Empty Sheet ID**
    - **Error:** `"Sheet ID cannot be empty."`
    - **Trigger:** Attempting to save the configuration with a completely empty input field.

11. **Invalid Sheet ID Format**
    - **Error:** `"Invalid Sheet ID. It should be a long string of letters, numbers, hyphens, and underscores."`
    - **Trigger:** The provided text does not match the standard 40+ character alphanumeric format of a Google Sheet ID. *(Note: If a full URL is pasted, the modal automatically extracts the ID without erroring).*
