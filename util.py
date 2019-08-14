# Copyright 2019 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
# ==============================================================================

from base64 import decodestring

import os
import urlparse

import PIL.Image
from io import BytesIO

from densedepth_model.densedepth import test

def get_web_image(dataURL):
	"""Decodes the dataURL into a binary to create a PIL.Image.

	Args:
		dataURL: the Base64 representation of an image.
		
	Returns:
		A PIL.Image containing the dataURL's decoded binary.
	"""

	parsed_url = urlparse.urlparse(dataURL)
	head, raw_data = parsed_url.path.split(',', 1)

	decoded_data = decodestring(raw_data)
	image = PIL.Image.open(BytesIO(decoded_data))
	
	return image


def get_dense_depth_image(model, image):
	"""Tests a DenseDepth model with an image and gets the 
	binary of the generated image.

	Args:
		model: A DenseDepth model.
		image: A PIL.Image.
		
	Returns:
		The binary of the generated depth image.
	"""

	depth_image_from_model = test(model, image) 
	
	# TODO(ellenj): Find a better way to do this, without
	# saving to the file system.
	temp_path = "dd_image.png"
	depth_image_from_model.save(temp_path)
	dense_depth_image_file = open(temp_path, 'rb')
	depth_image_binary_from_file = dense_depth_image_file.read()
	
	dense_depth_image_file.close()
	os.remove(dense_depth_image_file.name)

	return depth_image_binary_from_file
	