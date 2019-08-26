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
const NUM_POINTS = 280;

const X_TRANSLATE = -150;
const Y_TRANSLATE = -100;
const Z_TRANSLATE = -250;
const X_SCALE = 1;
const Y_SCALE = 1;
const Z_SCALE = 2;
const CAMERA_POS_X = -150;
const CAMERA_POS_Y = 100;
const CAMERA_POS_Z = -250;
const CAMERA_FOCAL_LENGTH = 20;
const POINT_CLOUD_WIDTH = 280;
const POINT_CLOUD_HEIGHT = 280;
const POINT_CLOUD_ROTATE_Y = -0.6;

const LINE_THICKNESS = 1;
const LINE_LENGTH_Z = 256;

/**
 * This class extends Viewer, which creates a three.js scene. It sets up the
 * point cloud three.js scene and loads the point cloud.
 */
export class PointCloudViewer extends viewer.Viewer {
  pointCloudGroup: THREE.Group;

  /**
   * The constructor for the InfoViewer class.
   * @param paintings an Array of Painting objects.
   */
  constructor(canvas: HTMLCanvasElement, width: number, height: number,
    enableRotate: boolean) {
    super(canvas, width, height, enableRotate);
    this.setCamera(CAMERA_POS_X, CAMERA_POS_Y, CAMERA_POS_Z,
      CAMERA_FOCAL_LENGTH);

    this.pointCloudGroup = new THREE.Group();
    this.scene.add(this.pointCloudGroup)

    const offset = -125;
    this.makeLines(POINT_CLOUD_WIDTH / 2, 0, 0 - offset,
      POINT_CLOUD_WIDTH, LINE_THICKNESS, LINE_THICKNESS);
    this.makeLines(0, POINT_CLOUD_HEIGHT / 2, 0 - offset,
      1, POINT_CLOUD_HEIGHT, 1);
    this.makeLines(POINT_CLOUD_WIDTH / 2, POINT_CLOUD_HEIGHT, 0 - offset,
      POINT_CLOUD_WIDTH, LINE_THICKNESS, LINE_THICKNESS);
    // this.makeLines(POINT_CLOUD_WIDTH, POINT_CLOUD_HEIGHT / 2, 0 - offset,
    //   LINE_THICKNESS, POINT_CLOUD_HEIGHT, LINE_THICKNESS);

    for (let i = 5; i < 260; i += 10) {
      this.makeLines(POINT_CLOUD_WIDTH / 2, 0, i - offset,
        POINT_CLOUD_WIDTH, LINE_THICKNESS, LINE_THICKNESS);
      this.makeLines(POINT_CLOUD_WIDTH / 2, POINT_CLOUD_HEIGHT, i - offset,
        POINT_CLOUD_WIDTH, LINE_THICKNESS, LINE_THICKNESS);
      this.makeLines(0, POINT_CLOUD_HEIGHT / 2, i - offset,
        1, POINT_CLOUD_HEIGHT, 1);
      // this.makeLines(POINT_CLOUD_WIDTH / 2, POINT_CLOUD_HEIGHT / 2, i - offset,
      //   1, POINT_CLOUD_HEIGHT, 1);
    }

    // this.makeLines(POINT_CLOUD_WIDTH, POINT_CLOUD_HEIGHT / 2, 255 - offset,
    //   LINE_THICKNESS, POINT_CLOUD_HEIGHT, LINE_THICKNESS);

    this.makeLines(0, 0, LINE_LENGTH_Z,
      LINE_THICKNESS, LINE_THICKNESS, LINE_LENGTH_Z);
    this.makeLines(POINT_CLOUD_WIDTH, 0, LINE_LENGTH_Z,
      LINE_THICKNESS, LINE_THICKNESS, LINE_LENGTH_Z);
    this.makeLines(POINT_CLOUD_WIDTH, POINT_CLOUD_HEIGHT, LINE_LENGTH_Z,
      LINE_THICKNESS, LINE_THICKNESS, LINE_LENGTH_Z);
    this.makeLines(0, POINT_CLOUD_HEIGHT, LINE_LENGTH_Z,
      LINE_THICKNESS, LINE_THICKNESS, LINE_LENGTH_Z);


    super.animate();
  }

  private makeLines(positionX: number, positionY: number, positionZ: number,
    width: number, height: number, depth: number) {
    const geometry = new THREE.BoxBufferGeometry(width, height, depth);
    geometry.translate(X_TRANSLATE + positionX,
      Y_TRANSLATE + positionY,
      Z_TRANSLATE + positionZ);
    geometry.scale(X_SCALE, Y_SCALE, Z_SCALE);
    geometry.rotateY(POINT_CLOUD_ROTATE_Y);

    const material = new THREE.MeshLambertMaterial({
      color: 0x555555,
      transparent: true,
      opacity: .06
    });
    this.scene.add(new THREE.Mesh(geometry, material));
  }

  /**
   * Adds the depth image pixel points to the scene.
   */
  public loadPointCloud(originalPaintingContext: CanvasRenderingContext2D,
    depthMapContext: CanvasRenderingContext2D) {
    // Clear any existing point cloud geometry.
    this.pointCloudGroup.children = [];

    const pointsGeometry = this.updatePointsGeometry(originalPaintingContext,
      depthMapContext);
    const pointsMaterial = new THREE.PointsMaterial({
      size: 4,
      vertexColors: THREE.VertexColors
    });
    this.pointCloudGroup.add(new Points(pointsGeometry, pointsMaterial));
  }

  /**
   * Updates the points in the point cloud given the new pixel information.
   * @param originalPaintingContext a CanvasRenderingContext2D with the original
   *    image's pixel information
   * @param depthMapContext a CanvasRenderingContext2D with the depth map's
   *    pixel information
   */
  private updatePointsGeometry(originalPaintingContext: CanvasRenderingContext2D,
    depthMapContext: CanvasRenderingContext2D) {

    const positions = [];
    const colors = [];

    const widthStep = POINT_CLOUD_WIDTH / NUM_POINTS;
    const heightStep = POINT_CLOUD_HEIGHT / NUM_POINTS;
    for (let i = 0; i < POINT_CLOUD_WIDTH; i += 1) {
      for (let j = 1; j < POINT_CLOUD_HEIGHT; j += 1) {
        const depthPixelData = util.getPixelDataFromContext(depthMapContext,
          i, j);
        const originalPixelData = util.getPixelDataFromContext(
          originalPaintingContext, i, j);

        // Add position data, with the depth value as the z position.
        const x_position = i;
        const y_position = POINT_CLOUD_HEIGHT - j;
        const z_position = depthPixelData[0];
        positions.push(
          x_position * X_SCALE + X_TRANSLATE,
          y_position * Y_SCALE + Y_TRANSLATE,
          z_position * Z_SCALE + Z_TRANSLATE
        );

        // Use the color data from the original image
        colors.push(
          originalPixelData[0] / 255.0,
          originalPixelData[1] / 255.0,
          originalPixelData[2] / 255.0
        );
      }
    }
    const pointsGeometry = new THREE.BufferGeometry();
    pointsGeometry.addAttribute('position',
      new THREE.Float32BufferAttribute(positions, 3));
    pointsGeometry.addAttribute('color',
      new THREE.Float32BufferAttribute(colors, 3));
    pointsGeometry.rotateY(POINT_CLOUD_ROTATE_Y);

    return pointsGeometry;
  }
}
