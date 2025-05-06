import threading
import time

def cpu_stress():
    while True:
        pass  # Busy loop to keep CPU core occupied

# Number of threads = number of CPU cores to stress
num_threads = 4  # Change this to match your CPU core count

threads = []
for _ in range(num_threads):
    t = threading.Thread(target=cpu_stress)
    t.daemon = True  # So they exit when the main script ends
    threads.append(t)
    t.start()

print(f"Generating CPU load with {num_threads} threads. Press Ctrl+C to stop.")
try:
    while True:
        time.sleep(1)
except KeyboardInterrupt:
    print("Stopped.")
