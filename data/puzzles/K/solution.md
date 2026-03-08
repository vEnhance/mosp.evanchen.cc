This solution describes the version of the puzzle given at MOP.
See the author notes for the public version given after MOP.

This kick-off puzzle is started by looking at the test passwords.

## Hints about the passwords

There were a few hints that the passwords to this year's
MOP tests were not random:

- The unusual structure of the passwords (hashtag in 7th character always).
- Returning students might also have remembered a hidden message
  being contained in the passwords the previous year.
- During [Assembly Meeting 1](/static/2021/onlinemop/assembly-hint.png), sections on the left
  had first letters spelling out `TEST PASSWORD`.
- The world map had the password to Sample 0 spelled out in emojis.
  ![123689ACDE#0](/static/2021/onlinemop/sample-breadcrumb.png)

## The message in the passwords

The passwords to the MOP 2021 tests, in the order they appear, are:

| Test        | Password       |
| ----------- | -------------- |
| Sample0     | `123689ACDE#0` |
| Quiz1       | `_MDITF#6`     |
| Test2       | `_YFHML#D`     |
| Test3       | `EL_E_R#C`     |
| Test4       | `ERT_IW#9`     |
| Quiz5       | `HE_TH_#8`     |
| MockIMODay1 | `IONNNP#1`     |
| MockIMODay2 | `REOBSO#A`     |
| Quiz6       | `S_E__O#3`     |
| Test7       | `TUEDD_#2`     |

With the exception of the Sample0 edge case,
these passwords are in alphabetical order.
So the first step is to reorder the passwords by the last digit,
which turns out to correspond to the string in Sample0.

| Test        | Password   |
| ----------- | ---------- |
| MockIMODay1 | `IONNNP#1` |
| Test7       | `TUEDD_#2` |
| Quiz6       | `S_E__O#3` |
| Quiz1       | `_MDITF#6` |
| Quiz5       | `HE_TH_#8` |
| Test4       | `ERT_IW#9` |
| MockIMODay2 | `REOBSO#A` |
| Test3       | `EL_E_R#C` |
| Test2       | `_YFHML#D` |

Reading the passwords, one finds what is evidently a message
(with underscores denoting spaces),
although it seems like the last row of the table is missing.
This is confirmed by the Sample0 password having an `E` in it,
which is apparently not here.
Filling in the last row to complete words gives the following:

| Test        | Password   |
| ----------- | ---------- |
| MockIMODay1 | `IONNNP#1` |
| Test7       | `TUEDD_#2` |
| Quiz6       | `S_E__O#3` |
| Quiz1       | `_MDITF#6` |
| Quiz5       | `HE_TH_#8` |
| Test4       | `ERT_IW#9` |
| MockIMODay2 | `REOBSO#A` |
| Test3       | `EL_E_R#C` |
| Test2       | `_YFHML#D` |
| ?           | `Y_IIAD#E` |

Reading down the columns (like MOP 2020),
this spells the message
`IT'S HERE YOU MERELY NEED TO FIND IT BEHIND THIS MAP OF WORLD`.

This clues looking at the MOP 2021 world map
and seeing what is going on there.
(Really observant MOP students might have noticed that, behind the world map,
one would see the word "Loading..." while the main image started up.)
If one makes a copy of the document and moves the items aside,
one finds a large downwards arrow.
Opening the arrow leads to the MOSP website and starts the hunt.

## Finding the hidden tests

Upon reaching the MOSP website for the first time,
solvers are greeted with the answer checker to K
and are prompted with the following message:

> - To solve K, you need to find Test 8, Quiz 8, and Mock IMO Day 3.
> - Each of these is a brand-new PDF you'll need to find the link to.
> - You do NOT need to guess URL's under web.evanchen.cc.
>   You may need to guess URL's in other places.

So, the solvers start to look for these exams in other places.
If the solver thinks back to where the arrow in the map was pointing,
it was pointing towards the TinyURL at the bottom of the page.
(This was hinted on the scavenger hunt spreadsheet as well,
with the hidden message `hi~ congrats on finding this message
when you find the arrow look where it's pointing` in cells
that looked like they were blank.)
Together with the suspicious 8's at the end of the URL,
solvers need to guess three tinyURL's for Test 8, Quiz 8, and Mock IMO Day 3.

This gives the solver three new files containing problems from past MOP tests.
They are password protected, but the password is known from earlier step.

## Colors

Each of the secret tests had 24 problems in it.
Taking the Red test as an example,
one sees that the odd-numbered problems were all P1 on some Red test,
while the even-numbered problems were all P2 on some Red test.
This naturally suggests pairing the problems into 12 pairs.

For each pair, the solver writes down the test it came from
and the hexadecimal digit at the end of the corresponding password.
In this way, one obtains 12 hexadecimal color codes.
(The step of looking at hexadecimal colors was
also clued in [tests on Gradescope](/static/2021/onlinemop/gradescope-hint.png),
in which the due times spelled out `HEX COLORS` via A1Z26 on the
irregular minute times.)

Each of the colors has a
[canonical name](https://www.colorhexa.com/color-names);
these are also the top results
obtained when searching the specific hex code.

| \#  | Color                  | Red | Green | Blue |
| --- | ---------------------- | :-: | :---: | :--: |
| 1   | Urobilin               | E1  |  AD   |  21  |
| 2   | Smoky black            | 10  |  0C   |  08  |
| 3   | Amethyst               | 99  |  66   |  CC  |
| 4   | Cocoa brown            | D2  |  69   |  1E  |
| 5   | Harvard crimson        | C9  |  00   |  16  |
| 6   | Ruddy pink             | E1  |  8E   |  96  |
| 7   | Old rose               | C0  |  80   |  81  |
| 8   | Medium candy apple red | E2  |  06   |  2C  |
| 9   | Amethyst               | 99  |  66   |  CC  |
| 10  | KU Crimson             | E8  |  00   |  0D  |
| 11  | Eton blue              | 96  |  C8   |  A2  |
| 12  | Yellow green           | 9A  |  CD   |  32  |

(The fourth color is also called Cinnamon or Chocolate in some places.)
Reading the first letters of the colors spells
`USA CHROMA KEY`{.answer}, the answer.
