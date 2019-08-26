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

import * as d3 from 'd3';
import {DepthPlotViewer} from './depthPlotViewer';
import {PointCloudViewer} from './pointCloudViewer';
import {Painting, getImageContext, debounced} from './util';

let depthPlotViewer: DepthPlotViewer;
let pointCloudViewer: PointCloudViewer;


// HTML Elements
const depthMapElement = document.getElementById('depth-map');
const originalPaintingElement = document.getElementById('original-painting');
const depthPlotCanvasElement = document.getElementById('depth-plot-canvas');
const pointCloudContainerElement = document.getElementById('point-cloud-container');
const pointCloudCanvasElement = document.getElementById('point-cloud-canvas');
const infoContainerElement = document.getElementById('info-container');


/**
 * Loads art history csv data and initializes the three.js scenes.
 */
d3.csv('paintings.csv').then((data: object) => {
  // Loads csv data into Painting interface objects.
  const paintings = Array<Painting>();
  for (let i = 0; i < data.length; i++) {
    const link = data[i]['asset_link']
    const imageid = link.split("/").pop();
    const {asset_link, image, thumbnail, partner_name,
      title, artist_name, year, location, art_movements, Depth,
      range, range_difference, std_difference} = data[i];
    paintings.push({
      asset_link: asset_link,
      image: image,
      thumbnail: thumbnail,
      partner_name: partner_name,
      year: year,
      depth: Depth,
      style: art_movements,
      imageid: imageid,
      title: title,
      artist_name: artist_name,
      location: location,
      art_movements: art_movements,
      range: range,
      range_difference: range_difference,
      std_difference: std_difference
    });
  }

  // Initializes three.js scenes for the depth plot and point cloud.
  depthPlotViewer = new DepthPlotViewer(paintings,
    depthPlotCanvasElement as HTMLCanvasElement,
    window.innerWidth, window.innerHeight, false);

  const container = pointCloudContainerElement;
  pointCloudViewer = new PointCloudViewer(
    pointCloudCanvasElement as HTMLCanvasElement,
    container.clientWidth, container.clientHeight, true);
});

// Resize event listener
window.addEventListener('resize', debounced(200, () => {
  // Resize the depth plot's canvas to fit in the browser window.
  depthPlotViewer.resize(window.innerWidth, window.innerHeight);

  // Resize the point cloud's canvas to fit in its DOM container.
  const container = pointCloudContainerElement;
  pointCloudViewer.resize(container.clientWidth, container.clientHeight);
}), false);


// Depth plot click event listener
depthPlotCanvasElement.addEventListener('click', () => {
  // Update any selection changes
  depthPlotViewer.updateSelected();

  // Get the Painting of the selected block
  const paintingData = depthPlotViewer.getSelectedPainting();

  if (paintingData) {
    // Show the details panel
    infoContainerElement.style.visibility = 'visible';

    // Update displayed images
    originalPaintingElement.src =
      `https://storage.googleapis.com/art_history_depth_data/GAC_images/${paintingData.imageid}/input.png`;
    depthMapElement.src =
      `https://storage.googleapis.com/art_history_depth_data/GAC_images/${paintingData.imageid}/output.png`;


    // Update painting details text
    document.getElementById('painting-title').innerHTML = `<a target="_blank" href="${paintingData.asset_link}">${paintingData.title}"</a>`;
    document.getElementById('year-text').innerHTML = 'Year: '.bold() + paintingData.year.toString();
    document.getElementById('style-text').innerHTML = 'Movement: '.bold() + paintingData.style;
    document.getElementById('artist-text').innerHTML = 'Artist: '.bold() + paintingData.artist_name;
    document.getElementById('range-text').innerHTML = 'Depth Range: '.bold() + paintingData.range.toString();
    document.getElementById('partner-text').innerHTML = 'Source: '.bold() + paintingData.partner_name;
  } else {
    // Hide the details panel if no painting was selected
    infoContainerElement.style.visibility = 'hidden';
  }
}, false);


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


/**
 * A helper function that loads the point cloud with the contexts containing
 * pixel information of the depth map and original painting images.
 */
function loadPointCloud() {
  const depthMapContext = getImageContext(depthMapElement);
  const originalPaintingContext = getImageContext(originalPaintingElement);
  pointCloudViewer.loadPointCloud(originalPaintingContext, depthMapContext);
}
