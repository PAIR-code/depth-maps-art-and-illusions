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

// Constants
const BLOCK_WIDTH = 0.3;
const PAINTING_COLORS = [0xB165D4, 0xB165D4, 0xB165D4];
const PAINTING_OPACITY = 0.2;
const GRAPH_START_YEAR = 1000;
const GRAPH_END_YEAR = 2020;
const MAX_PAINTINGS_PER_YEAR = 20;
const DEPTH_SCALE_FACTOR = 0.02;


/**
* Represents a single painting from the GAC dataset.
*/
export interface Painting {
  year: number;
  depth: number;
  style?: string;
}

/**
 * This class contains the paintings of the art history timeline.
 */
export class Timeline {

  scene: THREE.Scene;
  paintingsGroup: THREE.Group;
  isHidden: boolean;
  paintingsData: Array<Painting>;

  /**
   * The constructor for the Viewer class.
   * @param scene the three.js scene the timeline gets added to.
   * @param paintings an Array of Painting objects.
   */
  constructor(scene: THREE.Scene, paintings: Array<Painting>) {
    this.scene = scene;
    this.paintingsGroup = new THREE.Group();
    this.isHidden = false;

    this.buildGraphVisualization(paintings);
  }

  /**
   * Gets an object containing an Array of paintings for every year
   * (after year 0) that has at least one painting.
   * @param paintings an Array of Painting objects.
   * @returns an object with an Array of Paintings for each year.
   */
  private getPaintingsByYear(paintings: Array<Painting>): object {
    const paintingsByYear = {};

    for (let i = 0; i < paintings.length; i++) {
      const currYear = paintings[i].year;
      if (+currYear > 0) {
        if (!(currYear in paintingsByYear)) {
          paintingsByYear[currYear] = [];
        }
        paintingsByYear[currYear].push(paintings[i]);
      }
    }

    return paintingsByYear;
  }

  /**
   * Builds the graph visualization from art history painting data.
   * @param paintings an Array of Painting objects.
   */
  private buildGraphVisualization(paintings: Array<Painting>) {
    const offset = (GRAPH_END_YEAR - GRAPH_START_YEAR) / 2.0;
    const paintingsByYear = this.getPaintingsByYear(paintings);

    for (let currPaintings of Object.values(paintingsByYear)) {
      currPaintings.sort((a, b) => b.depth - a.depth);
      for (let i = 0; i < currPaintings.length; i++) {
        const currYear = currPaintings[i].year;
        if (this.inGraphBounds(currYear)) {
          const geometry = this.makePaintingGeometry(currPaintings[i], i, offset, currYear);
          const material = new THREE.MeshLambertMaterial({
            color: PAINTING_COLORS[i % PAINTING_COLORS.length],
            opacity: PAINTING_OPACITY,
            transparent: true
          });
          const cube = new THREE.Mesh(geometry, material);
          this.paintingsGroup.add(cube);
        }
      }
    }
    this.scene.add(this.paintingsGroup);
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
  private makePaintingGeometry(painting: Painting, index: number,
    offset: number, year: number): THREE.BoxBufferGeometry {
    const width = BLOCK_WIDTH;
    const height = BLOCK_WIDTH;
    const depth = BLOCK_WIDTH * painting.depth * DEPTH_SCALE_FACTOR;
    const geometry = new THREE.BoxBufferGeometry(width, height, depth);

    const deltaX = (year - GRAPH_START_YEAR - offset) * BLOCK_WIDTH;
    const deltaY = index * BLOCK_WIDTH;
    const deltaZ = -(depth / 2.0);
    geometry.translate(deltaX, deltaY, deltaZ);

    return geometry;
  }

  /**
   * Shows the timeline geometry.
   */
  public show() {
    if (this.isHidden == true) {
      this.scene.add(this.paintingsGroup);
      this.isHidden = false;
    }
  }

  /**
   * Hides the timeline geometry.
   */
  public hide() {
    if (this.isHidden == false) {
      this.scene.remove(this.paintingsGroup);
      this.isHidden = true;
    }
  }
}
