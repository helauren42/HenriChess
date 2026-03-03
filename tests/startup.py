import subprocess
import datetime
import sys

TIMEOUT = 120
START_TIME = datetime.datetime.now().timestamp()

while datetime.datetime.now().timestamp() - START_TIME <= TIMEOUT:
    output = subprocess.run(["docker", "compose", "logs"], text=True, capture_output=True)
    if output.stdout.find("INFO:     Application startup complete.") >= 0:
        print("Startup successfull")
        sys.exit(0)

print("Startup failed")
sys.exit(1)
