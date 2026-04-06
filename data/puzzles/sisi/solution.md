Like in the earlier Gradescope puzzle,
the only initially given data is the title of the puzzle.
The puzzle title is a join code for a Google Classroom,
and entering it, one finds a class called _Solve Identify Sort Index_.
The banner of the puzzle is depicted below.

![Banner](/static/2021/sisi/sisi-shell.png)

The title refers to four steps:

1. Solve the math problems.
2. Identify the six answers that are out of place as past IMO problems.
3. Sort by problem number.
4. Index by problem number into answer.

## Solve

The first step in the puzzle is to solve the various math problems.
Solvers are given a chance to check their answers once for the problems
by submitting in the classroom, but this step is not essential,
and is only to help check the team's work.

Here are all the answers:

<div class="strong-emph" markdown="1">

| Code  |  Ans |
| :---: | ---: |
|  A1   |  _0_ |
|  A2   |   20 |
|  A3   |   19 |
|  A4   |  _2_ |
|  A5   |   16 |
|  A6   |   15 |
|  A7   |   14 |
|  C1   |   13 |
|  C2   | _18_ |
|  C3   |   12 |
|  C4   |   11 |
|  C5   |   10 |
|  C6   |    8 |
|  C7   |  _4_ |
|  N1   |  _9_ |
|  N2   |    7 |
|  N3   |    6 |
|  N4   |    5 |
|  N5   |    3 |
|  N6   |    1 |
|  N7   | _17_ |

</div>

## Identify

There are six problems whose answers are conspicuously out of place;
otherwise the answers are in descending order from 20 to 0.
Given the shortlist flavoring of the problem statement
it makes sense to look up the IMO problems in those slot.
Indeed, they were problems that corresponded to IMO problems
(and none of the other problems do so).

| Code  |  Ans | IMO Problem |
| :---: | ---: | :---------: |
|  A1   |    0 | IMO 2000/2  |
|  A4   |    2 | IMO 2002/5  |
|  C2   |   18 | IMO 2018/4  |
|  C7   |    4 | IMO 2004/3  |
|  N1   |    9 | IMO 2009/1  |
|  N7   |   17 | IMO 2017/6  |

## Sort

The six obtained problem numbers are distinct,
so sort the above table by the problem number.

| Code  | IMO Problem |
| :---: | :---------: |
|  N1   | IMO 2009/1  |
|  A1   | IMO 2000/2  |
|  C7   | IMO 2007/3  |
|  C2   | IMO 2018/4  |
|  A4   | IMO 2002/5  |
|  N7   | IMO 2017/6  |

## Index

We need to put three-letter codes for each of the six problems.
The obvious choice is the _proposing country_;
a full list is given on [evanchen.cc](https://web.evanchen.cc/problems.html)
for convenience, but AoPS should work well too.
The authors are:

| Code  | IMO Problem | Author |
| :---: | :---------: | :----: |
|  N1   | IMO 2009/1  |  AUS   |
|  A1   | IMO 2000/2  |  USA   |
|  C7   | IMO 2007/3  |  EST   |
|  C2   | IMO 2018/4  |  ARM   |
|  A4   | IMO 2002/5  |  IND   |
|  N7   | IMO 2017/6  |  USA   |

Then index as shown in the diagram.

<div class="strong-emph" markdown="1">

| Code  | IMO Problem |       |       |       |
| :---: | :---------: | :---: | :---: | :---: |
|  N1   | IMO 2009/1  |  _A_  |   U   |   S   |
|  A1   | IMO 2000/2  |   U   |  _S_  |   A   |
|  C7   | IMO 2007/3  |   E   |   S   |  _T_  |
|  C2   | IMO 2018/4  |  _A_  |   R   |   M   |
|  A4   | IMO 2002/5  |   I   |  _N_  |   D   |
|  N7   | IMO 2017/6  |   U   |   S   |  _A_  |

</div>

This gives the phrase `ASTANA`.
This was the location of IMO 2010,
and the capital of `KAZAKHSTAN`{.answer}.
