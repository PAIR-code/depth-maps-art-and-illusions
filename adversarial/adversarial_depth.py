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

"""Script for generating adversarial examples for depth models."""

import numpy as np
import os

from keras import backend as K
from matplotlib import pyplot as plt
from PIL import Image


# Image Paths
SINK_IMAGE = "images/sink.png"
BATHTUB_IMAGE = "images/bathtub.png"


def get_inputs(depth_model_wrapper, model, input_path,
    target_path):
  """Gets the input and target output for the sink to bathtub experiment, which
      alters an input image of a sink towards producing the depth map output of
      a bathtub.

	Args:
		depth_model_wrapper: A DepthModelWrapper instance that initializes the model
        and predicts the depth map.

	Returns:
		The input image and target depth output.
	"""
  if input_path is None:
    input_path = SINK_IMAGE
  if target_path is None:
    target_path = BATHTUB_IMAGE

  input_image = depth_model_wrapper.load_image(input_path)
  target_depth_output = depth_model_wrapper.predict(
    model, depth_model_wrapper.load_image(target_path))
  return input_image, target_depth_output


def to_multichannel(image):
  """Reshapes an image to have 3 channels.

	Args:
		image: A numpy array image to be converted to multichannel.
	"""
  if image.shape[2] == 3:
    return image
  image = image[:,:,0]
  return np.stack((image, image, image), axis=2)


def display_image(image, is_input=False):
  """Displays an numpy array image with matplotlib.

	Args:
		image: A numpy array image to be displayed with matplotlib.
    is_input: A boolean indicating whether the image is an input image.
	"""
  plt.figure(figsize=(10,5))

  if is_input:
    plt.imshow(to_multichannel(image[0]))
  else:
    rescaled = image[0][:,:,0]
    plt.imshow(rescaled)

  plt.show()


def display(depth_model_wrapper, model, original_image, altered_image):
  """Displays the original input image and depth output and the altered input
        image and depth output

	Args:
		depth_model_wrapper: A DepthModelWrapper instance that initializes the model
        and predicts the depth map.
    model: The depth map model.
    original_image: A numpy array containing the unaltered input image.
    altered_image: A numpy array containing the altered input image.
	"""
  original_output = depth_model_wrapper.predict(model, original_image)
  altered_output = depth_model_wrapper.predict(model, altered_image)

  display_image(original_image, is_input=True)
  display_image(original_output)
  display_image(altered_image, is_input=True)
  display_image(altered_output)


def retrieve_loss_and_gradients(input_image, loss_gradient_function):
  """Retrieves the adversarial loss and gradients from the model.

	Args:
		input_image: A numpy array containing the input image used to generate the
        adversarial example.
	"""
  results = loss_gradient_function([input_image])
  loss = results[0]
  gradients = results[1]
  return loss, gradients


def gradient_ascent(input_image, loss_gradient_function, iterations, step_size):
  """Runs gradient ascent on the input image, altering it into an adversarial
      example.

	Args:
		input_image: A numpy array containing the input image used to generate the
        adversarial example.
    iterations: The number of iterations to run gradient ascent.
    step_size: The step size value.

	"""
  for i in range(iterations):
      loss, gradients = retrieve_loss_and_gradients(input_image,
          loss_gradient_function)
      print('Loss at %d: %.3f' % (i, loss))
      input_image -= step_size * gradients
  return input_image


def generate_adversarial_example(depth_model_wrapper, iterations = 100,
  step_size = 0.001, input_path=None, target_path=None):
  """Displays the original input image and depth output and the altered input
    image and depth output

	Args:
		depth_model_wrapper: A DepthModelWrapper instance that initializes the model
        and predicts the depth map.

	"""
  # Initialize model.
  K.set_learning_phase(0)
  model = depth_model_wrapper.initialize_model()

  input_image, goal_output = get_inputs(depth_model_wrapper, model,
      input_path, target_path)

  # Set up loss function.
  final_layer_output = depth_model_wrapper.get_final_layer(model)
  scale_factor = K.prod(K.cast(K.shape(final_layer_output), 'float32'))

  loss = K.sum(K.square(final_layer_output - goal_output)) / scale_factor
  gradients = K.gradients(loss, model.input)[0]
  gradients /= K.maximum(K.mean(K.abs(gradients)), K.epsilon())  # normalize

  get_loss_and_gradients = K.function([model.input], [loss, gradients])


  # Run gradient ascent on image input.
  original_image = input_image.copy()
  altered_image = gradient_ascent(input_image, get_loss_and_gradients,
    iterations, step_size)

  # Display results
  display(depth_model_wrapper, model, original_image, altered_image)

