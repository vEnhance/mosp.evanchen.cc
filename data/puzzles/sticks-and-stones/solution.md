The metapuzzle requires the unordered set of
the feeder answers to the previous puzzles,
which we give below sorted first by length and then alphabetically.

- `GETSUMNULL`
- `KAZAKHSTAN`
- `BEACONRADIUS`
- `SAYNOTOCOMBO`
- `USACHROMAKEY`
- `FILESPECIALFORMAT`
- `TEAMSELECTIONEXAM`

During the actual 2021 hunt,
it was also necessary to find the puzzle itself:
it's hidden in the same place that the hunt itself was,
behind the world map (this time behind the MOSP world map).

## Braille

The first step is to translate the Braille grid provided.
Doing so provides the following message:

|       |       |       |       |       |       |
| :---: | :---: | :---: | :---: | :---: | :---: |
|   N   |   E   |   W   |   J   |   O   |   B   |
|   F   |   I   |   N   |   D   |       |       |
|   A   |       |   T   |   E   |   S   |   T   |
|   O   |   N   |   E   |   V   |   A   |   N   |
|   C   |   H   |   E   |   N   |   C   |   C   |
|   A   |       |   P   |   D   |   F   |       |
|   S   |   O   |   L   |   N   |       |       |
|       |       |   T   |   E   |   X   |   T   |
|   U   |   S   |   A   |   J   |   M   |   O   |
|   P   |       |   S   |   I   |   X   |       |

This prompts the solver to navigate to the
[problem archive at evanchen.cc](https://evanchen.cc/problems.html).
One of the tests has been conspicuously labeled "featuring Steve"
for no apparent reason, so the solver is prompted to open it.
Doing so reminds the solver of the statement of USAJMO 2015/6:

> Steve is piling $m\geq 1$ indistinguishable stones
> on the squares of an $n\times n$ grid.
> Each square can have an arbitrarily high pile of stones.
> After he finished piling his stones in some manner,
> he can then perform _stone moves_, defined as follows.
> Consider any four grid squares, which are corners of a rectangle,
> i.e. in positions $(i, k), (i, l), (j, k), (j, l)$
> for some $1\leq i, j, k, l\leq n$, such that $i<j$ and $k<l$.
> A stone move consists of either removing one stone from each of
> $(i, k)$ and $(j, l)$
> and moving them to $(i, l)$ and $(j, k)$ respectively,
> or removing one stone from each of $(i, l)$ and $(j, k)$
> and moving them to $(i, k)$ and $(j, l)$ respectively.
>
> Two ways of piling the stones are equivalent
> if they can be obtained from one another
> by a sequence of stone moves.
> How many different non-equivalent ways can
> Steve pile the stones on the grid?

The solution to this problem is based on looking at the "signature"
of a stone configuration:
the number of stones in any given row or given column.
This suggests the blue numbers given are the signature.

## Crossword

It remains to complete the crossword.
To proceed further, one has to read the flavor text of the puzzle.
Reading it out loud, one should notice something conspicuous:
as is MOSP tradition, the letter S is repeated over and over
(though not quite as much as in the survey).
And indeed, one notices that each of the answers has the letter S exactly once.
So this suggests the way to fill in the grid:

- The letter S's represent the stones, and should satisfy the blue numbers.
- The answers should be placed in the grid with three horizontal
  and four vertical; moreover the occupied cells must be centrally symmetric.

It turns out there is a unique way to do this, depicted below.

<div class="strong-emph" markdown="1">

|       |   1   |   2   |   1   |   0   |   0   |   0   |   0   |   0   |   0   |   1   |   1   |   1   |
| ----- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **0** |       |       |   T   |       |       |       |       |       |       |       |       |       |
| **0** |       |       |   E   |       |       |       |       |       |       |       |   G   |       |
| **1** |   U   |  _S_  |   A   |   C   |   H   |   R   |   O   |   M   |   A   |   K   |   E   |   Y   |
| **0** |       |       |   M   |       |       |       |       |       |       |       |   T   |       |
| **2** |       |       |  _S_  |       |       |       |       |       |       |       |  _S_  |       |
| **0** |       |       |   E   |       |       |       |       |       |       |       |   U   |       |
| **0** |       |       |   L   |       |       |       |       |       |       |       |   M   |       |
| **0** |       |       |   E   |       |       |       |       |       |       |       |   N   |       |
| **0** |       |       |   C   |       |       |       |       |       |       |       |   U   |       |
| **0** |       |       |   T   |       |       |       |       |       |       |       |   L   |       |
| **0** |       |       |   I   |       |       |       |       |       |       |       |   L   |       |
| **0** |       |       |   O   |       |       |       |       |       |       |       |       |       |
| **0** |       |       |   N   |       |       |       |       |       |       |       |       |       |
| **0** |       |       |   E   |       |       |       |       |       |       |       |       |       |
| **0** |       |       |   X   |       |       |       |       |       |       |   F   |       |       |
| **1** |   B   |   E   |   A   |   C   |   O   |   N   |   R   |   A   |   D   |   I   |   U   |  _S_  |
| **0** |       |       |   M   |       |       |       |       |       |       |   L   |       |       |
| **0** |       |       |       |       |       |       |       |       |       |   E   |       |       |
| **1** |       |       |       |       |       |       |       |       |       |  _S_  |       |       |
| **0** |       |       |       |       |       |       |       |       |       |   P   |       |       |
| **0** |       |   K   |       |       |       |       |       |       |       |   E   |       |       |
| **0** |       |   A   |       |       |       |       |       |       |       |   C   |       |       |
| **0** |       |   Z   |       |       |       |       |       |       |       |   I   |       |       |
| **0** |       |   A   |       |       |       |       |       |       |       |   A   |       |       |
| **0** |       |   K   |       |       |       |       |       |       |       |   L   |       |       |
| **0** |       |   H   |       |       |       |       |       |       |       |   F   |       |       |
| **1** |       |  _S_  |       |       |       |       |       |       |       |   O   |       |       |
| **0** |       |   T   |       |       |       |       |       |       |       |   R   |       |       |
| **1** |  _S_  |   A   |   Y   |   N   |   O   |   T   |   O   |   C   |   O   |   M   |   B   |   O   |
| **0** |       |   N   |       |       |       |       |       |       |       |   A   |       |       |
| **0** |       |       |       |       |       |       |       |       |       |   T   |       |       |

</div>

## Extraction

There is one step remaining: solvers need to overlay this completed
grid back onto the Braille grid (since there was otherwise no reason
why the Braille grid should be the same dimensions as the crossword;
moreover some of the placement of empty cells in the Braille
was fairly irregular).

Upon doing so, certain letters are highlighted, as shown below.
The solver then should trace out the S and read the highlighted letters,
as directed by the flavor text.

<div class="strong-emph" markdown="1">

|       |       |       |       |       |       |       |       |       |       |       |       |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
|       |       |   .   |       |       |       |       |       |       |       |       |       |
|       |       |   .   |       |       |       |       |       |       |       |   .   |       |
|   .   |   .   |   A   |   C   |   H   |  _R_  |   O   |   M   |  _A_  |   K   |   E   |   .   |
|       |       |   M   |       |       |       |       |       |       |       |   T   |       |
|       |       |  _S_  |       |       |       |       |       |       |       |   S   |       |
|       |       |   E   |       |       |       |       |       |       |       |   U   |       |
|       |       |   L   |       |       |       |       |       |       |       |   M   |       |
|       |       |   E   |       |       |       |       |       |       |       |  _N_  |       |
|       |       |   C   |       |       |       |       |       |       |       |  _U_  |       |
|       |       |  _T_  |       |       |       |       |       |       |       |  _L_  |       |
|       |       |   I   |       |       |       |       |       |       |       |   L   |       |
|       |       |  _O_  |       |       |       |       |       |       |       |       |       |
|       |       |  _N_  |       |       |       |       |       |       |       |       |       |
|       |       |  _E_  |       |       |       |       |       |       |       |       |       |
|       |       |   X   |       |       |       |       |       |       |   .   |       |       |
|   .   |   .   |   A   |   C   |  _O_  |  _N_  |  _R_  |  _A_  |  _D_  |  _I_  |   .   |   .   |
|       |       |   .   |       |       |       |       |       |       |   L   |       |       |
|       |       |       |       |       |       |       |       |       |   E   |       |       |
|       |       |       |       |       |       |       |       |       |   S   |       |       |
|       |       |       |       |       |       |       |       |       |   P   |       |       |
|       |   K   |       |       |       |       |       |       |       |   E   |       |       |
|       |   A   |       |       |       |       |       |       |       |  _C_  |       |       |
|       |   Z   |       |       |       |       |       |       |       |   I   |       |       |
|       |   A   |       |       |       |       |       |       |       |  _A_  |       |       |
|       |   K   |       |       |       |       |       |       |       |  _L_  |       |       |
|       |   H   |       |       |       |       |       |       |       |   F   |       |       |
|       |  _S_  |       |       |       |       |       |       |       |   O   |       |       |
|       |  _T_  |       |       |       |       |       |       |       |  _R_  |       |       |
|   .   |   A   |   Y   |   N   |  _O_  |   T   |  _O_  |   C   |   O   |   M   |   .   |   .   |
|       |   .   |       |       |       |       |       |       |       |   .   |       |       |
|       |       |       |       |       |       |       |       |       |   .   |       |       |

</div>

Reading this gives the answer:
`LUNAR STONE ON RADICAL ROOTS`{.answer}.
