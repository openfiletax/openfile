#! /usr/bin/env python3

from os import urandom
from binascii import hexlify

def genKey():
    randomBytes = urandom(32)
    return hexlify(randomBytes)

print(genKey().decode('ascii'))