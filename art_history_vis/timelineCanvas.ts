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
import * as timeline from './timeline';
import {OrbitControls} from 'three-orbitcontrols-ts';


// Constants
const BACKGROUND_COLOR = 0xffffff;
const CAMERA_FOV = 27;
const CAMERA_NEAR = 5;
const CAMERA_FAR = 3500;
const CAMERA_POS_Y = 0.3;
const CAMERA_POS_Z = 100;
const CAMERA_FOCAL_LENGTH = 60;
const DIR_LIGHT_INTENSITY = 0.5;
const DIR_LIGHT_TARGET_Z = -10;
const DIR_LIGHT_COLOR = 0xffffff;
const HEM_SKY_COLOR = 0xffffbb;
const HEM_GROUND_COLOR = 0x080820;



/**
 * This class creates a 3D canvas for viewing impossible object OBJs.
 */
export class TimelineCanvas {

  static renderer: THREE.WebGLRenderer;
  static camera: THREE.PerspectiveCamera;
  static scene: THREE.Scene;

  static timeline: timeline.Timeline;

  /**
   * The constructor for the TimelineCanvas class.
   */
  constructor(paintings: Array<timeline.Painting>) {
    this.initializeCanvas();
    this.initializeOrbitControls();
    this.addLights();
    TimelineCanvas.timeline = new timeline.Timeline(TimelineCanvas.scene,
      paintings);

    TimelineCanvas.animate();
  }


  /**
   * Initializes the main THREE.js components of the visualizer:
   * the renderer, camera, and scene.
   */
  private initializeCanvas() {
    // Initialize renderer.
    const canvas = document.getElementById("canvas-container");
    TimelineCanvas.renderer = new THREE.WebGLRenderer({canvas});
    TimelineCanvas.renderer.setSize(window.innerWidth,
      window.innerHeight);

    // Initialize camera.
    TimelineCanvas.camera = new THREE.PerspectiveCamera(
      CAMERA_FOV, window.innerWidth / window.innerHeight,
      CAMERA_NEAR, CAMERA_FAR);
    TimelineCanvas.camera.position.y = CAMERA_POS_Y;
    TimelineCanvas.camera.position.z = CAMERA_POS_Z;
    TimelineCanvas.camera.setFocalLength(CAMERA_FOCAL_LENGTH);

    // Initialize scene.
    TimelineCanvas.scene = new THREE.Scene();
    TimelineCanvas.scene.background = new THREE.Color(BACKGROUND_COLOR);
  }


  /**
   * Initializes orbit controls to control the scene's perspective camera.
   */
  private initializeOrbitControls() {
    let controls = new OrbitControls(TimelineCanvas.camera,
      TimelineCanvas.renderer.domElement);
    controls.keys = {
      LEFT: 37, //left arrow
      UP: 38, // up arrow
      RIGHT: 39, // right arrow
      BOTTOM: 40 // down arrow
    }
    controls.zoomSpeed = 5;
    controls.keyPanSpeed = 200;
    controls.minZoom = -5;
    controls.update();
  }


  /**
   * This method is called to update the canvas at each frame.
   */
  public static animate() {
    requestAnimationFrame(TimelineCanvas.animate);
    TimelineCanvas.renderer.render(TimelineCanvas.scene,
      TimelineCanvas.camera);
  }


  /**
   * Adds a directional light and hemisphere light to the scene.
   */
  private addLights() {
    const directionalLight = new THREE.DirectionalLight(DIR_LIGHT_COLOR,
      DIR_LIGHT_INTENSITY);
    TimelineCanvas.scene.add(directionalLight);

    // The target object controls the orientation of the DirectionalLight.
    const targetObject = new THREE.Object3D();
    targetObject.translateZ(DIR_LIGHT_TARGET_Z);
    TimelineCanvas.scene.add(targetObject);
    directionalLight.target = targetObject;

    const hemisphereLight = new THREE.HemisphereLight(HEM_SKY_COLOR,
      HEM_GROUND_COLOR, 1);
    TimelineCanvas.scene.add(hemisphereLight);
  }
}
