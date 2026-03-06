The first thing to do is join the Zoom meeting.
It has meeting ID `953 1568 0293`
and additionally has the topic `A => B@917 C@979 H@945`.

What can we do with this?

## Plotting out the graph

The first insight is to look at the
coordinates given in the [asy file](diagram.asy).

```c++
pair A = (1568,  293);
pair B = (2317, 1185);
pair C = (8057, 1394);
pair D = (5829, 3170);
pair E = (4079, 3458);
pair F = (5490, 5821);
pair G = (4027, 5827);
pair H = (2459, 6096);
pair I = (7406, 6683);
pair J = (6188, 9072);
pair K = (3325, 9359);
pair L = (9797, 9524);
```

The solver might recognize that the coordinates of A are actually
the last two parts of the Zoom meeting.
By engineer's induction, this should be true for the other Zoom meetings too.

So, we just need to find the first three digits for the other points.
Conveniently, the topic gives three-digit numbers!
So for example,
we may infer there is a node for B located at `912 2317 1185`.
Going to this meeting gives another topic with more numbers:
we are now walking on a graph!

This gives the following table of meetings:

| Point |Topic of Zoom meeting |    Zoom ID    |
|:-----:|:---------------------|:-------------:|
|   A   | `B@917 C@979 H@945`  | 953 1568 0293 |
|   B   | `A@953 D@916 E@993`  | 917 2317 1185 |
|   C   | `A@953 D@916 L@947`  | 979 8057 1394 |
|   D   | `B@917 C@979 I@936`  | 916 5829 3170 |
|   E   | `B@917 F@956 G@996`  | 993 4079 3458 |
|   F   | `E@993 G@996 I@936`  | 956 5490 5821 |
|   G   | `E@993 F@956 H@945`  | 996 4027 5827 |
|   H   | `A@953 G@996 K@940`  | 945 2459 6096 |
|   I   | `D@916 F@956 J@926`  | 936 7406 6683 |
|   J   | `I@936 K@940 L@947`  | 926 6188 9072 |
|   K   | `H@945 J@926 L@947`  | 940 3325 9359 |
|   L   | `C@979 J@926 K@940`  | 947 9797 9524 |

## Traveling the graph

The previous table now gives a 3-regular planar graph
on the [given diagram](diagram.pdf).
One then walks the graph as in this year's [USAMO2 problem][usamo2],
as hinted by the title of the puzzle being "Zoom Network Park".
Starting with the marked arrow, we get the following path:

![Illustrated initial path](solution-diagram-p0.png)

Tracing the path out and reading the Morse code
(there are many dots and dashes drawn on the edges),
this gives the clue phrase `CAN ZOOM IN ON EMAIL`.

## Zooming in

Solvers go back to the puzzle page and *zoom in*, literally,
on the given email message.
When they do so, a new message appears:

```text
K ==> L ==> ? ==> ? ==> ? ==> ? ==> ? ==> ?
               8
  ==> ? ==> ? ==> ? ==> ? ==> ? ==> ? ==> ?
               6           9    12
  ==> ? ==> ? ==> ? ==> ? ==> ? ==> ? ==> K
   7                                   2

F ==> E ==> B ==> ? ==> ? ==> ? ==> ? ==> ?
                     4     5
  ==> ? ==> ? ==> ? ==> ? ==> ? ==> ? ==> ?
   1    11
  ==> ? ==> ? ==> ? ==> ? ==> ? ==> ? ==> F
               3    10
```

This corresponds to two more USAMO2-style paths.
We fill them in:

```text
K ==> L ==> C ==> D ==> B ==> E ==> G ==> F
               8
  ==> I ==> D ==> C ==> A ==> H ==> G ==> F
               6           9    12
  ==> E ==> B ==> A ==> C ==> L ==> J ==> K
   7                                   2

F ==> E ==> B ==> A ==> C ==> L ==> J ==> K
                     4     5
  ==> H ==> A ==> B ==> D ==> I ==> J ==> K
   1    11
  ==> L ==> C ==> D ==> B ==> E ==> G ==> F
               3    10
```

Both paths are illustrated below.

![The first path for extraction](solution-diagram-p1.png)

![The second path for extraction](solution-diagram-p2.png)

Finally, reading the numbered arrows
and reading Morse gives

| # |   Edge  | Letter |
|--:|:-------:|:------:|
| 1 | K ==> H |   B    |
| 2 | J ==> K |   E    |
| 3 | C ==> D |   A    |
| 4 | A ==> C |   C    |
| 5 | C ==> L |   O    |
| 6 | D ==> C |   N    |
| 7 | F ==> E |   R    |
| 8 | C ==> D |   A    |
| 9 | A ==> H |   D    |
|10 | D ==> B |   I    |
|11 | H ==> A |   U    |
|12 | H ==> G |   S    |

This gives the answer `BEACON RADIUS`{.answer}.

[usamo2]: https://web.evanchen.cc/exams/USAMO-2021-notes.pdf