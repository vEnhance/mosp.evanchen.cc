After a bit of descent, you find yourself near the start of
a familiar-looking bridge.
Not the bridge you started from though;
it's the one you saw at the start of camp.

The whole situation seems surreal to you,
as you realize that, despite having descended farther
underground, you have somehow ended up near where you started.
How could that be possible?
You're not sure, but nothing from this trip was making much sense anyways.

## To be continued!

We hope you enjoyed the event!
The puzzles and art in this hunt were brought to you by

- Evan Chen (aka, "the kid who wrote the puzzle", according to one test-solver)
- Isabella Quan
- Sanjana Das
- Serena An

We'd also like to thank our cohort of test-solvers:

> Andrew Gu, Andrew Wu, Angela Guo, Ankan Bhattacharya, Catherine Zheng, Clayton Snider, Danielle Wang, Fernando Salinas-Arreola, Holden Mui, Janabel Xia, Kara Amar, Maggie Lin, William Yue.

We hope you had fun working on it!
Congratulations especially to Andrew Gu,
Ankan Bhattacharya, Danielle Wang, William Yue
for finishing the entire hunt during the test-solving process.

## Postscript

Apparently Steve was serious about the reference letter.

<div id="letter" markdown="1">
<div id="letter-date"></div>

Work reference letter on behalf of the  
Assistant director of the Mathematical Olympiad Summer Program

To whom it may concern,

I'm writing to recommend <span class="name fullname"></span>
for an unspecified position at your organization.
I worked with <span class="name firstname"></span>
at MOSP in 2011.

In case you are not familiar,
the Mathematical Olympiad Summer Program is an
annual invitational intensive summer program
held at the University of Nebraska-Lincoln.
MOSP gives these top students experience
in solving mathematical problems requiring deep analysis
and great insight, beyond what's taught at even the best high schools.
Full days of classes and exams gives students
thorough preparation in important areas of mathematics,
ensuring the IMO record of the Untied States properly reflects
the energy and creativity of its brightest students.

<span class="name firstname"></span> served as the assistant director
of this year's camp.
Due to unusual circumstances, the assistant director
had a wide variety of tasks to work on this year,
on little or no advance notice.
Despite the strenuous conditions,
<span class="name firstname"></span> completed all
the sporadic duties with great success, including:

- debugging issues with our Zoom communications network,
- playing date tetris with events for MOSP;
- solving crosswords with no clues;
- organizing programming competitions for cows;
- writing haikus under timed conditions.

Overall, I was deeply impressed with the autonomy, independence,
and resourcefulness that I saw throughout MOSP.

Please forgive me for rambling briefly.
There is an adage that goes "a word to the wise is sufficient".
For me, this has always described
what it means for someone to be reliable.
Give one word of instruction,
and they will take care of everything else.
You don't spell anything out,
because you simply trust them to handle things.

Well, if wisdom is one word being sufficient,
here's what makes <span class="name firstname"></span> special:
zero words are sufficient too.
All you have to do is say, "you're the assistant director now",
and you can disappear into thin air.

That's why it is my great pleasure to recommend
<span class="name firstname"></span> for an unspecified position,
with no hesitation or reservations.

Sincerely,  
![Steve](/static/2021/steve-sig.png){.signature}
Academic Director, Math Olympiad Summer Program  
Untied States of America
</div>

<script type="text/javascript">
(function() {
const formatter = new Intl.DateTimeFormat('en-US', {dateStyle: 'full'});
let letter_date = localStorage.getItem('letter_date');
if (!letter_date) {
	const now = new Date(Date.now());
	now.setFullYear(2011);
	letter_date = formatter.format(now);
}
localStorage.setItem('letter_date', letter_date);
$("#letter-date").html(letter_date);
})();
</script>

<style type="text/css">
#letter {
	font-size: 17px;
	font-family: Garamond, serif;
	border: 2px solid black;
	padding: 80px 70px 30px 70px;
	background-color: white;
}
#letter .name.fullname {
	color: inherit;
}
#letter .name.firstname {
	color: inherit;
	font-weight: inherit;
}
#container img.signature {
	margin: 0px 0px 0px 0px;
	width: 128px;
	border: none;
}
</style>
