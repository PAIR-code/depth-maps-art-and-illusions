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
import * as d3 from 'd3';
import * as THREE from 'three';
import {OBJLoader} from 'three-obj-mtl-loader';
import {OrbitControls} from 'three-orbitcontrols-ts';

// Constants
const BACKGROUND_COLOR = 0x222222;
const LIGHT_COLOR = 0xff0000;
const CAMERA_FOV = 75;
const CAMERA_NEAR = 0.1;
const CAMERA_FAR = 1000;
const CAMERA_POS_Y = 0.3;
const CAMERA_POS_Z = 3;
const CAMERA_FOCAL_LENGTH = 60;
const OBJ_SCALE = 0.1;
const LIGHT_INTENSITY = 1;
const LIGHT_DISTANCE = 100;
const LIGHT_POS_X = 5;
const LIGHT_POS_Y = 5;
const LIGHT_POS_Z = 3;


/**
 * This class creates a 3D canvas for viewing impossible object OBJs.
 */
export class OBJViewer {

  static renderer: THREE.WebGLRenderer;
  static camera: THREE.PerspectiveCamera;
  static scene: THREE.Scene;


  /**
   * The constructor for the OBJViewer class.
   */
  constructor(onCameraUpdated: () => void) {
    this.initializeCanvas(onCameraUpdated);
    OBJViewer.animate();
  }


  /**
   * Initializes the main THREE.js components of the visualizer:
   * the renderer, camera, and scene.
   */
  private initializeCanvas(onCameraUpdated: () => void) {
    OBJViewer.renderer = new THREE.WebGLRenderer({
      preserveDrawingBuffer: true
    });

    // onCameraUpdated updates the depth map to match the camera view
    OBJViewer.renderer.domElement.addEventListener("mouseup",
      onCameraUpdated);
    document.getElementById("canvas-container").appendChild(
      OBJViewer.renderer.domElement);

    OBJViewer.renderer.setSize(window.innerWidth,
      window.innerHeight);

    // Initialize camera and orbit controls.
    OBJViewer.camera = new THREE.PerspectiveCamera(
      CAMERA_FOV, window.innerWidth / window.innerHeight,
      CAMERA_NEAR, CAMERA_FAR);
    let controls = new OrbitControls(
      OBJViewer.camera, OBJViewer.renderer.domElement);
    OBJViewer.camera.position.y = CAMERA_POS_Y;
    OBJViewer.camera.position.z = CAMERA_POS_Z;
    OBJViewer.camera.setFocalLength(CAMERA_FOCAL_LENGTH);
    controls.update();

    // Initialize scene.
    OBJViewer.scene = new THREE.Scene();
    OBJViewer.scene.background = new THREE.Color(BACKGROUND_COLOR);
    this.addLightsAndGeometry();
  }


  /**
   * This method is called to update the canvas at each frame.
   */
  public static animate() {
    requestAnimationFrame(OBJViewer.animate);
    OBJViewer.renderer.render(OBJViewer.scene,
      OBJViewer.camera);
  }


  /**
   * Adds lights and geometry to the scene.
   */
  private addLightsAndGeometry() {
    this.loadOBJ("impossible_triangle.obj");

    var light = new THREE.PointLight(LIGHT_COLOR, LIGHT_INTENSITY,
      LIGHT_DISTANCE);
    light.position.set(LIGHT_POS_X, LIGHT_POS_Y, LIGHT_POS_Z);
    OBJViewer.scene.add(light);
  }

  /**
   * Loads and OBJ and adds it to the scene.
   * @param path The path of the obj file to load.
   */
  private loadOBJ(path: string) {
    let loader = new OBJLoader();
    loader.load(path,
      (object: THREE.Group) => {
        object.traverse((child: THREE.Mesh) => {
          if (child instanceof THREE.Mesh) {
            let depth_material = new THREE.MeshPhongMaterial();
            child.material = depth_material
            child.scale.x = child.scale.y = child.scale.z = OBJ_SCALE;
          }
        });
        OBJViewer.scene.add(object);
      },
      (xhr: ProgressEvent) => {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
      },
      (error: Error) => {
        console.log('An error happened');
      });
  }


  /**
   * Processes the current image in the viewer, sending its dataURL
   * to the backend and displaying the generated depth map.
   */
  public getCanvasDataURL() {
    const imageurl = encodeURIComponent(
      OBJViewer.renderer.domElement.toDataURL());
    return imageurl;
  }
}
