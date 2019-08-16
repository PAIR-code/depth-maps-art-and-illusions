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
import * as timeline from './timeline';
import {OrbitControls} from 'three-orbitcontrols-ts';
import * as detailView from './detailView';

// Constants
const BACKGROUND_COLOR = 0xeeeeee;
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
 * This class sets up the three.js scene and instantiates the timeline.
 */
export class DetailViewCanvas {

  static renderer: THREE.WebGLRenderer;
  static camera: THREE.PerspectiveCamera;
  static scene: THREE.Scene;
  static detailView: detailView.DetailView;


  /**
   * The constructor for the DetailViewCanvas class.
   * @param paintings an Array of Painting objects.
   */
  constructor(canvasid: string) {
    this.initializeCanvas(canvasid);
    this.initializeOrbitControls();
    this.addLights();

    this.initializeDetailView();



    DetailViewCanvas.animate();
  }

  public initializeDetailView() {
    DetailViewCanvas.detailView = new detailView.DetailView(DetailViewCanvas.scene);
    DetailViewCanvas.detailView.show();
  }

  public getCamera(): THREE.PerspectiveCamera {
    return DetailViewCanvas.camera;
  }

  public getRenderer(): THREE.WebGLRenderer {
    return DetailViewCanvas.renderer;
  }

  /**
   * Initializes the main THREE.js components of the visualizer:
   * the renderer, camera, and scene.
   */
  public initializeCanvas(canvasid: string) {
    // Initialize renderer.
    const canvas = document.getElementById(canvasid);
    const container = document.getElementById('point-cloud-container');
    DetailViewCanvas.renderer = new THREE.WebGLRenderer({canvas});
    // DetailViewCanvas.renderer.setPixelRatio(window.devicePixelRatio);
    // console.log(container);
    DetailViewCanvas.renderer.setSize(container.clientWidth,
      container.clientHeight);

    // Initialize camera.
    DetailViewCanvas.camera = new THREE.PerspectiveCamera(
      CAMERA_FOV, container.clientWidth / container.clientHeight,
      CAMERA_NEAR, CAMERA_FAR);
    DetailViewCanvas.camera.position.y = CAMERA_POS_Y;
    DetailViewCanvas.camera.position.z = CAMERA_POS_Z;
    DetailViewCanvas.camera.setFocalLength(CAMERA_FOCAL_LENGTH);

    // Initialize scene.
    DetailViewCanvas.scene = new THREE.Scene();
    DetailViewCanvas.scene.background = new THREE.Color(BACKGROUND_COLOR);
  }

  /**
   * Initializes orbit controls to control the scene's perspective camera.
   */
  private initializeOrbitControls() {
    let controls = new OrbitControls(DetailViewCanvas.camera,
      DetailViewCanvas.renderer.domElement);
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
    requestAnimationFrame(DetailViewCanvas.animate);
    // update the picking ray with the camera and mouse position


    DetailViewCanvas.renderer.render(DetailViewCanvas.scene,
      DetailViewCanvas.camera);
  }

  /**
   * Adds a directional light and hemisphere light to the scene.
   */
  private addLights() {
    const directionalLight = new THREE.DirectionalLight(DIR_LIGHT_COLOR,
      DIR_LIGHT_INTENSITY);
    DetailViewCanvas.scene.add(directionalLight);

    // The target object controls the orientation of the DirectionalLight.
    const targetObject = new THREE.Object3D();
    targetObject.translateZ(DIR_LIGHT_TARGET_Z);
    DetailViewCanvas.scene.add(targetObject);
    directionalLight.target = targetObject;

    const hemisphereLight = new THREE.HemisphereLight(HEM_SKY_COLOR,
      HEM_GROUND_COLOR, 1);
    DetailViewCanvas.scene.add(hemisphereLight);
  }
}
