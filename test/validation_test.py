
from resources.user import *


def test_isValidMail():
    assert isValidMail("example123@gmail.com") == True
    assert isValidMail("example@com") == False
    assert isValidMail("example-email") == False
    assert isValidMail("@example.com") == False
    assert isValidMail("example$@gmail.com") == False
    assert isValidMail("example.com") == False

def test_isValidPwd():
    assert isValidPwd("abcd1234") == True
    assert isValidPwd("A1b2c3d4") == True
    assert isValidPwd("abcdefg") == False
    assert isValidPwd("12345678") == False
    assert isValidPwd("abc123") == False
    assert isValidPwd("") == False
    assert isValidPwd("@12345678") == False
    assert isValidPwd("@ab13245678") == True
