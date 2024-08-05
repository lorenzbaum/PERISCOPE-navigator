# %% Analyze the ACBC estimation results for calculating the quantiles of the distribution of the utility of the alternatives.

# First, read the results from the ACBC estimation from a csv and store them in a variable.
# Next, analyze the results by calculating the average utility of each alternative.
# Finally, calculate the quantiles of the distribution sum of the utilities of the attribute levels and store them as a json file.

import itertools
import json

import numpy as np
import pandas as pd

# %% Ask for filename and path
filename = input("Enter the filename+path of the ACBC estimation results: ")
country_code = input("Enter the country code: ")

include_none = input("Include NONE option? (Y/n): ").lower()
include_none = True if include_none == "y" or include_none == "" else False

# %% Read the results from the ACBC estimation from a csv and store them in a variable.
results = pd.read_csv(filename)
print(results.head())

# %% Analyze the results by calculating the average utility of each alternative.
# Calculate the average utility of each alternative.
average_utilities = results.mean()
print(average_utilities)
# Drop the first and second column of the average_utilities.
average_utilities = np.array(average_utilities)[2:]

# %% Store the average utility of each alternative as a json file.

utilities_dict = {
    'sector': {
        'primary': average_utilities[0],
        'energy': average_utilities[1],
        'trade': average_utilities[2],
        'transport': average_utilities[3],
        'services': average_utilities[4],
        'media': average_utilities[5],
        'finance': average_utilities[6],
        'public': average_utilities[7],
        'education': average_utilities[8],
        'health': average_utilities[9],
    },
    'monetization': {
        'direct monetization': average_utilities[10],
        'direct monetization other market side': average_utilities[11],
        'indirect monetization': average_utilities[12],
    },
    'privacySettings': {
        'control': average_utilities[13],
        'not control': average_utilities[14],
    },
    'dataSource': {
        'internal data': average_utilities[15],
        'internal + public data': average_utilities[16],
        'internal + public + external data provider': average_utilities[17],
    },
    'dataTypes': {
        'basicDemographicsData': average_utilities[18],
        'personalPreferenceData': average_utilities[19],
        'contactInformationData': average_utilities[20],
        'communityInteractionData': average_utilities[21],
        'financialInformationData': average_utilities[22],
        'secureIdentifiersData': average_utilities[23],
        'specialCategoriesOfPersonalData': average_utilities[24],
    },
    'internalDataUse': {
        'personalization and user experience': average_utilities[25],
        'business operations': average_utilities[26],
    },
    'externalDataUse': {
        'raw data': average_utilities[27],
        'analyzed data': average_utilities[28],
        'no external use': average_utilities[29],
    },
    'externalDataUsers': {
        'value chain': average_utilities[30],
        'platform users': average_utilities[31],
        'anyone': average_utilities[32],
    },
    'dataTransferFrequency': {
        'on request': average_utilities[33],
        'continuously': average_utilities[34],
    },
    'dataAnonymization': {
        'anonymized': average_utilities[35],
        'not anonymized': average_utilities[36],
    },
    'NONE': average_utilities[37]
}

if not include_none:
    utilities_dict.pop('NONE')

# Read existing json utilities file and update it with the new utilities.
with open("utilities.json", "r") as file:
    utilities = json.load(file)
    utilities[country_code] = utilities_dict

with open("utilities.json", "w") as file:
    json.dump(utilities, file)

# %% Calculate the quantiles of the distribution of the utility of the alternatives using itertools.
# Calculate the quantiles of the distribution of the utility of the alternatives.
# For this, the sum of all possible combinations of the utilities of the alternatives is calculated.
utilities = [
    average_utilities[0:10],  # sector
    average_utilities[10:13],  # monetization
    average_utilities[13:15],  # privacySettings
    average_utilities[15:18],  # dataSource
    average_utilities[18:25],  # dataTypes
    average_utilities[25:27],  # internalDataUse
    average_utilities[27:30],  # externalDataUse
    average_utilities[30:33],  # externalDataUsers
    average_utilities[33:35],  # dataTransferFrequency
    average_utilities[35:37],  # dataAnonymization
    [average_utilities[37]]  # NONE
]
if not include_none:
    utilities.pop()

combination_sums = np.array([sum(combination) for combination in itertools.product(*utilities)])

# %% Calculate the 101 quantiles of the distribution of the utility of the alternatives.
q = np.round(np.linspace(0, 1, 101), 2)
quantiles = np.stack([np.arange(0, 101, 1), np.quantile(combination_sums, q)], axis=1)

# %% Store the quantiles of the distribution of the utility of the alternatives as a json dictionary.

# Read existing json quantiles file and update it with the new quantiles.
with open("quantiles.json", "r") as file:
    quantiles_dict = json.load(file)
    quantiles_dict[country_code] = {int(q): u for q, u in quantiles}

with open("quantiles.json", "w") as file:
    json.dump(quantiles_dict, file)
