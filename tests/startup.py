import subprocess
import datetime
import sys
import time

TIMEOUT = 80
START_TIME = datetime.datetime.now().timestamp()

print("Start")

while datetime.datetime.now().timestamp() - START_TIME <= TIMEOUT:
    output = subprocess.run(["make", "logs"], text=True, capture_output=True)
    print("OUT: ", output.stdout[-500:])
    print("ERR: ", output.stderr[-100:])
    if output.stdout.find("INFO:     Application startup complete.") >= 0:
        print("Startup successfull")
        sys.exit(0)
    time.sleep(5)

print("Startup failed")
sys.exit(1)
