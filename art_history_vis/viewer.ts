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
const CONTROLS_ZOOM_SPEED = 2;
const CONTROLS_PAN_SPEED = 200;
const CONTROLS_MIN_ZOOM = -5;


/**
 * This class sets up a three.js scene.
 */
export class Viewer {

  public renderer: THREE.WebGLRenderer;
  public camera: THREE.PerspectiveCamera;
  public scene: THREE.Scene;
  public controls: OrbitControls;

  /**
   * The constructor for the Viewer class.
   * @param canvas the HTMLCanvasElement for rendering the three.js scene
   * @param width the width of the viewer.
   * @param height the height of the viewer.
   * @param enableRotate whether the viewer should allow rotation.
   */
  constructor(canvas: HTMLCanvasElement, width: number, height: number,
    enableRotate: boolean) {
    this.initializeCanvas(canvas, width, height);
    this.initializeOrbitControls(enableRotate);
    this.addLights();
  }

  /**
   * Initializes the main THREE.js components of the visualizer:
   * the renderer, camera, and scene.
   * @param canvas the HTMLCanvasElement for rendering the three.js scene
   * @param width the width of the viewer.
   * @param height the height of the viewer.
   */
  public initializeCanvas(canvas: HTMLCanvasElement, width: number, height: number) {
    // Initialize renderer.
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
   * Sets the viewer's camera position and focal length.
   * @param positionX the x position value to set.
   * @param positionY the y position value to set.
   * @param positionZ the z position value to set.
   * @param focalLength the focal length value to set.
   */
  public setCamera(positionX: number, positionY: number, positionZ: number,
    focalLength: number) {
    this.camera.position.x = positionX;
    this.camera.position.y = positionY;
    this.camera.position.z = positionZ;
    this.camera.setFocalLength(focalLength);
  }

  /**
   * Initializes orbit controls to control the scene's perspective camera.
   * @param enableRotate whether the viewer should allow rotation.
   */
  private initializeOrbitControls(enableRotate: boolean) {
    this.controls = new OrbitControls(this.camera,
      this.renderer.domElement);
    this.controls.enableRotate = enableRotate;
    if (enableRotate) {
      this.controls.rotateSpeed = .5;
    }
    this.controls.zoomSpeed = CONTROLS_ZOOM_SPEED;
    this.controls.keyPanSpeed = CONTROLS_PAN_SPEED;
    this.controls.minZoom = CONTROLS_MIN_ZOOM;
    this.controls.mouseButtons = {
      ORBIT: THREE.MOUSE.RIGHT,
      ZOOM: THREE.MOUSE.MIDDLE,
      PAN: THREE.MOUSE.LEFT
    };
    this.controls.update();
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

  /**
   * Resizes the viewer, updating the camera and renderer settings.
   * @param width the new resized width of the viewer.
   * @param height the new resized height of the viewer.
   */
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
