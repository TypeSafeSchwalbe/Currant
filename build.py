
import sys

joined_file = ""

for file_index in range(2, len(sys.argv)):
    file_path = sys.argv[file_index]
    with open(file_path) as file:
        joined_file = joined_file + "\n// \"" + file_path + "\"\n" + file.read() + "\n\n\n"

with open(sys.argv[1], "w") as output:
    output.write(joined_file)