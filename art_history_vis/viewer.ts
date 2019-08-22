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
import {OrbitControls} from 'three-orbitcontrols-ts';

// Constants
const BACKGROUND_COLOR = 0xffffff;
const CAMERA_FOV = 27;
const CAMERA_NEAR = 5;
const CAMERA_FAR = 3500;
const CAMERA_POS_Y = 0;
const CAMERA_POS_Z = 350;
const CAMERA_FOCAL_LENGTH = 60;
const DIR_LIGHT_INTENSITY = 0.5;
const DIR_LIGHT_TARGET_Z = -10;
const DIR_LIGHT_COLOR = 0xffffff;
const HEM_SKY_COLOR = 0xffffbb;
const HEM_GROUND_COLOR = 0x080820;


/**
 * This class sets up the three.js scene and instantiates the timeline.
 */
export class Viewer {

  renderer: THREE.WebGLRenderer;
  camera: THREE.PerspectiveCamera;
  public scene: THREE.Scene;

  /**
   * The constructor for the Viewer class.
   * @param paintings an Array of Painting objects.
   */
  constructor(canvasid: string, width: number, height: number) {
    this.initializeCanvas(canvasid, width, height);
    this.initializeOrbitControls();
    this.addLights();
  }


  /**
   * Initializes the main THREE.js components of the visualizer:
   * the renderer, camera, and scene.
   */
  public initializeCanvas(canvasid: string, width: number, height: number) {
    // Initialize renderer.
    const canvas = document.getElementById(canvasid);
    this.renderer = new THREE.WebGLRenderer({canvas});
    this.renderer.setSize(width, height);

    // Initialize camera.
    this.camera = new THREE.PerspectiveCamera(
      CAMERA_FOV, width / height,
      CAMERA_NEAR, CAMERA_FAR);
    this.camera.position.y = CAMERA_POS_Y;
    this.camera.position.z = CAMERA_POS_Z;
    this.camera.setFocalLength(CAMERA_FOCAL_LENGTH);

    // Initialize scene.
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(BACKGROUND_COLOR);
  }

  /**
   * Initializes orbit controls to control the scene's perspective camera.
   */
  private initializeOrbitControls() {
    let controls = new OrbitControls(this.camera,
      this.renderer.domElement);
    controls.zoomSpeed = 5;
    controls.keyPanSpeed = 200;
    controls.minZoom = -5;
    controls.update();
  }

  /**
   * This method is called to update the canvas at each frame.
   */
  public animate() {
    requestAnimationFrame(() => {this.animate();});
    // update the picking ray with the camera and mouse position
    this.renderer.render(this.scene,
      this.camera);
  }

  public resize(width: number, height: number) {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  /**
   * Adds a directional light and hemisphere light to the scene.
   */
  private addLights() {
    const directionalLight = new THREE.DirectionalLight(DIR_LIGHT_COLOR,
      DIR_LIGHT_INTENSITY);
    this.scene.add(directionalLight);

    // The target object controls the orientation of the DirectionalLight.
    const targetObject = new THREE.Object3D();
    targetObject.translateZ(DIR_LIGHT_TARGET_Z);
    this.scene.add(targetObject);
    directionalLight.target = targetObject;

    const hemisphereLight = new THREE.HemisphereLight(HEM_SKY_COLOR,
      HEM_GROUND_COLOR, 1);
    this.scene.add(hemisphereLight);
  }
}
