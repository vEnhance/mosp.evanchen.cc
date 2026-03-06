from typing import List, Optional
import unittest
import string
import key   # answer key
import json
import signal
import sys
import traceback

#import logging
#logging.basicConfig(level=logging.DEBUG,filename='wtf.log')

try:
	import relay
except ImportError:
	IMPORTED = False
	traceback.print_exc()
else:
	IMPORTED = True

from gradescope_utils.autograder_utils.json_test_runner import JSONTestRunner
from gradescope_utils.autograder_utils.decorators import partial_credit, number, leaderboard, weight

SECRET_INPUT = 36

def timeout_handler(signum, frame):
	raise TimeoutError()
signal.signal(signal.SIGALRM, timeout_handler)

class FARMLautograde(unittest.TestCase):
	IMPORT_FAIL_MESSAGE = "Importing failed. " \
			"Did you follow the instructions? "
	def setUp(self):
		self.key = key

	@weight(0)
	def test_00(self):
		"""Check imports and function definitions"""
		if IMPORTED is False:
			self.fail(self.IMPORT_FAIL_MESSAGE)
		for n in range(1,15):
			if not hasattr(relay, f'f{n}'):
				self.fail(f"Function f{n} not defined.")

	def main(self, M : int):
		"""This is a list indexed for 0 <= n < =16
		The 0'th and 16'th entries are the SECRET_INPUT.
		Each other n is a value as follows:
		None: not graded
		-1: graded and marked incorrect
		>= 0: the correct answer to the question, which the cow indeed obtained"""
		self.attempts : List[Optional[int]] = [M,]
		for _ in range(15):
			self.attempts.append(None)
		self.attempts.append(M)
		self.run_segment(1, 8, 1)
		self.run_segment(15, 8, -1)
		if self.correct(7) and self.correct(9):
			self.verify(8, self.attempts[7], self.attempts[9])

	def run_segment(self, start, stop, step):
		for n in range(start, stop, step):
			previous_answer = self.attempts[n - step]
			if not self.verify(n, previous_answer):
				break

	def verify(self, n : int, *args) -> bool:
		answer = getattr(self.key, 'f'+str(n))(*args)
		try:
			signal.alarm(1)
			self.attempts[n] = getattr(relay, 'f'+str(n))(*args)
			signal.alarm(0)
			if isinstance(self.attempts[n], float):
				self.attempts[n] = -4 # wrong type
			elif not isinstance(self.attempts[n], int):
				self.attempts[n] = -5 # wrong type
			elif self.attempts[n] != answer:
				self.attempts[n] = -1 # wrong answer (negatives wrong)
		except TimeoutError:
			self.attempts[n] = -2 # timed out
		except:
			self.attempts[n] = -3 # other exception raised
		a = self.attempts[n]
		return a is not None and a > 0

	def correct(self, n : int):
		a = self.attempts[n]
		if a is None:
			return False
		return a >= 0

	@weight(0)
	def test_hacking(self):
		"""Reverse-engineering attempt"""
		if not hasattr(relay, 'reverse_engineered'):
			self.skipTest('No attempt made to hack')
		hack : str = getattr(relay, 'reverse_engineered')
		self.assertEqual(type(hack), str, "Needs to be a string")
		self.assertEqual(len(hack), 17, "Wrong length for string")
		self.assertEqual(hack[0], hack[-1], "First and last characters don't match")

		self.main(SECRET_INPUT)
		if not self.correct(8):
			self.skipTest('Need to finish the relay before hacking it')
		for n in range(0,16):
			if self.attempts[n] != ord(hack[n]):
				print(r"Expected {self.attempts[n]} but got {ord(hack[n])}")
				self.fail(f"❌ Wrong answer for n = {n}")

	@leaderboard("Solves")
	def test_leaderboard_0_solves(self, set_leaderboard_value = None):
		score = 0
		Mset = [37, 38, 39, 41, 43, 45, 46, 47, 48, 50, \
				51, 52, 55, 57, 59, 85, 86, 91, 93, 94, \
				109, 114, 115, 117, 119, 157, 158, 163, 164, 166, \
				228, 229, 231, 232, 254, 256]
		for M in Mset:
			self.main(M)
			verdicts = [n for n in range(1,16) if self.correct(n)]
			score += len(verdicts)
		set_leaderboard_value(score)

	@leaderboard("Characters")
	def test_leaderboard_1_chars(self, set_leaderboard_value = None):
		with open(relay.__file__) as f:
			source = '\n'.join(line for line in f)
		set_leaderboard_value(len([_ for _ in source if not _ in string.whitespace]))

cluephrase = 'Call in SAY NO TO COMBO'
letters = cluephrase + cluephrase[-2::-1]
partial_fraction_numbers = [ord(_) for _ in letters]
assert len(partial_fraction_numbers) == 45, len(partial_fraction_numbers)

def pre_check(n : int) -> List[int]:
	if n == 8:
		return list(range(1,8))+list(range(8,15))
	elif n <= 7:
		return list(range(1,n))
	else:
		return list(range(16,n+1,-1))
for n in range(1,16):
	a,b,c = partial_fraction_numbers[3*(n-1):3*n]
	numerator = b*c+1
	denominator = a*b*c+a+c
	assert c != 1
	def make_test_function(n : int, score : int, total : int):
		@number(f"R-{n:02d}")
		@partial_credit(total)
		def _f(self : FARMLautograde, set_score = None):
			self.main(SECRET_INPUT)
			if self.attempts[n] is None:
				self.skipTest(f"⏭️ Relay did not reach R-{n:02d}")
			elif self.attempts[n] == -1:
				self.fail(f"❌ Wrong answer on R-{n:02d}")
			elif self.attempts[n] == -2:
				self.fail(f"⌛ Time limited exceeded on R-{n:02d}")
			elif self.attempts[n] == -3:
				self.fail(f"⚠️  Exception raised on R-{n:02d}")
			elif self.attempts[n] == -4:
				self.fail(f"🤦 Wrong type on R-{n:02d}: got a float, please return ints")
			elif self.attempts[n] == -5:
				self.fail(f"🤦 Wrong type on R-{n:02d}: please return ints")
			else:
				# Passed check
				set_score(score)
		_f.__doc__ = f"Relay R-{n:02d}"
		return _f

	setattr(FARMLautograde, f'test_{n:02d}',
					make_test_function(n, numerator, denominator))
	
SUCCESS_STRING = """🎉🎉🎉 Relay completed! The answer 97 from cow #8 was correct."""
HACK_STRING = SUCCESS_STRING + '\n' * 2 + """🔥🔥🔥 EXTRA CREDIT:

Re-submit with one additional global variable:

reverse_engineered = "????????????????"

This should be a string of length seventeen such that,

(1) reverse_engineered[0] = reverse_engineered[16] are the ASCII character corresponding to the moderator's secret choice M.

(2) For all 1 <= n <= 15, reverse_engineered[n] is the ASCII character corresponding to the answer to relay question n.

For example, reverse_engineered[8] = 97 = ord('a').
"""

HACKED_STRING = r"""🏁🏁🏁 Reverse-engineering successful!
Much partial credit awarded ;)"""

if __name__ == '__main__':
	import time
	suite = unittest.makeSuite(FARMLautograde)
	if len(sys.argv) >= 2:
		unittest.main()

	t0 : float = time.time()
	with open('/dev/null', 'w') as f:
		runner = JSONTestRunner(visibility='visible',
				stdout_visibility='hidden', stream=f)
		runner.run(suite)
	t1 : float = time.time()
	# pre-process stuff
	data = runner.json_data
	data['score'] = len([t for t in data['tests'] if t['score'] > 0])

	hacked = any((
		'Reverse-engineering' in t['name'] 
			and not 'output' in t) for t in data['tests'])
	got_relay_final = False
	for t in data['tests']:
		if t['score'] > 0:
			if t['name'] == 'Relay R-08':
				t['output'] = SUCCESS_STRING
				got_relay_final = True
			else:
				r = t['name'][6:]
				t['output'] = f"✅ {r} Passed"
		else:
			if 'output' in t:
				s = t['output'].strip()
				if '\n' in s:
					t['output'] = s[s.rindex('\n')+1:]
			elif t['name'] == FARMLautograde.test_hacking.__doc__:
				t['output'] = HACKED_STRING
		if not hacked:
			t['score'] = int(t['score'] > 0)
			if t['name'].startswith('Relay'):
				t['max_score'] = 1
	if got_relay_final:
		if hacked:
			data['output'] = HACKED_STRING
		else:
			data['output'] = HACK_STRING

	data['leaderboard'].append({
		'name' : 'Runtime (ms)',
		'value' : round(1000*(t1-t0)),
		'order' : 'desc',
		})

	with open('/autograder/results/results.json', 'w') as f:
		json.dump(data, f, indent=4)
	json.dump(data, sys.stdout, indent=4)

