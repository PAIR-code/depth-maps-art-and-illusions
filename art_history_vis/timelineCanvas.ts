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



const mouse = new THREE.Vector2();
function onMouseMove(event: any) {
  // calculate mouse position in normalized device coordinates
  // (-1 to +1) for both components
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
}

window.addEventListener('mousemove', onMouseMove, false);

/**
 * This class sets up the three.js scene and instantiates the timeline.
 */
export class TimelineCanvas {

  static renderer: THREE.WebGLRenderer;
  static camera: THREE.PerspectiveCamera;
  static scene: THREE.Scene;
  static timeline: timeline.Timeline;
  static detailView: detailView.DetailView;


  static raycaster: THREE.Raycaster;

  static currSelected: object;
  static storedColor: object; // change
  sceneWidth: number;
  sceneHeight: number;

  /**
   * The constructor for the TimelineCanvas class.
   * @param paintings an Array of Painting objects.
   */
  constructor(paintings: Array<timeline.Painting>, canvasid: string, canvas_type: string) {
    this.initializeCanvas(canvasid);
    this.initializeOrbitControls();
    this.addLights();

    // change this!
    if (canvas_type == "timeline") {
      TimelineCanvas.timeline = new timeline.Timeline(TimelineCanvas.scene,
        paintings);
    }
    // else if (canvas_type == "detailView") {
    //   TimelineCanvas.detailView = new detailView.DetailView(TimelineCanvas.scene);
    //   TimelineCanvas.detailView.show();
    // }
    TimelineCanvas.currSelected = null;

    TimelineCanvas.raycaster = new THREE.Raycaster();


    TimelineCanvas.animate();
  }

  public getCamera(): THREE.PerspectiveCamera {
    return TimelineCanvas.camera;
  }

  public getRenderer(): THREE.WebGLRenderer {
    return TimelineCanvas.renderer;
  }

  /**
   * Initializes the main THREE.js components of the visualizer:
   * the renderer, camera, and scene.
   */
  private initializeCanvas(canvasid: string) {
    // Initialize renderer.
    const canvas = document.getElementById(canvasid);
    TimelineCanvas.renderer = new THREE.WebGLRenderer({canvas});
    // TimelineCanvas.renderer.setPixelRatio(window.devicePixelRatio);
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
    // update the picking ray with the camera and mouse position
    TimelineCanvas.raycaster.setFromCamera(mouse, TimelineCanvas.camera);

    // calculate objects intersecting the picking ray
    var intersects = TimelineCanvas.raycaster.intersectObjects(TimelineCanvas.scene.children, true);

    if (intersects.length > 0) {
      // console.log(TimelineCanvas.storedColor);

      // if (TimelineCanvas.currSelected != null) {
      //   TimelineCanvas.currSelected.material.color.set(TimelineCanvas.storedColor);
      // }
      TimelineCanvas.currSelected = intersects[0].object;
      // TimelineCanvas.storedColor = TimelineCanvas.currSelected.material.color;
      // TimelineCanvas.currSelected.material.color.set(0xff0000);
    } else {
      if (TimelineCanvas.currSelected != null) {
        // TimelineCanvas.currSelected.material.color.set(TimelineCanvas.storedColor);
        TimelineCanvas.currSelected = null;
      }
    }
    // console.log(intersects);
    // for (var i = 0; i < intersects.length; i++) {
    // intersects[i].object.material.color.set(0xff0000);
    // }


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

  public updateSelected(): timeline.Painting {
    // var intersects = TimelineCanvas.raycaster.intersectObjects(TimelineCanvas.scene.children, true);
    // if (intersects.length > 0) {
    if (TimelineCanvas.currSelected != null) {
      // TimelineCanvas.currSelected = intersects[0].object;
      const uuid = TimelineCanvas.currSelected.uuid;

      const currPainting = TimelineCanvas.timeline.blockToPainting[uuid] as timeline.Painting);

      TimelineCanvas.currSelected.material.color.set(0xff0000);

      return currPainting;
    }
    return null;
  }
}
