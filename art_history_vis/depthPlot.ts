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
const UNIT_LENGTH = 0.4;
const AXIS_COLOR = 0x999999;
const AXIS_LENGTH = 10;
const BLOCK_LENGTH = 2;
const BLOCK_OPACITY = 0.5;
const BLOCK_SELECTED_OPACITY = 1.0;

const GRAPH_START_YEAR = 1300;
const GRAPH_END_YEAR = 2020;
const OFFSET = (GRAPH_END_YEAR - GRAPH_START_YEAR) / 2;
const TICK_INTERVAL = 100;

const STYLE_COLORS = [0x1dabe6, 0x1c366a, 0xc3ced0, 0xe43034, 0xfc4e51,
  0xaf060f, 0x003f5c, 0x2f4b7c, 0x665191, 0xa05195, 0xd45087, 0xf95d6a,
  0xff7c43, 0xffa600];

const STYLE_NAMES = ['Modern art', 'Baroque', 'Renaissance', 'Romanticism',
  'Realism', 'Dutch Golden Age', 'Impressionism', 'Post-Impressionism',
  'Rococo', 'Contemporary art', 'Neoclassicism', 'Italian Renaissance',
  'Academic art', 'Mannerism', 'Abstract art'];

// , 'Symbolism', 'Modernism',
// 'Street art', 'Ukiyo-e', 'Expressionism', 'American Impressionism',
// 'Northern Renaissance', 'Antwerp school', 'Tonalism', 'Neo-impressionism',
// 'Aestheticism', 'Cubism', 'Art Nouveau', 'Surrealism', 'Barbizon school',
// 'American Realism', 'Hudson River School',
// 'Dutch and Flemish Renaissance painting', 'Venetian school', 'Luminism',
// 'High Renaissance', 'Classicism', 'Primitivism', 'Skagen Painters',
// 'Hague School', 'Gothic art', 'Abstract expressionism',
// 'German Renaissance', 'Ashcan School', 'Color Field'

/**
 * This class holds the painting data and creates the depth plot geometry.
 */
export class DepthPlot {

  scene: THREE.Scene;
  paintingsGroup: THREE.Group;
  paintingsData: Array<Painting>;
  blockToPainting: object;

  /**
   * The constructor for the Viewer class.
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

  public updateBlock(block: THREE.Mesh, color: THREE.Color, selected: boolean) {
    block.material.color.copy(color);
    if (selected) {
      block.material.opacity = BLOCK_SELECTED_OPACITY;
    } else {
      block.material.opacity = BLOCK_OPACITY;
    }
  }

  /**
   * Builds the graph visualization from art history painting data.
   * @param paintings an Array of Painting objects.
   */
  private makeBlocks(paintings: Array<Painting>) {
    for (let i = 0; i < paintings.length; i++) {
      const currYear = paintings[i].year;
      const styles = paintings[i].style.split(', ');
      if (this.inGraphBounds(currYear)) {
        const geometryTip = this.makePlotGeometry(paintings[i], i, currYear);

        let currColor = null;
        for (let i = 0; i < STYLE_NAMES.length; i++) {
          if (styles.includes(STYLE_NAMES[i])) {
            currColor = STYLE_COLORS[i % STYLE_COLORS.length];
          }
        }

        if (currColor != null) {
          const materialTip = new THREE.MeshLambertMaterial({
            color: currColor,
            transparent: true,
            opacity: .5
          });
          const tip = new THREE.Mesh(geometryTip, materialTip);
          this.blockToPainting[tip.uuid] = paintings[i];
          this.paintingsGroup.add(tip);
        }
      }
    }
  }

  /**
   *
   */
  private makeAxes() {
    this.makeXAxis();
    for (let i = GRAPH_START_YEAR; i < GRAPH_END_YEAR; i += TICK_INTERVAL) {
      this.makeYTick(i);
    }
  }

  private makeXAxis() {
    const width = UNIT_LENGTH * (GRAPH_END_YEAR - GRAPH_START_YEAR);
    const height = UNIT_LENGTH;
    const depth = UNIT_LENGTH;
    const geometry = new THREE.BoxBufferGeometry(width, height, depth);

    const material = new THREE.MeshLambertMaterial({
      color: AXIS_COLOR
    });
    this.paintingsGroup.add(new THREE.Mesh(geometry, material));
  }

  private makeYTick(year: number) {
    const depth = UNIT_LENGTH;
    const width = UNIT_LENGTH;
    const height = UNIT_LENGTH * AXIS_LENGTH;
    const geometry = new THREE.BoxBufferGeometry(width, height, depth);

    const translateX = (year - GRAPH_START_YEAR - OFFSET) * UNIT_LENGTH;
    geometry.translate(translateX, 0, 0);

    const material = new THREE.MeshLambertMaterial({
      color: AXIS_COLOR,
    });
    this.paintingsGroup.add(new THREE.Mesh(geometry, material));
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
    const width = UNIT_LENGTH * BLOCK_LENGTH;
    const depth = UNIT_LENGTH * BLOCK_LENGTH;
    const height = UNIT_LENGTH * BLOCK_LENGTH;
    const geometry = new THREE.BoxBufferGeometry(width, height, depth);

    const deltaX = (year - GRAPH_START_YEAR - OFFSET) * UNIT_LENGTH;
    const deltaY = (depth / 2.0) + UNIT_LENGTH * painting.range;
    const deltaZ = 0;
    geometry.translate(deltaX, deltaY, deltaZ);

    return geometry;
  }
}
