import os
from PIL import Image
import numpy as np

from matplotlib import pyplot as plt


def visualize_depth_maps():
  """Compute mpi from an image."""
  range_entries = [[]] * 2020
  entries = []

  rootDir = '/google/src/cloud/ellenj/load_images/google3/learning/vis/illusions_depth/output/'
  for dirName, subdirList, fileList in os.walk(rootDir):
    if dirName == '/google/src/cloud/ellenj/load_images/google3/learning/vis/illusions_depth/output/':
      continue
    image_path = dirName + '/output.png'

    try:
      art_image = Image.open(image_path)
    except:
      print('unable to load image')

    image_pixels = np.array(art_image)

    image_mean = np.mean(image_pixels)
    image_var = np.var(image_pixels)

    subdir = dirName.split('/')[-1]
    if(len(subdir) > 16 and len(subdir) < 22):
      label = [x[0] for x in entries]

      year = subdir.split('_')[0]


      # if int(year) not in label:
      entries.append((int(year), [np.min(image_pixels), np.max(image_pixels)]))
      range_entries[int(year)].append(image_var)

  sorted_entries = sorted(entries)
  for entry in sorted_entries:
    print('start')
    print(entry)


  # label = [x[0] for x in sorted_entries]
  # variances = [x[1] for x in sorted_entries]
  label = range(0,2020)
  variances = [np.mean(entry) for entry in range_entries]

  label = label[1400:]
  variances = variances[1400:]



  # this is for plotting purpose
  index = np.arange(len(label))
  plt.bar(index, variances)
  plt.xlabel('Genre', fontsize=5)
  plt.ylabel('No of Movies', fontsize=5)
  plt.xticks(index, label, fontsize=5, rotation=30)
  plt.title('Market Share for Each Genre 1995-2017')
  plt.show()


visualize_depth_maps()
