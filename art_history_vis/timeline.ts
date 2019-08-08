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
const DEFAULT_COLORS = [0xB165D4, 0xB165D4, 0xB165D4];
const GRAPH_START_YEAR = 1000;
const GRAPH_END_YEAR = 2020;


/**
* This class creates a 3D canvas for viewing impossible object OBJs.
*/
export interface Painting {
  year: number;
  depth: number;
  style?: string;
}

/**
 * This class creates a 3D canvas for viewing impossible object OBJs.
 */
export class Timeline {

  scene: THREE.Scene;
  paintingsGroup: THREE.Group;
  isHidden: boolean;
  paintingsData: Array<Painting>;


  /**
   * The constructor for the Viewer class.
   */
  constructor(scene: THREE.Scene, paintings: Array<Painting>) {
    this.scene = scene;
    this.paintingsGroup = new THREE.Group();
    this.isHidden = false;

    this.buildGraphVisualization(paintings);
  }


  private getPaintingsByYear(paintings: Array<Painting>): Painting[][] {
    const paintingsByYear = [];

    for (let i = 0; i < paintings.length; i++) {
      const currYear = paintings[i].year;
      if (!(currYear in paintingsByYear)) {
        paintingsByYear[currYear] = [];
      }
      if (paintingsByYear[currYear].length < 20 /*&& paintings[i].style != ''*/) {
        paintingsByYear[currYear].push(paintings[i]);
      }
    }

    return paintingsByYear;
  }

  /**
   * Builds the graph visualization from art history painting data.
   */
  private buildGraphVisualization(paintings: Array<Painting>) {
    const range = GRAPH_END_YEAR - GRAPH_START_YEAR;
    const offset = (GRAPH_END_YEAR - GRAPH_START_YEAR) / 2.0;

    const counts = Array<number>(range).fill(0);

    const paintingsByYear = this.getPaintingsByYear(paintings);


    for (let year in paintingsByYear) {
      const curr_paintings = paintingsByYear[year];

      curr_paintings.sort((a, b) => b.depth - a.depth);

      for (let i = 0; i < curr_paintings.length; i++) {
        const currYear = curr_paintings[i].year;
        const styles = curr_paintings[i].style.split(', ');

        //&& counts[currYear - GRAPH_START_YEAR] < 50
        if (currYear >= GRAPH_START_YEAR && currYear <= GRAPH_END_YEAR &&
          curr_paintings[i].depth != '') {
          const width = BLOCK_WIDTH;
          const height = BLOCK_WIDTH;
          const depth = BLOCK_WIDTH * curr_paintings[i].depth / 60.0;

          const geometry = new THREE.BoxBufferGeometry(width, height, depth);
          const deltaX = (currYear - GRAPH_START_YEAR - offset) * BLOCK_WIDTH;
          const deltaZ = -depth / 2.0;
          const deltaY = i * BLOCK_WIDTH;

          geometry.translate(deltaX, deltaY, deltaZ);
          var material = new THREE.MeshLambertMaterial({
            color: DEFAULT_COLORS[i % 3]
          });
          material.opacity = .2;
          material.transparent = true;
          var cube = new THREE.Mesh(geometry, material);
          this.paintingsGroup.add(cube);
        }
      }
    }
    this.scene.add(this.paintingsGroup);
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
      console.log(this.paintingsGroup)
      this.scene.remove(this.paintingsGroup);
      this.isHidden = true;
    }
  }


}
