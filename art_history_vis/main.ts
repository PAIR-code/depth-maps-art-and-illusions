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

import {DepthPlotViewer} from './depthPlotViewer';
import {PointCloudViewer} from './pointCloudViewer';
import {
  Painting, getImageContext, getStyleColor,
  debounced, ART_STYLE_COLOR_MAP
} from './util';


// Constants
const PAGE_LOAD_PAINTING_ID = 'rQE3Vym-EKB_9Q';
const STORAGE_PATH = 'https://storage.googleapis.com/art_history_depth_data/GAC_images';
const INPUT_FILENAME = 'input.png';
const OUTPUT_FILENAME = 'output.png';
const HISTORY_ELEMENT_CLASSNAME = 'history-element';
const MAX_HISTORY_LENGTH = 11;
const IMAGE_LOADING_BATCH_SIZE = 60;

let depthPlotViewer: DepthPlotViewer;
let pointCloudViewer: PointCloudViewer;
let idToPainting: {[id: string]: Painting};

// HTML Elements
const depthMapElement = document.getElementById('depth-map');
const originalPaintingElement = document.getElementById('original-painting');
const depthPlotCanvasElement = document.getElementById('depth-plot-canvas');
const depthPlotContainerElement = document.getElementById('depth-plot-container');
const pointCloudContainerElement = document.getElementById('point-cloud-container');
const pointCloudCanvasElement = document.getElementById('point-cloud-canvas');
const outerContainerElement = document.getElementById('outer-container');
const imageViewContainerElement = document.getElementById('image-view-container');
const historyContainer = document.getElementById('history-container');
const imageViewWrapperElement = document.getElementById('image-view-wrapper');
const tabGraphElement = document.getElementById('tab-graph');
const tabImagesElement = document.getElementById('tab-images');


// UI Initialization Functions

/**
 * Initializes the web visualization.
 * @param paintings an Array of the Painting objects (from the loaded data).
 */
export function main(paintings: Array<Painting>, idToPaintingDict:
  {[id: string]: Painting}) {
  // Initializes three.js scenes for the depth plot and point cloud.
  depthPlotViewer = new DepthPlotViewer(paintings,
    depthPlotCanvasElement as HTMLCanvasElement,
    outerContainerElement.clientWidth, outerContainerElement.clientHeight, false);

  pointCloudViewer = new PointCloudViewer(
    pointCloudCanvasElement as HTMLCanvasElement,
    pointCloudContainerElement.clientWidth, pointCloudContainerElement.clientHeight, true);

  idToPainting = idToPaintingDict;

  updateUIVisibility();
  initializeImageView(paintings);
  initializeLegend();
  initializeThumbnailImages();
  addEventHandlers();

  updateInfoImages(idToPainting[PAGE_LOAD_PAINTING_ID]);
}

/**
 * Updates the HTMLElements' visibility when the paintings are done loading.
 */
function updateUIVisibility() {
  // Show application elements
  document.getElementById('tab-container').style.visibility = 'visible';
  document.getElementById('info-container').style.visibility = 'visible';
  document.getElementById('history-text').style.visibility = 'visible';
  outerContainerElement.style.visibility = 'visible';

  // Hide the spinner
  document.getElementById('load-spinner').style.display = 'none';
}

/**
 * Creates the image grid view in 'Image Mode.'
 * @param paintings an Array of the Painting objects (from the loaded data).
 */
function initializeImageView(paintings: Array<Painting>) {
  addPaintingsToImageView(paintings);

  // Image Container scroll event listener
  imageViewContainerElement.addEventListener('scroll', (event: Event) => {
    const element = event.target as HTMLElement;
    if (element.scrollHeight - element.scrollTop === element.clientHeight) {
      addPaintingsToImageView(paintings);
    }
  });
}

/**
 * Adds paintings to the image view.
 * @param paintings an Array of the Painting objects (from the loaded data).
 */
function addPaintingsToImageView(paintings: Array<Painting>) {
  let index = imageViewWrapperElement.children.length;
  let paintingsAdded = 0;
  while (paintingsAdded < IMAGE_LOADING_BATCH_SIZE) {
    const styles = paintings[index].style.split(', ');
    const firstStyleColor = getStyleColor(styles[0]);
    if (firstStyleColor != null && paintings[index].year > 0) {
      addPaintingToImageView(paintings[index]);
      paintingsAdded++;
    }
    index++;
  }
}

/**
 * Adds a painting to the image view.
 * @param painting the Painting object to add.
 */
function addPaintingToImageView(painting: Painting) {
  // Create a container HTMLElement for the image.
  const gridImageContainer = document.createElement('div');
  gridImageContainer.className = 'grid-image-container';
  imageViewWrapperElement.appendChild(gridImageContainer);

  // Create the image HTMLElement.
  const imageElement = document.createElement('img');
  imageElement.src =
    `${STORAGE_PATH}/${painting.imageid}/${INPUT_FILENAME}`;
  imageElement.onclick = imageClicked;
  gridImageContainer.appendChild(imageElement);

  // Create the text HTMLElement.
  const textDiv = document.createElement('div');
  textDiv.className = 'thumbnail-title';
  textDiv.innerHTML =
    `${painting.title} (${painting.year.toString()}) DR: ${painting.range.toString()}`;
  gridImageContainer.appendChild(textDiv);
}

/**
 * This method updates the information panel images when the user clicks on
 * a painting image.
 * @param event the Event object from the user click.
 */
function imageClicked(event: Event) {
  const clickImage = event.target;
  const imageid = clickImage.src.split('/')[5];
  updateInfoImages(idToPainting[imageid]);
}

/**
 * Initializes the legend for the depth plot.
 */
function initializeLegend() {
  const legendDiv = document.getElementById('legend-container');
  for (let style of Object.keys(ART_STYLE_COLOR_MAP)) {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'legend-item';
    legendDiv.appendChild(itemDiv);

    const colorDiv = document.createElement('div');
    colorDiv.className = 'legend-color';
    colorDiv.style.background = '#' + getStyleColor(style).toString(16);
    itemDiv.appendChild(colorDiv);

    const textDiv = document.createElement('div');
    textDiv.className = 'legend-text';
    textDiv.innerHTML = style;
    itemDiv.appendChild(textDiv);
  }
}

/**
 * Initializes the painting and depth map thumbnail images in the info panel.
 */
function initializeThumbnailImages() {
  // Info panel image loading
  originalPaintingElement.crossOrigin = "Anonymous";
  depthMapElement.crossOrigin = "Anonymous";

  // The point cloud should load after both DOM images have finished loading.
  // If the other image's load is complete, the image will call loadPointCloud
  // once it is loaded.
  originalPaintingElement.onload = () => {
    if (depthMapElement.complete) {
      loadPointCloud();
    }
  }
  depthMapElement.onload = () => {
    if (originalPaintingElement.complete) {
      loadPointCloud();
    }
  }
}

/**
 * Adds event handlers to the UI elements.
 */
function addEventHandlers() {
  // Reset button event handler
  document.getElementById('reset-button').addEventListener('click',
    () => {
      // Reset the point cloud orbit control to original view.
      pointCloudViewer.controls.reset();
    });


  // Window resize event listener
  window.addEventListener('resize', debounced(200, () => {
    // Resize the depth plot's canvas to fit in the browser window.
    const depthPlotContainer = outerContainerElement;
    depthPlotViewer.resize(depthPlotContainer.clientWidth,
      depthPlotContainer.clientHeight);

    // Resize the point cloud's canvas to fit in its DOM container.
    const container = pointCloudContainerElement;
    pointCloudViewer.resize(container.clientWidth, container.clientHeight);
  }), false);


  // Depth plot click event listener
  depthPlotCanvasElement.addEventListener('click', () => {
    // Update any selection changes
    depthPlotViewer.updateSelected();

    // Get the Painting of the selected block
    const painting = depthPlotViewer.getSelectedPainting();
    if (painting != null) {
      updateInfoImages(painting);
    }
  }, false);

  // Graph tab click event listener
  tabGraphElement.addEventListener('click', (event: Event) => {
    // Switch to 'graph mode,' showing and updating the resize of the depth
    // plot and hiding the image view
    depthPlotContainerElement.style.display = 'block';
    depthPlotViewer.resize(outerContainerElement.clientWidth,
      outerContainerElement.clientHeight);
    imageViewContainerElement.style.display = 'none';

    tabGraphElement.classList.add('is-active');
    tabImagesElement.classList.remove('is-active');
  });

  // Images tab click event listener
  tabImagesElement.addEventListener('click', (event: Event) => {
    // Switch to 'image mode,' hiding the depth plot and showing the image view
    depthPlotContainerElement.style.display = 'none';
    imageViewContainerElement.style.display = 'block';

    tabImagesElement.classList.add('is-active');
    tabGraphElement.classList.remove('is-active');
  });
}


// UI Updating Functions

/**
 * Updates the info panel with the given painting's data.
 * @param painting the Painting object to be displayed.
 */
function updateInfoImages(painting: Painting) {
  // Update history
  addPaintingToHistory(painting);

  // Update displayed images
  document.getElementById('original-painting').src =
    `${STORAGE_PATH}/${painting.imageid}/${INPUT_FILENAME}`;
  document.getElementById('depth-map').src =
    `${STORAGE_PATH}/${painting.imageid}/${OUTPUT_FILENAME}`;

  // Reset the point cloud controls to the original view.
  pointCloudViewer.controls.reset();

  // Update painting details text
  document.getElementById('painting-title').innerHTML =
    `<a target="_blank" href="${painting.asset_link}">${painting.title}"</a>`;
  document.getElementById('year-text').innerHTML =
    'Year: '.bold() + painting.year.toString();
  document.getElementById('style-text').innerHTML =
    'Movement: '.bold() + painting.style;
  document.getElementById('artist-text').innerHTML =
    'Artist: '.bold() + painting.artist_name;
  document.getElementById('range-text').innerHTML =
    'Depth Range: '.bold() + painting.range.toString();
  document.getElementById('partner-text').innerHTML =
    'Source: '.bold() + painting.partner_name;
}

/**
 * Updates the history sidebar to insert a painting at the top.
 * @param painting the painting to add.
 */
function addPaintingToHistory(painting: Painting) {
  // Remove the painting from history if it is already added.
  const historyPainting = findPaintingInHistory(painting);
  if (historyPainting != null) {
    historyContainer.removeChild(historyPainting);
  }

  // If the history container has the maximum number of paintings, remove the
  // last painting.
  if (historyContainer.children.length > MAX_HISTORY_LENGTH) {
    const length = historyContainer.children.length;
    historyContainer.removeChild(historyContainer.children[length - 1]);
  }

  // Create the new image HTMLElement for the Painting, and insert it at the
  // top of the history container.
  const image = document.createElement('img');
  image.src = `${STORAGE_PATH}/${painting.imageid}/${INPUT_FILENAME}`;
  image.className = HISTORY_ELEMENT_CLASSNAME;
  image.addEventListener('click', imageClicked);
  historyContainer.insertBefore(image, historyContainer.children[0]);
}

/**
 * Returns the painting's Element if it is already in the history.
 * @param historyChildren the children of the history HTMLElement.
 * @param painting the painting to check.
 * @returns the history container HTML element
 */
function findPaintingInHistory(painting: Painting): Element {
  for (let i = 0; i < historyContainer.children.length; i++) {
    const imageid = historyContainer.children[i].src.split('/')[5];
    if (painting.imageid == imageid) {
      return historyContainer.children[i];
    }
  }
  return null;
}

/**
 * A helper function that loads the point cloud with the contexts containing
 * pixel information of the depth map and original painting images.
 */
function loadPointCloud() {
  const depthMapContext = getImageContext(depthMapElement);
  const originalPaintingContext = getImageContext(originalPaintingElement);
  pointCloudViewer.loadPointCloud(originalPaintingContext, depthMapContext);
}
