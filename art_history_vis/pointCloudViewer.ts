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

import * as THREE from 'three';
import {Points} from 'three/src/objects/Points.js';
import * as viewer from './viewer';
import * as util from './util';

// Constants
const NUM_POINTS = 200;

const X_TRANSLATE = -50;
const Y_TRANSLATE = -50;
const Z_TRANSLATE = -50;
const X_SCALE = 0.2;
const Y_SCALE = 0.2;
const Z_SCALE = 0.33;
const POINT_CLOUD_WIDTH = 340;
const POINT_CLOUD_HEIGHT = 340;
const POINT_CLOUD_ROTATE_Y = -0.6;

/**
 * This class sets up the three.js scene and instantiates the timeline.
 */
export class PointCloudViewer extends viewer.Viewer {
  pointCloudGroup: THREE.Group;

  /**
   * The constructor for the InfoViewer class.
   * @param paintings an Array of Painting objects.
   */
  constructor(canvasid: string, width: number, height: number) {
    super(canvasid, width, height);

    this.pointCloudGroup = new THREE.Group();
    this.scene.add(this.pointCloudGroup)

    super.animate();
  }


  /**
   * Adds the depth image pixel points to the scene.
   */
  public loadPointCloud(originalImageContext: CanvasRenderingContext2D,
    depthMapContext: CanvasRenderingContext2D) {
    // Clear any existing point cloud geometry.
    this.pointCloudGroup.children = [];

    const pointsGeometry = this.updatePointsGeometry(originalImageContext,
      depthMapContext);
    const pointsMaterial = new THREE.PointsMaterial({
      size: 5,
      vertexColors: THREE.VertexColors
    });
    this.pointCloudGroup.add(new Points(pointsGeometry, pointsMaterial));
  }

  /**
   *
   * @param originalImageContext
   * @param depthMapContext
   */
  private updatePointsGeometry(originalImageContext: CanvasRenderingContext2D,
    depthMapContext: CanvasRenderingContext2D) {

    const positions = [];
    const colors = [];

    const widthStep = POINT_CLOUD_WIDTH / NUM_POINTS;
    const heightStep = POINT_CLOUD_HEIGHT / NUM_POINTS;
    for (let i = 0; i < POINT_CLOUD_WIDTH; i += widthStep) {
      for (let j = 1; j < POINT_CLOUD_HEIGHT; j += heightStep) {
        const pixelData = util.getPixelDataFromContext(depthMapContext,
          i, j);
        const coloredPixelData = util.getPixelDataFromContext(
          originalImageContext, i, j);

        // positions
        const x_position = i;
        const y_position = POINT_CLOUD_HEIGHT - j;
        const z_position = pixelData[0];
        positions.push(
          x_position * X_SCALE + X_TRANSLATE,
          y_position * Y_SCALE + Y_TRANSLATE,
          z_position * Z_SCALE + Z_TRANSLATE
        );

        // colors
        colors.push(
          coloredPixelData[0] / 255.0,
          coloredPixelData[1] / 255.0,
          coloredPixelData[2] / 255.0
        );
      }
    }

    const pointsGeometry = new THREE.BufferGeometry();
    pointsGeometry.addAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    pointsGeometry.addAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    pointsGeometry.rotateY(POINT_CLOUD_ROTATE_Y);

    return pointsGeometry;
  }
}
