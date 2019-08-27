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
import {Object3D} from 'three';


// Constants
const SCENE_UNIT_LENGTH = 0.18;
const SCENE_X_TRANSLATE = 17;
const SCENE_Y_TRANSLATE = -7;

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

const ART_STYLE_COLOR_MAP = {
  'Baroque': 0x1c366a,
  'Renaissance': 0xc3ced0,
  'Romanticism': 0xe43034,
  'Realism': 0xfc4e51,
  'Dutch Golden Age': 0xaf060f,
  'Impressionism': 0x003f5c,
  'Post-Impressionism': 0x2f4b7c,
  'Rococo': 0x665191,
  'Contemporary art': 0xa05195,
  'Neoclassicism': 0xd45087,
  'Italian Renaissance': 0xf95d6a,
  'Academic art': 0xff7c43,
  'Mannerism': 0xffa600,
  'Abstract art': 0x1dabe6
}


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
      block.scale.setX(1);
      block.scale.setY(1);
    }
    return null;
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
        if (color != null) {
          const geometry = this.makePlotGeometry(paintings[i], i, year);
          const material = new THREE.MeshLambertMaterial({
            color: color,
            transparent: true,
            opacity: BLOCK_DEFAULT_OPACITY
          });
          const tip = new THREE.Mesh(geometry, material);
          this.blockToPainting[tip.uuid] = paintings[i];
          this.paintingsGroup.add(tip);
        }
      }
    }
  }

  /**
   * Creates the X axis.
   */
  private makeAxes() {
    this.makeXAxis();
    this.makeYAxis();
    this.makeLabel('year', 0, -8, false);
    this.makeLabel('depth', -70, 20, true);
    this.makeLabel('0', -70, 1, false);
    this.makeLabel('255', -70, 45, false);

  }

  private getCanvas(label: string): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    canvas.width = 100;
    canvas.height = 50;

    ctx.font = '16pt Arial';
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'black';
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label, canvas.width / 2, canvas.height / 2);
    return canvas;
  }

  private makeLabel(label: string, x: number, y: number, rotate: boolean) {
    const canvas = this.getCanvas(label);
    // const canvas = document.getElementById('texture-canvas');
    const texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;

    var material = new THREE.MeshBasicMaterial({map: texture});
    const geometry = new THREE.BoxGeometry(10, 5, 1);
    if (rotate) {
      geometry.rotateZ(Math.PI / 2.0);
    }
    geometry.translate(SCENE_X_TRANSLATE + x, SCENE_Y_TRANSLATE + y, 5);

    const mesh = new THREE.Mesh(geometry, material);
    this.scene.add(mesh);
  }


  /**
   * Creates the X axis.
   */
  private makeXAxis() {
    const width = SCENE_UNIT_LENGTH * (GRAPH_END_YEAR - GRAPH_START_YEAR);
    const height = SCENE_UNIT_LENGTH;
    const depth = SCENE_UNIT_LENGTH;
    const geometry = new THREE.BoxBufferGeometry(width, height, depth);
    geometry.translate(SCENE_X_TRANSLATE, SCENE_Y_TRANSLATE, 0);

    const material = new THREE.MeshLambertMaterial({
      color: AXIS_COLOR
    });
    this.scene.add(new THREE.Mesh(geometry, material));

    for (let i = GRAPH_START_YEAR; i < GRAPH_END_YEAR; i += TICK_INTERVAL) {
      this.makeXTick(i);
    }
  }

  /**
   * Creates the Y axis.
   */
  private makeYAxis() {
    const width = SCENE_UNIT_LENGTH;
    const height = SCENE_UNIT_LENGTH * Y_AXIS_LENGTH;
    const depth = SCENE_UNIT_LENGTH;
    const geometry = new THREE.BoxBufferGeometry(width, height, depth);
    geometry.translate(-SCENE_UNIT_LENGTH * OFFSET + SCENE_X_TRANSLATE,
      SCENE_UNIT_LENGTH * Y_AXIS_LENGTH / 2 + SCENE_Y_TRANSLATE, 0);

    const material = new THREE.MeshLambertMaterial({
      color: AXIS_COLOR
    });
    this.scene.add(new THREE.Mesh(geometry, material));
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
    geometry.translate(translateX + SCENE_X_TRANSLATE, SCENE_Y_TRANSLATE, 0);

    const material = new THREE.MeshLambertMaterial({
      color: AXIS_COLOR,
    });
    this.scene.add(new THREE.Mesh(geometry, material));

    this.makeLabel(year.toString(), translateX,
      -3, false);
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
      deltaY + SCENE_Y_TRANSLATE, deltaZ);

    return geometry;
  }

  /**
   * Gets the Painting associated with the given Mesh ID.
   * @param uuid a string that is the ID of the mesh.
   * @returns the Painting associated to the Mesh ID.
   */
  public getPainting(uuid: string): Painting {
    return this.blockToPainting[uuid];
  }
}
