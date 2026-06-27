# Schedule Generation Algorithm

```text
// 1. INITIALIZATION & TIME SLOT PREPARATION
Set periodLength to basePeriod (e.g., 10 minutes)
Set judgingLengthPeriods to judgingMultiplier (e.g., 3 periods)

// The Optimization: Time Slot Generation (Handling different Lunch Options)
Create an empty list called validTimeSlots
If lunch option is "Specific Time" or "None":
    For every time from eventStart to eventEnd in increments of periodLength:
        If lunch option is "Specific Time" and time falls within the lunch break:
            Skip to lunch end time
        Add the time to validTimeSlots
Else (Dynamic Lunch - e.g., After Round 1 or 2):
    // Generate excess slots to allow for later time-shifting
    For every time from eventStart to (eventEnd + 24 hours) in increments of periodLength:
        Add the time to validTimeSlots

Set up fieldVisitCounts[team][field] = 0 for all teams and fields
Set up completedMatches[team] = 0 for all teams
Set up isBusy[team][slotIndex] = False for all teams and all slot indices


// 2. PRE-SCHEDULE JUDGING (Block out the time)
Set judgingSlotIndex to 0
Set teamsAssignedToJudging to 0

While teamsAssignedToJudging < total number of teams:
    
    // Check for Lunch Jumps: If assigning the session crosses the missing lunch block
    If the time difference between validTimeSlots[judgingSlotIndex] and validTimeSlots[judgingSlotIndex + judgingLengthPeriods - 1] > (judgingLengthPeriods - 1) * periodLength:
        Increment judgingSlotIndex by 1
        Continue to the next loop iteration (skip this starting slot and try again)
        
    For each judgingArea from 1 to total number of judging areas:
        If teamsAssignedToJudging < total number of teams:
            Pick the next unassigned team
            Assign this team to the current judgingArea starting at judgingSlotIndex
            
            // Mark team busy for the duration of the multiplier
            For p = judgingSlotIndex to (judgingSlotIndex + judgingLengthPeriods - 1):
                Set isBusy[team][p] = True
                
            Increment teamsAssignedToJudging by 1
            
    Increment judgingSlotIndex by judgingLengthPeriods


// 3. SCHEDULE MATCHES (Strict Round Gating)
Set currentSlotIndex to 0
Set lunchJumpIdx to -1

For targetRound = 1 to total number of rounds:
    
    // Create a queue of teams that need to play this round
    Set teamsNeededForRound = List of all teams
    
    While teamsNeededForRound is not empty:
        
        // Bounds Check
        If currentSlotIndex >= total number of validTimeSlots:
            Return ERROR: "Schedule exceeds tournament hours."
            
        Set availableFields = List of all fields
        
        // Try to assign teams to open fields for this specific time slot index
        For each team in teamsNeededForRound:
            If isBusy[team][currentSlotIndex] is True:
                Continue // Skip this team for now, they are busy (e.g., in judging)
                
            If availableFields is not empty:
                // Anti-Repeat Logic
                Sort availableFields based on fieldVisitCounts[team][field] from lowest to highest
                Set selectedField = the first field in sorted availableFields
                
                // Assign and update states
                Assign team to selectedField at currentSlotIndex
                Set isBusy[team][currentSlotIndex] = True
                Increment fieldVisitCounts[team][selectedField] by 1
                Increment completedMatches[team] by 1
                
                Remove selectedField from availableFields
                Remove team from teamsNeededForRound
                
        // Once we've checked all teams and filled as many fields as possible,
        // we MUST advance time, whether fields are full or empty.
        Increment currentSlotIndex by 1

    // Dynamic Lunch Alignment
    If (lunch option is "After Round 1" and targetRound is 2) OR (lunch option is "After Round 2" and targetRound is 3):
        // Align lunch start to the next judging session boundary to avoid splitting judging
        If currentSlotIndex is not a multiple of judgingLengthPeriods:
            Set currentSlotIndex = next multiple of judgingLengthPeriods
        Set lunchJumpIdx = currentSlotIndex


// 4. DYNAMIC LUNCH TIME JUMP
If lunchJumpIdx is not -1:
    // Insert a time jump
    Set currentTime to eventStart
    For every slot index from 0 to end of schedule:
        If index equals lunchJumpIdx:
            Add lunchDuration to currentTime
        Update slot time to currentTime
        Add periodLength to currentTime
```
