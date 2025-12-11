from abc import ABC
from enum import Enum
import os
import sys
import logging
from typing import Literal

mylog = logging.Logger("main")
mylog.setLevel(logging.DEBUG)

fileHandler = logging.FileHandler("./logger/logs.log")
fileHandler.setLevel(logging.WARNING)
mylog.addHandler(fileHandler)
streamHandler = logging.StreamHandler(sys.stdout)
mylog.addHandler(streamHandler)

