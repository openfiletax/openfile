#! /usr/bin/env python3

# Simple script to output the TIN that's expected for a given email address for any environment using csp-simulator
#
# Usage: ./predictable-tin.py EMAIL_ADDRESS

import sys
import hashlib
import typing


def calculate_tin(email: str):
    # nosemgrep: bandit.B303-2
    sha1 = hashlib.sha1()
    sha1.update(f'{email}:IAL2'.encode('utf-8'))
    predictable_last_four = int.from_bytes(sha1.digest()[0:2], 'big') % 9999
    return f'123-00-{predictable_last_four:04d}'


def main():
    if (sys.argv.__len__() > 1):
        print(calculate_tin(sys.argv[1]))
    else:
        print(f'Usage: {sys.argv[0]} EMAIL_ADDRESS')

if __name__ == '__main__':
    main()
