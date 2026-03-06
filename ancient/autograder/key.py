from math import gcd
import sympy
import sys
import A186428

MAX = 10000

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

def run_relay(M: int):
	a = M
	b = M
	for i in range(1,8):
		a = globals()[f'f{i}'](a)
		print(i, a)
	for i in range(15,8,-1):
		b = globals()[f'f{i}'](b)
		print(i, b)
	print("FINAL", f8(a,b))

if __name__ == "__main__":
	M = int(sys.argv[1]) if len(sys.argv) >= 2 else 36
	run_relay(M)
	# import cProfile
	# cProfile.run(f'run_relay({M})')

