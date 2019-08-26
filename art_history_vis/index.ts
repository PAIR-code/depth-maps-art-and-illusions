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
import {Painting, getImageContext, getStyleColor} from './util';

let depthPlotViewer: DepthPlotViewer;
let pointCloudViewer: PointCloudViewer;
const idToPainting = {};



/**
 * Loads art history csv data and initializes the three.js scenes.
 */
d3.csv('ellen_range_diff.csv').then((data: object) => {
  // Loads csv data into Painting interface objects.
  const paintings = Array<Painting>();
  for (let i = 0; i < data.length; i++) {
    const link = data[i]['asset_link']
    const imageid = link.split("/").pop();
    const {asset_link, image, thumbnail, partner_name,
      title, artist_name, year, location, art_movements, Depth,
      range, range_difference, std_difference} = data[i];
    const painting = {
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
    }
    paintings.push(painting);
    idToPainting[imageid] = painting;
  }

  // Initializes three.js scenes for the depth plot and point cloud.
  const depthPlotContainer = document.getElementById('outer-container');
  depthPlotViewer = new DepthPlotViewer(paintings,
    document.getElementById('depth-plot-canvas') as HTMLCanvasElement,
    depthPlotContainer.clientWidth, depthPlotContainer.clientHeight, false);

  const pointCloudContainer = document.getElementById('point-cloud-container');
  pointCloudViewer = new PointCloudViewer(
    document.getElementById('point-cloud-canvas') as HTMLCanvasElement,
    pointCloudContainer.clientWidth, pointCloudContainer.clientHeight, true);

  makeGridView(paintings);
  document.getElementById('switch-button').style.visibility = 'visible';
  document.getElementById('info-container').style.visibility = 'visible';
  document.getElementById('outer-container').style.visibility = 'visible';
  document.getElementById('history-text').style.visibility = 'visible';
  document.getElementById('loading-bar').style.display = 'none';
  const id = 'rQE3Vym-EKB_9Q';
  updateInfoImages(idToPainting[id]);
});

// Resize event listener
window.addEventListener('resize', () => {
  // Resize the depth plot's canvas to fit in the browser window.
  const depthPlotContainer = document.getElementById('outer-container');
  // if (depthPlotViewer.style.visibility == 'visible') {
  depthPlotViewer.resize(depthPlotContainer.clientWidth,
    depthPlotContainer.clientHeight);
  // }

  // Resize the point cloud's canvas to fit in its DOM container.
  const container = document.getElementById('point-cloud-container');
  pointCloudViewer.resize(container.clientWidth, container.clientHeight);
}, false);


// Depth plot click event listener
document.getElementById('depth-plot-canvas').addEventListener('click', () => {
  // Update any selection changes
  depthPlotViewer.updateSelected();

  // Get the Painting of the selected block
  const paintingData = depthPlotViewer.getSelectedPainting();
  if (paintingData != null) {
    updateInfoImages(paintingData);
  }
}, false);


// Switch view button click event listener
document.getElementById('switch-button').addEventListener('click', (event: Event) => {
  const depthPlotCanvas = document.getElementById('depth-plot-container');
  const imageViewContainer = document.getElementById('image-view-container');
  if (depthPlotCanvas.style.display == 'none') {
    depthPlotCanvas.style.display = 'block';
    // refactor?
    const depthPlotContainer = document.getElementById('outer-container');
    depthPlotViewer.resize(depthPlotContainer.clientWidth,
      depthPlotContainer.clientHeight);


    imageViewContainer.style.display = 'none';
    event.target.innerHTML = 'GRAPH MODE';
  } else {
    depthPlotCanvas.style.display = 'none';
    imageViewContainer.style.display = 'block';
    event.target.innerHTML = 'IMAGE MODE';
  }
});


// Info panel image loading
const originalImage = document.getElementById('original-painting');
originalImage.crossOrigin = "Anonymous";
const depthMap = document.getElementById('depth-map');
depthMap.crossOrigin = "Anonymous";


// The point cloud should load after both DOM images have finished loading.
// If the other image's load is complete, the image will call loadPointCloud
// once it is loaded.
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

/**
 * Updates the info panel with the given painting's data.
 * @param paintingData the Painting object to be displayed.
 */
function updateInfoImages(paintingData: Painting) {
  // Update history
  addPaintingToHistory(paintingData);

  // Update displayed images
  document.getElementById('original-painting').src =
    `https://storage.googleapis.com/art_history_depth_data/GAC_images/${paintingData.imageid}/input.png`;
  document.getElementById('depth-map').src =
    `https://storage.googleapis.com/art_history_depth_data/GAC_images/${paintingData.imageid}/output.png`;

  document.getElementById('original-painting').style.display = 'inline-block';
  document.getElementById('depth-map').style.display = 'inline-block';

  pointCloudViewer.controls.reset();


  // Update painting details text
  document.getElementById('painting-title').innerHTML = `<a target="_blank" href="${paintingData.asset_link}">${paintingData.title}"</a>`;
  document.getElementById('year-text').innerHTML = 'Year: '.bold() + paintingData.year.toString();
  document.getElementById('style-text').innerHTML = 'Movement: '.bold() + paintingData.style;
  document.getElementById('artist-text').innerHTML = 'Artist: '.bold() + paintingData.artist_name;
  document.getElementById('range-text').innerHTML = 'Depth Range: '.bold() + paintingData.range.toString();
  document.getElementById('partner-text').innerHTML = 'Source: '.bold() + paintingData.partner_name;
}

/**
 * Adds adds painting the the history sidebar.
 * @param paintingData the painting to add.
 */
function addPaintingToHistory(paintingData: Painting) {
  const historyContainer = document.getElementById('history-container');
  const image = document.createElement('img');
  // TODO: refactor this
  image.src = "https://storage.googleapis.com/art_history_depth_data/GAC_images/"
    + paintingData.imageid + "/input.png";
  image.className = 'history-element';
  image.addEventListener('click', imageClicked);

  for (let i = 0; i < historyContainer.children.length; i++) {
    const imageid = historyContainer.children[i].src.split('/')[5];
    if (paintingData.imageid == imageid) {
      historyContainer.removeChild(historyContainer.children[i]);
      break;
    }
  }

  if (historyContainer.children.length > 11) {
    const length = historyContainer.children.length;
    historyContainer.removeChild(historyContainer.children[length - 1]);
  }
  historyContainer.insertBefore(image, historyContainer.children[0]);
}

/**
 * A helper function that loads the point cloud with the contexts containing
 * pixel information of the depth map and original painting images.
 */
function loadPointCloud() {
  const depthMapContext = getImageContext(
    document.getElementById('depth-map'));
  const originalPaintingContext = getImageContext(
    document.getElementById('original-painting'));
  pointCloudViewer.loadPointCloud(originalPaintingContext, depthMapContext);
}


function addColumns(rowDiv: HTMLElement, numImages: number,
  paintings: Array<Painting>) {
  for (let j = 0; j < numImages; j += 100) {
    // rewrite this
    if (getStyleColor(paintings[j].style.split(', ')[0]) != null
      && paintings[j].year > 0) {
      const colDiv = document.createElement('div');
      colDiv.className = 'column';
      rowDiv.appendChild(colDiv);
      // for (let i = 0; i < numColumns; i++) {
      const image = document.createElement('img');
      image.src = "https://storage.googleapis.com/art_history_depth_data/GAC_images/"
        + paintings[j].imageid + "/input.png";
      image.onclick = imageClicked;
      colDiv.appendChild(image);

      const textDiv = document.createElement('div');
      textDiv.className = 'thumbnail-title';
      textDiv.innerHTML = paintings[j].title + ' (' + paintings[j].year.toString() +
        ') DR: ' + paintings[j].range.toString();
      colDiv.appendChild(textDiv);
    }
    // }
  }
}

function imageClicked(event: Event) {
  const clickImage = event.target;
  const imageid = clickImage.src.split('/')[5];
  updateInfoImages(idToPainting[imageid]);
}

// function createImageTab(title: string, panelContainer: HTMLElement, tabContainer: HTMLElement, paintings: Array<Painting>) {
//   const rowDiv = document.createElement('div');
//   rowDiv.className = 'row mld-tabs__panel is-active';
//   rowDiv.id = title;
//   panelContainer.appendChild(rowDiv);
//   addColumns(rowDiv, 1, 300, paintings);


//   const tab = document.createElement('a');
//   tab.addEventListener('click', () => {
//     showOnly(title, panelContainer); // eh find better way
//   })
//   // tab.href = '#' + rowDiv.id;
//   tab.className = 'mdl-tabs__tab';
//   tab.innerHTML = title;
//   tabContainer.appendChild(tab);

//   return rowDiv;
// }

// function showOnly(id: string, panelContainer: HTMLElement) {
//   for (let i = 1; i < panelContainer.children.length; i++) {
//     console.log('h');
//     if (panelContainer.children[i].id == id) {
//       panelContainer.children[i].style.display = "block";
//     } else {
//       panelContainer.children[i].style.display = "none";
//     }
//   }
// }

function makeGridView(paintings: Array<Painting>) {

  const panelContainer = document.getElementById('image-view-container');

  paintings.sort((a, b) => (+(a.year) > +(b.year)) ? 1 : (+(b.year) > +(a.year)) ? -1 : 0);

  const rowDiv = document.createElement('div');
  rowDiv.className = 'row mld-tabs__panel is-active';
  rowDiv.id = 'test1';
  panelContainer.appendChild(rowDiv);
  addColumns(rowDiv, paintings.length, paintings);

  // const tabContainer = document.getElementById('tab-link-container');
  // addColumns(rowDiv2, 1, 100, paintings);


  // const tab = document.createElement('a');
  // tab.href = '#' + rowDiv.id;
  // tab.className = 'mdl-tabs__tab';
  // tab.innerHTML = 'test1';
  // tabContainer.appendChild(tab);


  // const rowDiv2 = document.createElement('div');
  // rowDiv2.className = 'row mld-tabs__panel';
  // rowDiv2.id = 'test2';
  // panelContainer.appendChild(rowDiv2);
  // addColumns(rowDiv2, 1, 50, paintings);


  // const tab2 = document.createElement('a');
  // tab2.href = '#' + rowDiv2.id;
  // tab2.className = 'mdl-tabs__tab';
  // tab2.innerHTML = 'test2';
  // tabContainer.appendChild(tab2);
  // rowDiv2.style.display = 'none';

  // console.log(panelContainer.children.length);
}


// initialize legend
const legendStyles = ['Baroque', 'Renaissance', 'Romanticism', 'Realism', 'Dutch Golden Age',
  'Impressionism', 'Post-Impressionism', 'Rococo', 'Contemporary art',
  'Neoclassicism', 'Italian Renaissance', 'Academic art', 'Mannerism',
  'Abstract art'];

const legendDiv = document.getElementById('legend-container');
for (let style of legendStyles) {
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
