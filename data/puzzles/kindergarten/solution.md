## Introduction

Contacting Steve with the message "teach me a lesson"
yields the following haiku:

> Don't know 🍎🐝🌘's?  
> Want to learn to count with me?  
> Join `#kindergarten`!

The three emojis are hinting "ABC", in line with the puzzle theme.
The solver then finds they now have access to a new channel
in the MOSP Discord, the `#kindergarten` channel.

## Counting

As mentioned in the Acknowledgments, the Kindergarten puzzle
requires solvers to complete a counting exercise, hosted in the Discord.
As a tip-off to [Haikubot],
the solvers can't just type the numbers in:
they must format them as haikus using arithmetic operations, e.g.

> $7 - 6$  
> $1 \times 1 + 1 \times 1$  
> $3 \times 1 + 2$

Steve will confirm each correct line of the haiku,
presenting a particular emoji as each haiku is completed.
For reference, here is a [set of valid haikus from 1 to 75][haikus].

[haikus]: /static/2021/kindergarten/haiku.txt

## Trolls

Much like in the sister [Mystery hunt puzzle][ctam],
a few automated trolls are present,
which will mess up the count for the solvers.

- The **Helpful Firefly** will, after a few seconds, post the previous
  line written in chat with "+1" appended to it.
  This won't cause a miscount in terms of the next number,
  but it _will_ botch the syllable count unless (and only unless)
  the previous number is $1 \bmod 3$
  (in which case the "+1" adds two syllables to get a seven syllable line).
  Thus, when Helpful Firefly appears,
  solvers must rush to the next $1 \bmod 3$ number and stop there.
- The **Quiz Owl** will post a random early AMC 10 problem
  and nag the solvers to send it the answer via DM.
  If the answer isn't sent soon enough,
  the Quiz Owl will insist more loudly.
  If it still isn't sent, it will output the answer to the AMC problem,
  most likely causing a miscount.
- The **Singing Creodont** initiates a two-minute countdown once
  the threshold 42 is reached, forcing solvers to race to get
  as far as they can in the two minutes.
  (Once the countdown expires, the game ends.)

## Emojis

The first 23 haikus completed will generate emojis;
subsequent haikus (past the score 70) won't generate any additional information.

The Creodont will also tell the solvers that
extraction is possible after the first 17 haikus,
and the remaining haikus are just an additional hint.
Reproduced below is the Creodont's hint after 51 points are earned:

> Wow you passed 50!🥇  
> You made seventeen haikus 🤔  
> Emoji haiku? 🤯  
> You _could_ extract now 🔥  
> But I suggest you go on 💪  
> There are six more hints 💡  
> _This message is not a puzzle, so please don't read too much into it._

The 23 emojis obtained are:

> 🍵➗🍎↔️❓📧✖️👁️↔️💤➕❓🚁➖🌘↔️❓ 🇳 🇴 🇹 🍵💰🍵

As hinted, we arrange these in 5/7/5 format,
with an extra line of six characters.

> 🍵➗🍎↔️❓  
> 📧✖️👁️↔️💤➕❓  
> 🚁➖🌘↔️❓  
> 🇳 🇴 🇹 🍵💰🍵

The next steps are as follows:

1. These lines arrange to form equations:
   we substitute the four math symbols that appear with their operations,
   interpreting ↔️ as equals and ❓ as an unknown.
2. As suggested by the earlier message about 🍎🐝🌘 being ABC,
   the emojis canonically represent letters.
3. Using A=1, ..., Z=26, we can find the value of ❓ in each equation.
4. We convert that back into a letter.

The process is shown below

|          Haiku line          |    Letter equation     |    Number equation     | Answer | Letter |
| :--------------------------: | :--------------------: | :--------------------: | :----: | :----: |
|     🍵 $\div$ 🍎 $=$ ❓      |    $T \div A = {?}$    |   $20 \div 1 = {?}$    |  $20$  |  $T$   |
| 📧 $\times$ 👁️ $=$ 💤 $+$ ❓ | $E \times I = Z + {?}$ | $5 \cdot 9 = 26 + {?}$ |  $19$  |  $S$   |
|       🚁 $-$ 🌘 $=$ ❓       |     $H - C = {?}$      |     $8 - 3 = {?}$      |  $5$   |  $E$   |
|          NOT 🍵💰🍵          |       NOT $TST$        |

The abbreviation for `TSE` that best fits the hint "NOT TST" is
`TEAM SELECTION EXAM`{.answer}.

[Haikubot]: https://ytnomsnrub.github.io/haikubot/
[ctam]: https://perpendicular.institute/puzzle/so-you-think-you-can-count/solution/
