import pandas as pd
df = pd.read_csv('interplanetary-parsed.csv')

from collections import defaultdict
counter = defaultdict(lambda: [0, 0]) # [success, fail]

for row in df.iterrows():
    success, type_mission, to = row[1][1], row[1][2], row[1][4]
    if success:
        counter[(to, type_mission)][0] += 1
    else:
        counter[(to, type_mission)][1] += 1

counter_object = defaultdict(lambda: [0, 0]) # [success, fail]
for row in df.iterrows():
    success, type_mission, object_type = row[1][1], row[1][2], row[1][5]
    if success:
        counter_object[(object_type, type_mission)][0] += 1
    else:
        counter_object[(object_type, type_mission)][1] += 1

with open('success_rate_planet.csv', 'w') as f:
    f.write(','.join(['to', 'type', 'success', 'success_rate', 'total']) + '\n')
    for item in counter:
        to, type_mission = item
        success, fail = counter[item]
        f.write(','.join([to, type_mission, str(success), str(success / (success + fail)), str(success + fail)]) + '\n')

with open('success_rate_object.csv', 'w') as f:
    f.write(','.join(['object', 'type', 'success', 'success_rate', 'total']) + '\n')
    for item in counter_object:
        object_type, type_mission = item
        success, fail = counter_object[item]
        print('    ', item)
        print('   ', success, fail)
        f.write(','.join([object_type, type_mission, str(success), str(success / (success + fail)), str(success + fail)]) + '\n')