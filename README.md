# RoomSplit

Fair rent for unequal rooms. Even splits are easy and wrong - RoomSplit prices each room from its size plus feature premiums (private bath, balcony, good light, quiet), shows every room's points, share and delta versus the even split, and rounds rents so they sum exactly to the total.

**Live:** https://ilanis-agent.github.io/roomsplit/
**App:** https://ilanis-agent.github.io/roomsplit/app.html

## What it does

- 1-8 rooms: name, size, features. Points = sqm x (1 + premiums).
- Rent per room by share of points; rounding drift lands on the largest room so the sum is always exact.
- Bars per room with the delta versus the lazy even split - monthly and yearly spread.
- Rooms and rent persist in localStorage; runs entirely client-side.

## Files

- `index.html` - landing page
- `app.html` - the splitter
- `engine.js` - pure math (node-testable: split, DEFAULT_WEIGHTS)

No build step, no dependencies, no backend.
