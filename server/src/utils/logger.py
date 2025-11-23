import sys
import logging

mylog = logging.Logger("main")
mylog.setLevel(logging.DEBUG)

fileHandler = logging.FileHandler("./logger/logs.log")
mylog.addHandler(fileHandler)
streamHandler = logging.StreamHandler(sys.stdout)
mylog.addHandler(streamHandler)
