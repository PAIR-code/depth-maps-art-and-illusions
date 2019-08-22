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
import {Painting, getImageContext} from './util';

let depthPlotViewer: DepthPlotViewer;
let pointCloudViewer: PointCloudViewer;

/**
 * Loads art history csv data and initializes the three.js scenes.
 */
d3.csv('ellen_range_diff.csv').then((data: object) => {
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
  depthPlotViewer = new DepthPlotViewer(paintings, 'timeline-canvas',
    window.innerWidth, window.innerHeight);

  const container = document.getElementById('point-cloud-container');
  pointCloudViewer = new PointCloudViewer(
    'point-cloud-canvas', container.clientWidth, container.clientHeight);
});


// Image loading
const originalImage = document.getElementById('original-painting');
originalImage.crossOrigin = "Anonymous";
const depthMap = document.getElementById('depth-map');
depthMap.crossOrigin = "Anonymous";


function loadPointCloud() {
  const depthMapContext = getImageContext(document.getElementById('depth-map'));
  const originalImageContext = getImageContext(document.getElementById('original-painting'));
  pointCloudViewer.loadPointCloud(originalImageContext, depthMapContext);
}

originalImage.onload = () => {
  if (depthMap.complete) {
    loadPointCloud();
  }
}

depthMap.onload = () => {
  if (originalImage.complete) {
    loadPointCloud();
  }
}


// Event listeners
window.addEventListener('resize', () => {
  depthPlotViewer.resize(window.innerWidth, window.innerHeight);
  const container = document.getElementById('point-cloud-container');
  pointCloudViewer.resize(container.clientWidth, container.clientHeight);
}, false);


document.getElementById('timeline-canvas').addEventListener('click', () => {
  const paintingData = depthPlotViewer.updateSelected();
  if (paintingData != null) {
    document.getElementById('info-container').style.visibility = 'visible';

    document.getElementById('original-painting').src =
      "https://storage.googleapis.com/art_history_depth_data/GAC_images/"
      + paintingData.imageid + "/input.png";
    document.getElementById('depth-map').src =
      "https://storage.googleapis.com/art_history_depth_data/GAC_unnorm/"
      + paintingData.imageid + "/output.png";

    document.getElementById('painting-title').innerHTML = '<a target="_blank" href=' + paintingData.asset_link + '>' + paintingData.title + '</a>';
    document.getElementById('year-text').innerHTML = '<b>Year:</b> ' + paintingData.year.toString();
    document.getElementById('style-text').innerHTML = '<b>Movement:</b> ' + paintingData.style;
    document.getElementById('artist-text').innerHTML = '<b>Artist:</b> ' + paintingData.artist_name;
    document.getElementById('range-text').innerHTML = '<b>Depth Range:</b> ' + paintingData.range.toString();
    document.getElementById('partner-text').innerHTML = '<b>Source:</b> ' + paintingData.partner_name;
  } else {
    document.getElementById('info-container').style.visibility = 'hidden';
  }
}, false);
