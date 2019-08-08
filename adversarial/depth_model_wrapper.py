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

"""Abstract Wrapper class for the depth model for generating adversarial examples.

  Example Usage:

    class MyDepthModelWrapper(object):
      def load_image(self, filepath):
        # my code

      def initialize_model(self):
        # my code

      def predict(self, model, image, batch_size=2):
        # my code

      def get_final_layer(self, model):
        # my code

    DepthModelWrapper.register(MyDepthModelWrapper)

    myDepthModelWrapper = MyDepthModelWrapper()
    adversarial_depth.generate_adversarial_example(myDepthModelWrapper, iterations=1)

"""


import abc

class DepthModelWrapper(metaclass=abc.ABCMeta):

  @abc.abstractmethod
  def load_image(self, filepath):
    """Loads an image input from a file path.

    Args:
      filepath: The filepath of the image input.

    Returns:
      A numpy array containing the loaded image.
    """
    return


  @abc.abstractmethod
  def initialize_model(self):
    """Initializes and returns a depth model.

    Returns:
      A depth model.
    """
    return


  @abc.abstractmethod
  def predict(self, model, image, batch_size=2):
    """Calls predict on the model to get depth predictions.

    Args:
      model: The depth model.
      image: The image input to the model.

    Returns:
      A numpy array of the depth prediction.
    """
    return


  @abc.abstractmethod
  def get_final_layer(self):
    """Looks up and returns the output of the last layer in the model.

    Args:
      model: The depth model.

    Returns:
      The output of the last layer.
    """
    return
