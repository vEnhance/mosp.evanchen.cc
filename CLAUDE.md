## Task overview

In 2021 and 2022 I ran a puzzle hunt on `mosp.evanchen.cc` that was hosted using
a little Django server. It only went two years.
Since then, keeping the Django server alive has become a maintenance burden
and moreover parts of the hunt that used to work have become defunct.

Therefore, my goal is to create a new _Typescript-based repository_ that will
generate a _static HTML/CSS/JS website_ that I can use to host a serverless
archive of this puzzle hunt.
This involves migrating some old code, rewriting some Python into TS,
and also redoing some of the old components.
The goal is that I can execute the code in this repo and deploy it to a static
bucket to host an archival version of the hunt.

This involves two main steps:

- First, rewrite all the scaffolding to work as a static Typescript website
  that can be uploaded to a bucket.
- Then, rewrite any individual puzzles that need to be redone in an
  archival-friendly format, see below.

## Repository overview

Right now, there are two git submodules inside the `ancient/` folder.
If you pull them, you can see old versions of the puzzle.

`mosp-web` is the main interesting one.
It has a simple Python Django webserver that was used to track
the user's progress, check answers, and so on.
We want to rewrite those templates and logic into Typescript.

Note in particular the fixtures under `mosp-web` which contain all the puzzle
data, and the corresponding solutions.
Reading the solutions will inform you how each puzzle worked.

## Hunt details

Chapter 0 (from 2021) contains a single puzzle called Bridge: K.
It can be translated easily.

Chapter 1 (from 2021) contains the following puzzles we should adapt:

- Calendar: The IMO Begins is a javascript puzzle.
  You can use the old typescript for that.
- Classroom: mtbcupg is a blank puzzle that used to be inside Google Classroom.
  Since GClassroom still works, we can leave this for now.
- Discord: Kindergarten used to be a puzzle about talking to a Discord bot.
  Since we don't have the capacity to keep maintaining that,
  we should make a static JavaScript version of a Discord chat
  that simulates what the Discord bot used to do.
  In the submodule `mosp-2021/core/mospbot.py`
  you'll be able to see the emoji logic
- Gradescope: P53GZ7 is a puzzle that used to be inside Gradescope.
  Since GradeScope still works, we can leave this for now.
- Handbook: Lost In Translation is a straightforward static puzzle.
- Zoom: Zoom Network Park is a puzzle with some minimal JavaScript components
  that used to involve dialing into Zoom meetings.
  We should create a fake Zoom client that opens in a new window
  to simulate that past interactive component.
- Map: Sticks and Stones is a straightforward static puzzle.

In many cases, the `mosp-2021` submodule contains construction files
that would be needed to re-create adaptions of the puzzles.
If you feel there is still information missing needed, please say so.

Chapter 2 puzzles (from 2022) are all static PDF's and straightforward to adapt.

For puzzles where we are adapting significantly, include a "fourth-wall text"
explaining what's going on. For example, for Zoom Network Park,
we could say "During the actual hunt, solvers had to dial in real Zoom meetings.
For the archival version, you can use this [Zoom client simulator](LINK)
instead in place of a real Zoom client".
