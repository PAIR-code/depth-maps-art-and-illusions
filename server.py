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

"""Backend of the depth illusion experiment demo."""

import os

from base64 import encodestring
from densedepth_model.densedepth import initialize_model 
from flask import Flask, request
from flask_cors import CORS, cross_origin
from flask_jsonpify import jsonify
from urlparse import unquote
from util import get_web_image, get_dense_depth_image




app = Flask(__name__, static_url_path='')
CORS(app)

model = initialize_model()

@app.route("/processImage")
def processImage():
	"""Processes the image's dataURL, decoding it into an image, 
	sending the image through DenseDepth to generate a depth map,
	and sending the dataURL of the depth map as the response to
	the client.

	Args:
		builder: transform_builder.Builder.
		
	Returns:
		A Response with the JSON representation of the depth map
		image's dataURL. 
	"""
	encoded_dataURL = request.args.get('screenshot', None)
	dataURL = unquote(encoded_dataURL)

	web_image = get_web_image(dataURL)
	dense_depth_image = get_dense_depth_image(model, web_image)

	encoded_dense_depth_image = encodestring(dense_depth_image)
	output = "data:image/png;base64," + encoded_dense_depth_image

	return jsonify({'message': output})

if __name__ == '__main__':
	app.run(port=3366, host='0.0.0.0', debug=True)

