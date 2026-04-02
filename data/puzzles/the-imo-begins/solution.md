## Finding Sets

Each of the ten calendars provided states a month
and shows a layout of several Set cards.
As directed by the flavortext,
solvers should try to find L-shaped Set's among the calendar.

This is complicated by one additional factor: there is a Shift button
which changes the day of the week the month starts on.
This provides a way to potentially create additional Sets,
since the calendar does not "wrap around".

In each calendar, there is a unique way to find eight sets,
but there is _not necessarily_ a unique way to shift it such that
all the sets are valid.

## Intersections

On the other hand, one can find a unique completely
filled row and uniquely filled column,
and these intersect to give a particular date.
This gives the set of following set of possible dates.

| Calendar | Possible dates |               |
| :------: | :------------- | :------------ |
| Board 1  | July 12 (Thu)  | July 19 (Thu) |
| Board 2  | July 8 (Fri)   |               |
| Board 3  | Sept 19 (Sat)  | Sept 26 (Thu) |
| Board 4  | July 11 (Thu)  | July 18 (Sat) |
| Board 5  | July 14 (Wed)  |               |
| Board 6  | July 18 (Thu)  |               |
| Board 7  | July 3 (Thu)   |               |
| Board 8  | July 14 (Wed)  |               |
| Board 9  | July 4 (Wed)   | July 4 (Fri)  |
| Board 10 | July 4 (Wed)   | July 4 (Fri)  |

## Matching up

To proceed further, it's necessary to think about the flavor text:
you are looking for the start dates of the IMO starting from 2000 onwards.
This explains why all the months are July except for one
(September 2020, due to the COVID pandemic).
For each board, exactly one of the dates corresponds to an IMO,
and that date corresponds to exactly one IMO.
One may then extract by taking A=1 ... Z=26.

| Calendar | IMO date      | Year  | Letter |
| :------: | :------------ | :---: | :----: |
| Board 1  | July 19 (Thu) | 2007  |   G    |
| Board 2  | July 8 (Fri)  | 2005  |   E    |
| Board 3  | Sept 19 (Sat) | 2020  |   T    |
| Board 4  | July 11 (Thu) | 2019  |   S    |
| Board 5  | July 14 (Wed) | 2021  |   U    |
| Board 6  | July 18 (Thu) | 2013  |   M    |
| Board 7  | July 3 (Thu)  | 2014  |   N    |
| Board 8  | July 14 (Wed) | 2021  |   U    |
| Board 9  | July 4 (Wed)  | 2012  |   L    |
| Board 10 | July 4 (Wed)  | 2012  |   L    |

This gives the answer `GET SUM NULL`{.answer}.
