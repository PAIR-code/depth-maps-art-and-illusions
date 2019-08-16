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
import * as timelineCanvas from './timelineCanvas';
import * as timeline from './timeline';
import * as detailViewCanvas from './detailViewScene';


let timeCanvas: timelineCanvas.TimelineCanvas;
let detailCanvas: detailViewCanvas.DetailViewCanvas;

/**
 * Loads art history csv data and initializes the timeline scene.
 */
console.log('start loading');


d3.csv('ellen_depth_test_full.csv').then(function (data: object) {
  const paintings = Array<timeline.Painting>();


  for (let i = 0; i < data.length; i++) {
    const link = data[i]['asset_link']
    const imageid = link.split("/").pop();

    const {asset_link, image, thumbnail, partner_name,
      title, artist_name, year, location, art_movements, depth} = data[i];

    // paintings.push(painting);
    paintings.push({
      year: year,
      depth: depth,
      style: art_movements,
      imageid: imageid,
      partner_name: partner_name,
      title: title,
      artist_name: artist_name,
      location: location,
      art_movements: art_movements
    });
  }
  console.log(paintings);



  detailCanvas = new detailViewCanvas.DetailViewCanvas('point-cloud-canvas');


  const coloredImg = document.getElementById('my-colored-image');
  coloredImg.crossOrigin = "Anonymous";
  const dv = this;
  coloredImg.onload = function () {
    detailViewCanvas.DetailViewCanvas.detailView.initializePointCloud();
  }


  const img = document.getElementById('my-image');
  img.crossOrigin = "Anonymous";


  timeCanvas = new timelineCanvas.TimelineCanvas(paintings, 'timeline-canvas',
    "timeline");



  window.addEventListener('resize', onWindowResize, false);

});

function onWindowResize() {
  const timelineCamera = timeCanvas.getCamera();
  timelineCamera.aspect = window.innerWidth / window.innerHeight;
  timelineCamera.updateProjectionMatrix();
  timeCanvas.getRenderer().setSize(window.innerWidth, window.innerHeight);

  const container = document.getElementById('point-cloud-container');
  const detailViewCamera = detailCanvas.getCamera();
  detailViewCamera.aspect = container.clientWidth / container.clientHeight;
  detailViewCamera.updateProjectionMatrix();
  detailCanvas.getRenderer().setSize(container.clientWidth, container.clientHeight);
}



function onClick(event: any) {
  const paintingData = timeCanvas.updateSelected();

  if (paintingData != null) {
    setDetailViewSrc(paintingData.imageid);

    document.getElementById('painting-title').innerHTML = paintingData.title;
    document.getElementById('year-text').innerHTML = paintingData.year.toString();
    document.getElementById('style-text').innerHTML = paintingData.style;
    document.getElementById('depth-text').innerHTML = paintingData.depth.toString();

  }
}

function setDetailViewSrc(imageid: string) {
  const originalPainting = document.getElementById('original-painting');
  originalPainting.src = "https://storage.googleapis.com/art_history_depth_data/GAC_images/"
    + imageid + "/input.png";


  const depthMap = document.getElementById('depth-map');
  depthMap.src = "https://storage.googleapis.com/art_history_depth_data/GAC_images/"
    + imageid + "/output.png";


  document.getElementById('my-colored-image').src = originalPainting.src;
  document.getElementById('my-image').src = depthMap.src;
}

window.addEventListener('click', onClick, false);

document.getElementById('id-input').addEventListener('keypress', (e: KeyboardEvent) => {
  if (e.keyCode === 13) {
    console.log(document.getElementById('id-input').value);
    const imageid = document.getElementById('id-input').value;
    setDetailViewSrc(imageid);
  }
};




