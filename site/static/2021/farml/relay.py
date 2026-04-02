# A few useful utility functions; you don't have to use them


def int_to_base(x: int, base: int) -> tuple[int, ...]:
    """Returns a tuple of base-b digits for integer x."""
    assert base >= 2 and x >= 0
    digits: list[int] = []
    while x:
        digits.append(int(x % base))
        x = int(x / base)
    return tuple(reversed(digits))


def get_primes(n: int) -> list[int]:
    """Returns a list of prime numbers < n."""
    # https://stackoverflow.com/a/3035188/4826845
    assert n > 0
    sieve = [True] * n
    for i in range(3, int(n**0.5) + 1, 2):
        if sieve[i]:
            sieve[i * i :: 2 * i] = [False] * ((n - i * i - 1) // (2 * i) + 1)
    return [2] + [i for i in range(3, n, 2) if sieve[i]]


# --- end ---


def f1(TNYWR):
    return -1


def f2(TNYWR):
    return -1


def f3(TNYWR):
    return -1


def f4(TNYWR):
    return -1


def f5(TNYWR):
    return -1


def f6(TNYWR):
    return -1


def f7(TNYWR):
    return -1


def f8(TNYWR7, TNYWR9):
    return -1


def f9(TNYWR):
    return -1


def f10(TNYWR):
    return -1


def f11(TNYWR):
    return -1


def f12(TNYWR):
    return -1


def f13(TNYWR):
    return -1


def f14(TNYWR):
    return -1


def f15(TNYWR):
    return -1
