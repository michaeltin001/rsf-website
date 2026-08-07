# Google Sheets Parameter Extraction Guide

This guide explains how Tally dynamically fetches, parses, and extracts settings parameters from a Google Sheet using **React**, **Google Visualization API**, and **TypeScript**. This architecture allows users to configure the application remotely through a Google Sheet.

## 1. Data Structure (`scheduler.ts`)

First, define the TypeScript interface that structures your configuration parameters. This ensures type safety when mapping the Google Sheet key-value pairs to the application state.

```typescript
// src/lib/tally/scheduler.ts
export interface GeneratorParams {
    tournamentName: string;
    tournamentDate: string;
    basePeriod: number;
    judgingMultiplier: number;
    numFields: number;
    numJudging: number;
    numRounds: number;
    startTime: string; // HH:MM
    endTime: string;   // HH:MM
    lunchOption?: 'none' | 'time' | 'after_round_1' | 'after_round_2';
    lunchDuration?: number; // minutes
    lunchStart: string; // HH:MM
    lunchEnd: string;   // HH:MM
    volunteersArriveTime: string;
    teamCheckInTime: string;
    openingCeremoniesTime: string;
    teamList: string;   // raw text
}
```

## 2. Fetching the Content (`Tally.tsx`)

To pull data from the Google Sheet, the application fetches the sheet via the Google Visualization API. This bypasses the need for complex OAuth setups if the sheet is public. The JSON response is extracted from a JavaScript wrapper using regular expressions.

> [!TIP]
> Ensure the target Google Sheet's access is set to "Anyone with the link can view".

```tsx
// src/components/tally/Tally.tsx
const fetchSheet = async (sheetName: string) => {
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json&headers=1&sheet=${sheetName}`;
  try {
    const res = await fetch(url);
    const text = await res.text();
    // The response is wrapped in a function call. Extract the JSON payload.
    const match = text.match(/google\.visualization\.Query\.setResponse\(([\s\S\w]+)\);/);
    
    if (match && match[1]) {
      const json = JSON.parse(match[1]);
      
      if (json.status === 'error') {
        throw new Error(json.errors?.[0]?.message || 'Google Sheets API error');
      }
      
      if (!json.table || !json.table.cols) {
        return [];
      }

      // Map the columns to standard JavaScript objects
      const headers = json.table.cols.map((c: any) => c.label);
      return json.table.rows.map((r: any) => {
        return headers.reduce((obj: any, header: string, i: number) => {
          obj[header] = r.c[i] ? r.c[i].v : null;
          return obj;
        }, {});
      });
    }
    
    return [];
  } catch (err) {
    console.error(`Failed to fetch or parse sheet "${sheetName}":`, err);
    throw err;
  }
};
```

## 3. Parsing the Parameters (`importXlsx.ts`)

Once the data is structured as an array of objects representing rows, the system iterates over the "Settings" sheet. It assumes columns named `Key` and `Value`. It automatically casts types based on the expected types defined in `GeneratorParams`.

```typescript
// src/lib/tally/importXlsx.ts
import { GeneratorParams } from "./scheduler";

export function parseSheetToSchedule(
  rawSheetData: { settings: any[]; teams: any[]; judging: any[]; rounds: any[] } | null,
  defaultConfig: any
): { params: GeneratorParams; schedule: Slot[] } | null {
  if (!rawSheetData) return null;

  const { settings, teams, rounds, judging } = rawSheetData;

  // Initialize with defaults
  const params: GeneratorParams = {
    tournamentName: defaultConfig.tournament_name,
    tournamentDate: new Date().toISOString().split("T")[0],
    basePeriod: defaultConfig.base_period,
    judgingMultiplier: defaultConfig.judging_multiplier,
    numFields: defaultConfig.num_fields,
    numJudging: defaultConfig.num_judging,
    numRounds: defaultConfig.num_rounds,
    // ...other default parameters
  };

  // Iterate over Settings tab rows and cast values
  settings.forEach((row: any) => {
    const key = row.Key;
    const value = row.Value;
    
    if (key in params) {
      const paramType = typeof (params as any)[key];
      if (paramType === "number") {
        (params as any)[key] = parseInt(value, 10);
      } else if (value === "undefined" || value === "null") {
        (params as any)[key] = undefined;
      } else {
        (params as any)[key] = value;
      }
    }
  });

  // Reconstruct schedule and return ...
  // return { params, schedule };
}
```

## 4. Data Flow

Here is how the parameter extraction operates end-to-end:

1. **Storage**: User configures properties via rows in a Google Sheet named "Settings" (e.g., Key = `numFields`, Value = `4`).
2. **Fetching (Client-side)**: A React `useEffect` hook in `Tally.tsx` generates a `gviz/tq` URL and performs a standard `fetch` call to the Google API endpoint.
3. **Parsing (Client-side)**: The regex-cleaned JSON output is converted into arrays of row objects containing `Key` and `Value` parameters.
4. **Parameter Extraction**: `parseSheetToSchedule` loops through the rows array. It checks if the `Key` string exists in the `GeneratorParams` interface. If it matches, the corresponding string `Value` is parsed to its required data type (string or number) and attached to the runtime `params` object.
5. **Consumption**: The extracted parameters dictate the generator logic and user interface within the app's React components.
