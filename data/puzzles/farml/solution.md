The only information given initially is the title of the puzzle,
which is a Gradescope join code.
Joining the class reveals the [super relay](SuperRelay.pdf),
and a Gradescope programming assignment to submit.

## Solving the relay

The first step is to solve the math problems.
Here is some sample code:

```python
def int2base(x, base):
	assert base >= 2
	assert x >= 0
	digits = []
	while x:
		digits.append(int(x % base))
		x = int(x / base)
	digits.reverse()
	return tuple(digits)

def get_primes(n):
	# https://stackoverflow.com/a/3035188/4826845
	""" Returns a list of primes < n """
	sieve = [True] * n
	for i in range(3,int(n**0.5)+1,2):
		if sieve[i]:
			sieve[i*i::2*i]=[False]*((n-i*i-1)//(2*i)+1)
	return [2] + [i for i in range(3,n,2) if sieve[i]]
PRIMES = get_primes(MAX)

def divisor_count(n):
	return len(list(sympy.divisors(n)))

def divisor_sum(n):
	return sum(list(sympy.divisors(n)))

def f1(n : int) -> int:
	return divisor_sum(n)

def f2(n : int) -> int:
	answer = 0
	count = 0
	for b in range(2,n+3):
		digits = int2base(n, b)
		if digits == digits[::-1]:
			answer += b
			count += 1
		if count == 3:
			break
	return 2*answer

def f3(n : int) -> int:
	assert n > 0
	count = 0
	x = 0
	while count < 20:
		x += 1
		if gcd(x,n) == 1:
			count += 1
	return x

def f4(n : int) -> int:
	for p in range(n+40,3,-1):
		if p in PRIMES:
			return p
	return 2

def f5(n : int) -> int:
	x = 5*n-200
	assert x % 3 == 0
	return x//3

def f6(n : int) -> int:
	assert n % 2 == 1
	if n % 4 == 1:
		return (n+1)//2
	else:
		return (n+3)//2

def f7(n : int) -> int:
	N = int(4*(2*n+1)/9)
	N -= N % 4
	if N % 8 == 4:
		return N
	elif 9*N <= 8*n:
		return N
	else:
		return N//4

def f8(n7 : int, n9: int) -> int:
	for p in PRIMES[1:]:
		if (pow(5,n9,p)+5-n7) % p == 0:
			return p
	raise ValueError("No prime")

def f9(n : int) -> int:
	assert n >= 5
	return 2 * n - 5

def f10(n : int) -> int:
	for d in range(int(n**0.5),2,-1):
		if n % d == 0:
			return (d+1)*(n//d-1)
	assert n in PRIMES
	return 2*(n-1)

def f11(n : int) -> int:
	# u v 2v 4v+u 9v+2u 20v+4u 44v+9u
	# max 20v+4u given 44v+9u <= TNYWR and u > 0
	assert n >= 53
	k = n-9
	v = k//44
	u_minus_one = (k-44*v)//9
	u = u_minus_one + 1
	return 20*v+4*u

def f12(n : int) -> int:
	for x in range(n,MAX+1):
		for b in range(2,int(x**0.5)):
			s = int2base(x, b)
			if len(s) == 3 and s[0] == s[2]:
				return x
	raise ValueError("No such integer")

def f13(n : int) -> int:
	assert n > 0
	answer = 1
	for p in PRIMES:
		if p > n**0.5:
			break
		while n % p == 0:
			n //= p
			answer *= p+2
	if n > 1:
		assert n in PRIMES
		answer *= n+2
	return answer

def f14(n : int) -> int:
	assert n in A186428.terms
	seq = A186428.seq
	i = seq.index(n)
	k = i+1
	assert k < n
	return seq[i-1]

def f15(n : int) -> int:
	assert n >= 12
	record = 0
	for d in range(1,n//12+1):
		for x in range(1,n//(2*d)):
			for y in range(1,n//(2*d*x)):
				a = 2*x*y*d
				b = (x*x-y*y)*d
				c = (x*x+y*y)*d
				if a+b+c <= n:
					record = max(record, a*b-c)
	assert record > 0
	return record
```

## Reverse-engineering

Once the relay is completed,
the solver is told that the finished relay has answer $97$.
They are also provided with the following prompt:

```text
🔥🔥🔥 EXTRA CREDIT:

Re-submit with one additional global variable:

reverse_engineered = "????????????????"

This should be a string of length seventeen such that,

(1) reverse_engineered[0] = reverse_engineered[16] are the
ASCII character corresponding to the moderator's secret choice M.

(2) For all 1 <= n <= 15, reverse_engineered[n] is the
ASCII character corresponding to the answer to relay question n.

For example, reverse_engineered[8] = 97 = ord('a').
```

Since the solver is promised $0 \le M \le 10000$,
it is pretty straightforward for the solver to ask their program
to check values of $M$ and see if any of them give $97$.
(Actually, there is really an implicit assumption that $0 \le M \le 255$,
since the values are promised to be in ASCII range.)
Doing so, one finds $M = 36$.
One then finds the reverse engineered string is actually readable: it is

```python
reverse_engineered = "$[0;a_1,a_2,a_3]$"
```

## Continued fraction

When the `reverse_engineered` string is correctly submitted, a new message
appears:

```text
🏁🏁🏁 Reverse-engineering successful!
Much partial credit awarded ;)
```

When this happens,
the score for the user skyrockets,
as does the denominators of the test cases
(beforehand, the user simply got 1 point for each answer).
The solver obtains the following table:

| Problem  | Numerator | Denominator |
|:--------:|----------:|------------:|
|   R-01   | 10477     |  702067     |
|   R-02   | 3361      |  363093     |
|   R-03   | 2657      |  292353     |
|   R-04   | 2849      |  185217     |
|   R-05   | 2529      |  197294     |
|   R-06   | 2529      |  212468     |
|   R-07   | 6084      |  407705     |
|   R-08   | 5215      |  344256     |
|   R-09   | 5294      |  407705     |
|   R-10   | 6637      |  212468     |
|   R-11   | 6163      |  197294     |
|   R-12   | 5786      |  185217     |
|   R-13   | 3521      |  292353     |
|   R-14   | 3457      |  363093     |
|   R-15   | 6500      |  702067     |

As hinted by the `reverse_engineered` string,
the solver should attempt to take the continued fraction expansion.
As expected, each continued fraction has exactly three parts.
For example,
\\\[ \frac{10477}{702067} = \frac{1}{67+\frac{1}{97+\frac{1}{108}}} = [0;67,97,108]. \\\]
Working out the rest of the continued fractions,
we get a sequence of numbers in ASCII range.
Doing the conversion then gives the following table:

| Problem  | Numerator | Denominator |$a_1$|$a_2$|$a_3$| 1 | 2 | 3 |
|:--------:|----------:|------------:|----:|----:|----:|:-:|:-:|:-:|
|   R-01   | 10477     |  702067     |  67 |  97 | 108 |`C`|`a`|`l`|
|   R-02   | 3361      |  363093     | 108 |  32 | 105 |`l`|   |`i`|
|   R-03   | 2657      |  292353     | 110 |  32 |  83 |`n`|   |`S`|
|   R-04   | 2849      |  185217     |  65 |  89 |  32 |`A`|`Y`|   |
|   R-05   | 2529      |  197294     |  78 |  79 |  32 |`N`|`O`|   |
|   R-06   | 2529      |  212468     |  84 |  79 |  32 |`T`|`O`|   |
|   R-07   | 6084      |  407705     |  67 |  79 |  77 |`C`|`O`|`M`|
|   R-08   | 5215      |  344256     |  66 |  79 |  66 |`B`|`O`|`B`|
|   R-09   | 5294      |  407705     |  77 |  79 |  67 |`M`|`O`|`C`|
|   R-10   | 6637      |  212468     |  32 |  79 |  84 |   |`O`|`T`|
|   R-11   | 6163      |  197294     |  32 |  79 |  78 |   |`O`|`N`|
|   R-12   | 5786      |  185217     |  32 |  89 |  65 |   |`Y`|`A`|
|   R-13   | 3521      |  292353     |  83 |  32 | 110 |`S`|   |`n`|
|   R-14   | 3457      |  363093     | 105 |  32 | 108 |`i`|   |`l`|
|   R-15   | 6500      |  702067     | 108 |  97 |  67 |`l`|`a`|`C`|

Reading this gives a phrase which has been repeated both forwards and backwards
(much like the super relay).
The phrase tells the solver to call in the answer, `SAY NO TO COMBO`{.answer}.