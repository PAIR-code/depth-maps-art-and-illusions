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
import {Painting} from './util';


// Constants
const SCENE_UNIT_LENGTH = 0.4;

const AXIS_COLOR = 0x999999;
const AXIS_LENGTH = 10;

const BLOCK_LENGTH = 2;
const BLOCK_DEFAULT_OPACITY = 0.5;
const BLOCK_SELECTED_OPACITY = 1.0;

const GRAPH_START_YEAR = 1300;
const GRAPH_END_YEAR = 2020;
const OFFSET = (GRAPH_END_YEAR - GRAPH_START_YEAR) / 2;
const TICK_INTERVAL = 100;


/**
 * This class creates the depth plot geometry and stores the painting data.
 */
export class DepthPlot {

  scene: THREE.Scene;
  paintingsGroup: THREE.Group;
  paintingsData: Array<Painting>;
  blockToPainting: object;

  /**
   * The constructor for the Viewer class makes the depth plot blocks and axes.
   * @param scene the three.js scene the timeline gets added to.
   * @param paintings an Array of Painting objects.
   */
  constructor(scene: THREE.Scene, paintings: Array<Painting>) {
    this.scene = scene;

    this.paintingsGroup = new THREE.Group();
    this.scene.add(this.paintingsGroup);

    this.blockToPainting = {};

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
   * Gets the color value for a given style.
   * @param style the string with the name of the style.
   */
  private getStyleColor(style: string) {
    [0x1dabe6, 0x1c366a, 0xc3ced0, 0xe43034, 0xfc4e51,
      0xaf060f, 0x003f5c, 0x2f4b7c, 0x665191, 0xa05195, 0xd45087, 0xf95d6a,
      0xff7c43, 0xffa600]
    switch (style) {
      case 'Baroque': {return 0x1c366a;}
      case 'Renaissance': {return 0xc3ced0;}
      case 'Romanticism': {return 0xe43034;}
      case 'Realism': {return 0xfc4e51;}
      case 'Dutch Golden Age': {return 0xaf060f;}
      case 'Impressionism': {return 0x003f5c;}
      case 'Post-Impressionism': {return 0x2f4b7c;}
      case 'Rococo': {return 0x665191;}
      case 'Contemporary art': {return 0xa05195;}
      case 'Neoclassicism': {return 0xd45087;}
      case 'Italian Renaissance': {return 0xf95d6a;}
      case 'Academic art': {return 0xff7c43;}
      case 'Mannerism': {return 0xffa600;}
      case 'Abstract art': {return 0x1dabe6;}
      default: {return null;}
    }
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
        const color = this.getStyleColor(style);
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
   * Creates the X and Y axes.
   */
  private makeAxes() {
    this.makeXAxis();
    for (let i = GRAPH_START_YEAR; i < GRAPH_END_YEAR; i += TICK_INTERVAL) {
      this.makeXTick(i);
    }
  }

  /**
   * Creates the X axis.
   */
  private makeXAxis() {
    const width = SCENE_UNIT_LENGTH * (GRAPH_END_YEAR - GRAPH_START_YEAR);
    const height = SCENE_UNIT_LENGTH;
    const depth = SCENE_UNIT_LENGTH;
    const geometry = new THREE.BoxBufferGeometry(width, height, depth);

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
    const height = SCENE_UNIT_LENGTH * AXIS_LENGTH;
    const geometry = new THREE.BoxBufferGeometry(width, height, depth);

    const translateX = (year - GRAPH_START_YEAR - OFFSET) * SCENE_UNIT_LENGTH;
    geometry.translate(translateX, 0, 0);

    const material = new THREE.MeshLambertMaterial({
      color: AXIS_COLOR,
    });
    this.scene.add(new THREE.Mesh(geometry, material));
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
   * @param offset a number that is the 'x' offset of the timeline geometry.
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
    geometry.translate(deltaX, deltaY, deltaZ);

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
