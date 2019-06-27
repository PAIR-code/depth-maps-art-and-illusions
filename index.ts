/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */

import './index.css';
import * as d3 from 'd3';
import * as objViewer from './objviewer';


/**
 * The OBJViewer for displaying impossible object models.
 */
let viewer: objViewer.OBJViewer;


/**
 * Requests the DenseDepth image from the displayed 2D image.
 */
function requestDepthImage2D() {
  const focusImageElement = document.getElementById('focus-image');

  const canvas = document.createElement('canvas');
  canvas.width = focusImageElement.width;
  canvas.height = focusImageElement.height;

  const context = canvas.getContext('2d');
  context.drawImage(
      focusImageElement, 0, 0, focusImageElement.width,
      focusImageElement.height);

  const imageurl = encodeURIComponent(canvas.toDataURL('image/png'));

  sendRequest(imageurl);
}


/**
 * Requests the DenseDepth image from the current 3D view.
 */
function requestDepthImage3D() {
  const imageurl = viewer.getCanvasDataURL();
  sendRequest(imageurl);
}


/**
 * Sends the request for the DenseDepth image with the image's
 * dataURL as a parameter.
 * @param imageurl The string containing the image dataURL.
 */
function sendRequest(imageurl: string) {
  const url = '/processImage';
  const headers = new Headers({mode: 'cors'});

  displayLoading();

  d3.json(url, {method: 'POST', headers, body: imageurl})
      .then((res: any) => {
        displayResult(res['message']);
      })
      .catch((err) => {
        console.error(err);
        alert('Server error.');
      });
}


/**
 * Changes the UI to the loading state.
 */
function displayLoading() {
  document.getElementById('depth-map').style.display = 'none';
  document.getElementById('spinner').style.display = 'inline-block';
  document.getElementById('depth-value').innerHTML = '';
}


/**
 * Displays the DenseDepth image.
 * @param: imageurl The string containing the image dataURL.
 */
function displayResult(imageurl: string) {
  const overlay = document.getElementById('depth-map-overlay');
  const image = document.getElementById('focus-image');
  const depthMapImageElement = document.getElementById('depth-map');

  depthMapImageElement.src = overlay.src = imageurl;
  overlay.height = image.height;

  document.getElementById('depth-map').style.display = 'inline-block';
  document.getElementById('spinner').style.display = 'none';
}


/**
 * Adds an image to the image carousel containing the given image source.
 * @param imageSource a string containing the image source.
 */
function addCarouselItem(imageSource: string) {
  const listItem = document.createElement('li');
  listItem.className = 'mdl-list__item';
  const span = document.createElement('span');
  span.className = 'mdl-list__item-primary-content';

  const carouselImageContainer = document.createElement('div');
  carouselImageContainer.className = 'carousel-image-container';
  carouselImageContainer.onclick = carouselImageClicked;

  const carouselImage = document.createElement('img');
  carouselImage.src = imageSource;
  carouselImage.className = 'carousel-image';

  carouselImageContainer.appendChild(carouselImage);

  span.appendChild(carouselImageContainer);
  listItem.appendChild(span);

  const carouselList = document.getElementById('carousel-list');
  carouselList.insertBefore(listItem, carouselList.childNodes[0]);
}


/**
 * Displays the images on the file input on the image carousel.
 * @param event the Event that was triggered by the user.
 */
function uploadInputChanged(event: Event) {
  const files = document.querySelector('input[type=file]').files;

  const displayImageFile = (file: File) => {
    if (/\.(jpe?g|png|gif)$/i.test(file.name)) {
      const reader = new FileReader();

      reader.addEventListener('load', function() {
        addCarouselItem(reader.result);
      }, false);

      reader.readAsDataURL(file);
    }
  };

  if (files) {
    [].forEach.call(files, displayImageFile);
  }

  // Scroll the carousel to the top, where uploaded images appear.
  document.getElementById('carousel-container').scrollTop = 0;
};


/**
 * This function is called when a carousel image is clicked. It sets the
 * clicked image as the image in the viewer and updates the depth map viewer.
 * @param event the Event that was triggered by the user.
 */
function carouselImageClicked(event: Event) {
  const clickImage = event.target;
  const focusImage = document.getElementById('focus-image');
  const depthImage = document.getElementById('depth-map');
  focusImage.src = clickImage.src;
  depthImage.src = '';
  requestDepthImage2D();
}


/**
 * Initializes the image carousel in the left sidebar.
 */
function initializeImageCarousel() {
  const carouselImageContainers =
      document.getElementsByClassName('carousel-image');
  Array.from(carouselImageContainers)
      .forEach(container => container.onclick = carouselImageClicked)
}


/**
 * Initializes the tabs that switch between the 2D and 3D views.
 */
function initializeTabs() {
  // Hides the 3D viewer, shows the 2D image and image carousel, and enables
  // the overlay feature when the 2D tab is clicked.
  document.getElementById('2D-tab').onclick = (event: Event) => {
    document.getElementById('canvas-container').style.display = 'none';
    document.getElementById('focus-image').style.display = 'inline-block';
    document.getElementById('depth-map-overlay').style.display = 'inline-block';
    document.getElementById('overlay-slider').disabled = false;

    const carouselImages =
        document.getElementsByClassName('carousel-image-container');
    Array.from(carouselImages)
        .forEach((carouselImage) => carouselImage.style.display = 'block');

    requestDepthImage2D();
  };

  // Hides the 2D image and image carousel, shows the 3D viewer, and disables
  // the overlay feature when the 3D tab is clicked.
  document.getElementById('3D-tab').onclick = (event: Event) => {
    document.getElementById('canvas-container').style.display = 'inline-block';
    document.getElementById('focus-image').style.display = 'none';
    document.getElementById('depth-map-overlay').style.display = 'none';

    const overlaySlider = document.getElementById('overlay-slider');
    overlaySlider.value = '0';
    overlaySlider.disabled = true;

    const carouselImages =
        document.getElementsByClassName('carousel-image-container');
    Array.from(carouselImages)
        .forEach((carouselImage) => carouselImage.style.display = 'none');

    requestDepthImage3D();
  };
}


/**
 * Initializes the illusion visualizer.
 */
function initializeVisualizer() {
  initializeImageCarousel();
  initializeTabs();

  viewer = new objViewer.OBJViewer(() => {
    requestDepthImage3D();
  });

  // Shows the value of the pixel under the cursor when the user hovers over
  // the depth map image or the depth map overlay.
  const depthMapHovered = (event: Event) => {
    const img = event.target;
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    canvas.getContext('2d').drawImage(img, 0, 0, img.width, img.height);
    const pixelData = canvas.getContext('2d')
                          .getImageData(event.offsetX, event.offsetY, 1, 1)
                          .data;

    const pixValue = (pixelData[0] + pixelData[1] + pixelData[2]) / 3 / 255;

    document.getElementById('depth-value').innerHTML = pixValue.toString();
  };

  document.getElementById('depth-map').onmousemove = depthMapHovered;
  document.getElementById('depth-map-overlay').onmousemove = depthMapHovered;

  // Updates the opacity of the overlay when the slider value changes.
  document.getElementById('overlay-slider')
      .addEventListener('change', (event: Event) => {
        const opacityValue = event.target.value / 100;
        document.getElementById('depth-map-overlay').style.opacity =
            (opacityValue.toString());
      });
  // Requests depth map from model and updates viewer
  requestDepthImage2D();

  // Initialize upload button
  document.getElementById('upload-input').onchange = uploadInputChanged;
}


initializeVisualizer();
