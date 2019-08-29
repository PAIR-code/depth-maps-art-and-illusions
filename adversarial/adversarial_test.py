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

import adversarial_depth
import mock
import numpy as np
import tensorflow as tf

from tensorflow.python.platform import googletest


class AdversarialTest(googletest.TestCase):
  """
  To run:
  "python3 adversarial_test.py" from the
  PAIR-code/depth-maps-art-and-illusions/adversarial directory.
  """

  def testGetInputs(self):
    """Tests that the get_inputs function returns the input and target output.
    """
    loaded_image_array = np.array(
      [[
        [[1,1,1],[2,2,2]],
        [[3,3,3],[4,4,4]]
      ]])
    predict_array = np.array(
      [[
        [[1],[0]],
        [[1],[0]]
      ]])

    # Make mock objects
    depth_model_wrapper = mock.Mock()
    depth_model_wrapper.load_image =  mock.MagicMock(
      return_value=loaded_image_array)
    depth_model_wrapper.predict = mock.MagicMock(
      return_value=predict_array)
    model = mock.Mock()

    input_image, target_output = adversarial_depth.get_inputs(
      depth_model_wrapper, model, 'path', 'path')

    self.assertTrue(np.array_equal(loaded_image_array, input_image))
    self.assertTrue(np.array_equal(predict_array, target_output))


  def testToMultichannel(self):
    """Tests that the to_multichannel function returns the expected
        multichannel array.
    """
    single_channel_image = np.array(
      [
        [[1],[2]],
        [[3],[4]]
      ])
    multichannel_image = np.array(
      [
        [[1,1,1],[2,2,2]],
        [[3,3,3],[4,4,4]]
      ])

    # Check that a single channel image input is converted to multichannel.
    output = adversarial_depth.to_multichannel(single_channel_image)
    self.assertTrue(np.array_equal(multichannel_image, output))

    # Check that a multichannel image input gets returned with the
    # same values.
    output = adversarial_depth.to_multichannel(multichannel_image)
    self.assertTrue(np.array_equal(multichannel_image, output))


  def testRetrieveLossAndGradients(self):
    """Tests that the retrieve_loss_and_gradients function returns the expected
        loss and gradients values, given a simple loss_gradient_function.
    """
    input_image = np.array(
      [[
        [[1,1,1],[2,2,2]],
        [[3,3,3],[4,4,4]]
      ]])
    target_image = np.array(
      [[
        [[0,0,0],[2,2,2]],
        [[0,0,0],[6,6,6]]
      ]])

    loss_gradient_function = lambda x: [np.mean(x - target_image),
      (x - target_image)[0]]

    loss, gradients = adversarial_depth.retrieve_loss_and_gradients(
      input_image, loss_gradient_function)

    # The expected loss is np.mean(input_image - target_image),
    # which is the mean of (1,0,3,-2), or 0.5.
    expected_loss = 0.5
    expected_gradients = np.array(
      [[
        [[1, 1, 1],[0, 0, 0]],
        [[3, 3, 3],[-2, -2, -2]]
      ]])

    self.assertEqual(expected_loss, loss)
    self.assertTrue(np.array_equal(expected_gradients, gradients))


  def testGradientAscent(self):
    """Tests that the retrieve_loss_and_gradients function returns the expected
        array output, given a simple loss_gradient_function.
    """
    input_image = np.array(
      [[
        [[1,1,1],[2,2,2]],
        [[3,3,3],[4,4,4]]
      ]],
      dtype='float64')
    target_image = np.array(
      [[
        [[0,0,0],[2,2,2]],
        [[0,0,0],[6,6,6]]
      ]],
      dtype='float64')
    loss_gradient_function = lambda x: [np.mean(x - target_image),
      (x - target_image)[0]]
    iterations = 2
    step_size = .5

    output = adversarial_depth.gradient_ascent(input_image,
      loss_gradient_function, iterations, step_size)

    expected_output = np.array(
      [[
        [[0.25, 0.25, 0.25],
        [2.0, 2.0, 2.0]],
        [[0.75, 0.75, 0.75],
        [5.5, 5.5, 5.5]]
      ]])

    self.assertTrue(np.array_equal(expected_output, output))


if __name__ == '__main__':
  googletest.main()
