# Trip Planner Overview

The trip planner is the main workspace for building your itinerary. You open it by clicking a trip card on the dashboard.

![Trip Planner](assets/TripPlannerWithPlane.png)

## Layout

The planner uses a **three-pane resizable layout** on desktop:

```
┌─────────────────┬──────────────────────────┬──────────────────┐
│  Day Plan       │                          │  Places          │
│  Sidebar        │       Interactive        │  Sidebar         │
│  (left)         │          Map             │  (right)         │
│                 │        (center)          │                  │
└─────────────────┴──────────────────────────┴──────────────────┘
```

- **Left sidebar** — Day plan: your list of days, assigned places, notes, and transport entries. Collapsible via the panel toggle button.
- **Center** — Interactive map showing all place markers and day routes.
- **Right sidebar** — Places list: search, category filters, and bulk actions. Collapsible.

Each sidebar has a drag handle on its inner edge for resizing.

![Planner in its three-pane layout: the day plan sidebar with days, places, notes and flight entries on the left, the map in the centre, and the places sidebar with search and category filter on the right](assets/TripPlanner.png)

A **Day Detail panel** floats over the map area when you open a specific day, showing the weather forecast, that day's reservations, and the accommodation block. It can be collapsed to a slim header bar without closing it.

## Tabs

The tab bar sits directly below the main navigation bar.

| Tab | Description |
|---|---|
| **Plan** | The three-pane map view described above. Always visible. |
| **Transports** | Flights, trains, cars, cruises, and buses. |
| **Bookings** | Hotels, restaurants, events, tours, and other bookings. |
| **Lists** | Packing list and to-do list. |
| **Costs** | Expense tracking, splitting, and settlement. |
| **Files** | Document manager for receipts, tickets, and other files. |
| **Collab** | Real-time chat, shared notes, and polls. |

> **Admin:** The **Lists**, **Costs**, **Files**, and **Collab** tabs only appear when the corresponding addon is enabled. See [Admin-Addons](Admin-Addons).

The active tab is saved in `sessionStorage` per trip, so switching between trips preserves your last position.

## Roadtrip daily start and end times

Nearby station search results group into count badges when zoomed out. Click a badge to zoom into its stations. Stations that still overlap at close zoom appear in a selectable list. Planned stops, including photo markers, also group into count badges when zoomed out. Day endings remain separate. This works with all supported map providers in Roadtrip mode.

In the Roadtrip view, open **Driving settings** and enter a **Day start** and **Day end** in HH:mm format. Both values enable automatic daily scheduling and connect the drives between days. Clear either field to return to the existing schedule. These are personal driving preferences and apply to your Roadtrip views.

Driving pauses at the end time and resumes from the same location at the next day's start time. Stops and visit durations determine where each pause falls. Editing, adding or removing stops recalculates the pauses and subsequent arrivals. If a visit crosses the end time, the remaining visit continues there the next morning before driving resumes.

Choose **Along the route** to pause at the point reached at the cutoff, or **At the last place** to stay after the last visit when the next place cannot be reached before the cutoff. For example, arriving at 16:00 and staying for one hour ends the day at 17:00 if the next drive takes two hours and the cutoff is 18:00. That drive starts from the same place the next morning. If a single drive cannot fit within a full daily window, a message asks you to add an intermediate place or choose pauses along the route. The final destination does not generate an extra drive to fill the remaining time.

The map and daily cards show the pause location without creating a place, accommodation or booking. The location within a drive is an estimate based on the elapsed share of the leg's duration along its route geometry. The next real stop is reached after the remaining drive, so its arrival can be later than the daily start time. Transport legs such as ferry crossings continue to their destination without a pause in the middle.

Manual times take precedence. A first stop set to 07:00 still starts at 07:00 even with an automatic 08:00 start. A fixed late appointment can extend that day. If fixed appointments cannot be reached without changing their time or stored day, a visible message pauses automatic scheduling. Missing routes also show a message until a complete schedule can be calculated.

The daily layout is calculated for the Roadtrip view. Stored day assignments stay intact, with **From day 1** labels identifying stops carried forward. Additional preview days appear when needed, including beyond the trip's existing days.

To mix both behaviors, select a stop and enable **End the day here** in its place details. This ends the day after that visit and its stay, even when the daily cutoff has not been reached. The next drive starts the following morning. The switch is available only in Roadtrip mode with valid daily travel times. Turning those times off keeps each saved choice but stops applying it. The choice belongs to that particular visit, so another visit to the same place is independent. Disable the switch to follow the default again. The editable **STAY** duration appears beside this switch and opens the same editor as the sidebar.

While online, drag an end-of-day map label along the driving route or onto a visit. A visit that automatically moved into the following day can become the previous day's final stop, even if its full stay ends after the automatic cutoff. Fixed visit times remain protected. Right-click a dragged label to restore its automatic ending, or restore all dragged endings in Driving settings. Focused labels also support the arrow keys and Delete. These overrides belong to the trip, survive reloads and are copied with the trip. They take effect only while daily travel times are enabled.

The map marks pauses with a moon and day number beside a place or above the route. These markers disappear when zoomed out beyond level 6.

> **AI / MCP:** Pauses are calculated in the Roadtrip view and are not stored as places or bookings. `set_assignment_end_day` sets or clears the boolean `end_day` on a specific visit; it takes effect only with daily travel times enabled. `list_day_boundaries` and `set_day_boundary` read, set or clear dragged day endings, anchored to assignment IDs and a fraction of the route. Place and assignment tools continue to read the original assignments and manually entered times.

## Mobile Layout

On screens narrower than 768 px, TREK does not squeeze the three-pane layout — it opens a dedicated mobile trip screen instead: a day-chip rail under the top bar, a switch between the day plan and a full-screen map, and a bottom dock for the other tabs. Tablets and desktops (768 px and up) get the three-pane layout described above.

## Undo

The planner tracks your recent actions — adding places, assigning them to days, reordering, and removing assignments — in a short undo ring. The **Undo** button sits in the Day Plan Sidebar toolbar (at the top of the sidebar); it is greyed out until an undoable action is available. It shows the name of the last action as a tooltip on hover and reverses it when clicked.

## Splash Screen

When you first open a trip, a brief loading screen appears while the planner data and place photos are fetched. This screen shows the trip title and a loading animation. Once data is ready and a short grace period for photos has elapsed, the planner workspace appears.

## Getting Around

| Task | Where to go |
|---|---|
| Add and search places | [Places-and-Search](Places-and-Search) |
| Organize days and notes | [Day-Plans-and-Notes](Day-Plans-and-Notes) |
| Map features and routes | [Map-Features](Map-Features) |
| Weather forecasts | [Weather-Forecasts](Weather-Forecasts) |
| Reservations and bookings | [Reservations-and-Bookings](Reservations-and-Bookings) |

## Related Pages

- [Places-and-Search](Places-and-Search)
- [Day-Plans-and-Notes](Day-Plans-and-Notes)
- [Map-Features](Map-Features)
- [Weather-Forecasts](Weather-Forecasts)
- [Reservations-and-Bookings](Reservations-and-Bookings)
- [Admin-Addons](Admin-Addons)
