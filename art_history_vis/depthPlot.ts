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
import * as THREE from 'three';
import {Painting, getStyleColor} from './util';

// Constants
const SCENE_UNIT_LENGTH = .4;
const SCENE_X_TRANSLATE = 34;
const SCENE_Y_TRANSLATE = -15;
const SCENE_Z_TRANSLATE = -300;

const AXIS_COLOR = 0x999999;
const X_AXIS_LENGTH = 10;
const Y_AXIS_LENGTH = 255;

const BLOCK_LENGTH = 2;
const BLOCK_DEFAULT_OPACITY = 0.3;
const BLOCK_SELECTED_OPACITY = 1.0;

const GRAPH_START_YEAR = 1300;
const GRAPH_END_YEAR = 2019;
const OFFSET = (GRAPH_END_YEAR - GRAPH_START_YEAR) / 2;
const TICK_INTERVAL = 100;

const LABEL_CANVAS_HEIGHT = 200, LABEL_CANVAS_WIDTH = 400;
const LABEL_WIDTH = 100, LABEL_HEIGHT = 50, LABEL_DEPTH = 1;
const LABEL_FONT = '64pt Arial';
const LABEL_BACKGROUND_COLOR = 'white';
const LABEL_TEXT_COLOR = 'black';
const LABEL_TEXT_ALIGN = "center";
const LABEL_TEXT_BASELINE = "middle";
const LABEL_Z_OFFSET = -10;
const LABEL_SCALE = 0.20;

const XAXIS_LABEL_OFFSET = -45;
const YAXIS_LABEL_OFFSET = -370;
const TICK_LABEL_OFFSET_X = 7;
const TICK_LABEL_OFFSET_Y = -25;

const DEPTH_LABEL_TRANSLATE_Y = 140;
const MIN_DEPTH_LABEL_TRANSLATE_Y = -10;
const MAX_DEPTH_LABEL_TRANSLATE_Y = 240;

const XAXIS_LABEL_TEXT = 'year';
const YAXIS_LABEL_TEXT = ' depth';
const MIN_DEPTH_LABEL_TEXT = '0';
const MAX_DEPTH_LABEL_TEXT = '255';


/**
 * This class creates the depth plot geometry and stores the painting data.
 */
export class DepthPlot {

  private scene: THREE.Scene;
  private paintingsGroup: THREE.Group = new THREE.Group();
  private blockToPainting: {[id: string]: Painting} = {};

  /**
   * The constructor for the Viewer class makes the depth plot blocks and axes.
   * @param scene the three.js scene the timeline gets added to.
   * @param paintings an Array of Painting objects.
   */
  constructor(scene: THREE.Scene, paintings: Array<Painting>) {
    this.scene = scene;
    this.scene.add(this.paintingsGroup);

    this.makeBlocks(paintings);
    this.makeAxes();
  }

  /**
   * Updates a given block Mesh's color and opacity (for changes in selection).
   *
   * @param block the THREE.Mesh block to update.
   * @param color the THREE.Color to set as the material color property.
   * @param selected a boolean that is true if the block should be set as selected
   *  with full opacity, and false for default opacity.
   */
  public updateBlock(block: THREE.Mesh, color: THREE.Color, selected: boolean) {
    block.material.color.copy(color);
    if (selected) {
      block.material.opacity = BLOCK_SELECTED_OPACITY;
    } else {
      block.material.opacity = BLOCK_DEFAULT_OPACITY;
    }
  }

  /**
   * Gets the Painting associated with the given Mesh ID.
   * @param uuid a string that is the ID of the mesh.
   * @returns the Painting associated to the Mesh ID.
   */
  public getPainting(uuid: string): Painting {
    return this.blockToPainting[uuid];
  }

  /**
   * Checks if a painting is in the depth plot.
   * @param uuid the ID of the painting to check.
   * @returns true if the painting is in the depth plot, false otherwise.
   */
  public hasPainting(uuid: string): boolean {
    return uuid in this.blockToPainting;
  }

  /**
   * Checks whether a year is within the start and end years of the graph.
   * @param year the year to be checked.
   * @returns a boolean that is whether the year is in the graph.
   */
  private inGraphBounds(year: number): boolean {
    return year >= GRAPH_START_YEAR && year <= GRAPH_END_YEAR;
  }

  /**
   * Builds the graph visualization from art history painting data.
   * @param paintings an Array of Painting objects.
   */
  private makeBlocks(paintings: Array<Painting>) {
    for (let i = 0; i < paintings.length; i++) {
      const year = paintings[i].year;
      if (this.inGraphBounds(year)) {
        const style = paintings[i].style.split(', ')[0];
        const color = getStyleColor(style);
          const geometry = this.makePlotGeometry(paintings[i], i, year);
          const material = new THREE.MeshLambertMaterial({
            color,
            transparent: true,
            opacity: BLOCK_DEFAULT_OPACITY
          });
          const tip = new THREE.Mesh(geometry, material);
          this.blockToPainting[tip.uuid] = paintings[i];
          this.paintingsGroup.add(tip);
      }
    }
  }

  /**
   * Makes the BoxBufferGeometry for the given painting.
   * @param painting a Painting object to be represented by the mesh.
   * @param index a number that is the index of this painting in its 'year' list.
   * @param year a number that is the year of the painting object.
   * @returns the BoxBufferGeometry of the Painting.
   */
  private makePlotGeometry(painting: Painting, index: number,
    year: number): THREE.BoxBufferGeometry {
    const width = SCENE_UNIT_LENGTH * BLOCK_LENGTH;
    const depth = SCENE_UNIT_LENGTH * BLOCK_LENGTH;
    const height = SCENE_UNIT_LENGTH * BLOCK_LENGTH;
    const geometry = new THREE.BoxBufferGeometry(width, height, depth);

    const deltaX = (year - GRAPH_START_YEAR - OFFSET) * SCENE_UNIT_LENGTH;
    const deltaY = (depth / 2.0) + SCENE_UNIT_LENGTH * painting.range;
    const deltaZ = 0;
    geometry.translate(deltaX + SCENE_X_TRANSLATE,
      deltaY + SCENE_Y_TRANSLATE, deltaZ + SCENE_Z_TRANSLATE);

    return geometry;
  }

  /**
   * Creates the X and Y axes.
   */
  private makeAxes() {
    this.makeYAxis();
    this.makeXAxis();
  }

  /**
   * Creates and draws the label on a canvas element, to be used as a texture.
   * @param label the label text to display.
   * @returns the canvas element with the text label.
   */
  private makeLabelCanvas(label: string): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.style.visibility = 'hidden';
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    canvas.width = LABEL_CANVAS_WIDTH;
    canvas.height = LABEL_CANVAS_HEIGHT;

    ctx.font = LABEL_FONT;
    ctx.fillStyle = LABEL_BACKGROUND_COLOR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = LABEL_TEXT_COLOR;
    ctx.textAlign = LABEL_TEXT_ALIGN;
    ctx.textBaseline = LABEL_TEXT_BASELINE;
    ctx.fillText(label, LABEL_WIDTH, LABEL_HEIGHT);
    return canvas;
  }

  /**
   * Creates a text label on the depth plot.
   * @param label the label text to display.
   * @param x the x position of the label.
   * @param y the y position of the label.
   * @param rotate true if the label should be rotated (90 degrees
   *  counterclockwise), false otherwise.
   */
  private makeLabel(label: string, x: number, y: number, rotate: boolean) {
    const canvas = this.makeLabelCanvas(label);
    const texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;

    const material = new THREE.MeshBasicMaterial({map: texture});
    const geometry = new THREE.BoxGeometry(LABEL_WIDTH, LABEL_HEIGHT, LABEL_DEPTH);
    if (rotate) {
      geometry.rotateZ(Math.PI / 2.0);
    }
    geometry.scale(LABEL_SCALE, LABEL_SCALE, 1);
    geometry.translate(SCENE_X_TRANSLATE + x, SCENE_Y_TRANSLATE + y,
      SCENE_Z_TRANSLATE + LABEL_Z_OFFSET);

    const mesh = new THREE.Mesh(geometry, material);
    this.scene.add(mesh);
  }


  /**
   * Creates the X axis.
   */
  private makeXAxis() {
    // Make X axis line mesh
    const width = SCENE_UNIT_LENGTH * (GRAPH_END_YEAR - GRAPH_START_YEAR);
    const height = SCENE_UNIT_LENGTH;
    const depth = SCENE_UNIT_LENGTH;
    const geometry = new THREE.BoxBufferGeometry(width, height, depth);
    geometry.translate(SCENE_X_TRANSLATE, SCENE_Y_TRANSLATE, SCENE_Z_TRANSLATE);

    const material = new THREE.MeshLambertMaterial({
      color: AXIS_COLOR
    });
    this.scene.add(new THREE.Mesh(geometry, material));

    // Make X axis tick marks
    for (let i = GRAPH_START_YEAR; i < GRAPH_END_YEAR; i += TICK_INTERVAL) {
      this.makeXTick(i);
    }
    this.makeLabel(XAXIS_LABEL_TEXT,
      0, XAXIS_LABEL_OFFSET * SCENE_UNIT_LENGTH, false);
  }

  /**
   * Creates the Y axis.
   */
  private makeYAxis() {
    // Make Y axis line mesh
    const width = SCENE_UNIT_LENGTH;
    const height = SCENE_UNIT_LENGTH * Y_AXIS_LENGTH;
    const depth = SCENE_UNIT_LENGTH;
    const geometry = new THREE.BoxBufferGeometry(width, height, depth);
    geometry.translate(-SCENE_UNIT_LENGTH * OFFSET + SCENE_X_TRANSLATE,
      SCENE_UNIT_LENGTH * Y_AXIS_LENGTH / 2 + SCENE_Y_TRANSLATE,
      SCENE_Z_TRANSLATE);

    const material = new THREE.MeshLambertMaterial({
      color: AXIS_COLOR
    });
    this.scene.add(new THREE.Mesh(geometry, material));

    // Make Y axis labels
    this.makeLabel(YAXIS_LABEL_TEXT, YAXIS_LABEL_OFFSET * SCENE_UNIT_LENGTH,
      DEPTH_LABEL_TRANSLATE_Y * SCENE_UNIT_LENGTH, true);
    this.makeLabel(MIN_DEPTH_LABEL_TEXT, YAXIS_LABEL_OFFSET * SCENE_UNIT_LENGTH,
      MIN_DEPTH_LABEL_TRANSLATE_Y * SCENE_UNIT_LENGTH, false);
    this.makeLabel(MAX_DEPTH_LABEL_TEXT, YAXIS_LABEL_OFFSET * SCENE_UNIT_LENGTH,
      MAX_DEPTH_LABEL_TRANSLATE_Y * SCENE_UNIT_LENGTH, false);
  }

  /**
   * Makes a tick on the X axis at the given year.
   * @param year the year where the tick should be drawn.
   */
  private makeXTick(year: number) {
    const depth = SCENE_UNIT_LENGTH;
    const width = SCENE_UNIT_LENGTH;
    const height = SCENE_UNIT_LENGTH * X_AXIS_LENGTH;
    const geometry = new THREE.BoxBufferGeometry(width, height, depth);

    const translateX = (year - GRAPH_START_YEAR - OFFSET) * SCENE_UNIT_LENGTH;
    geometry.translate(translateX + SCENE_X_TRANSLATE, SCENE_Y_TRANSLATE,
      SCENE_Z_TRANSLATE);

    const material = new THREE.MeshLambertMaterial({
      color: AXIS_COLOR,
    });
    this.scene.add(new THREE.Mesh(geometry, material));

    this.makeLabel(year.toString(),
      translateX + TICK_LABEL_OFFSET_X,
      TICK_LABEL_OFFSET_Y * SCENE_UNIT_LENGTH,
      false);
  }
}
