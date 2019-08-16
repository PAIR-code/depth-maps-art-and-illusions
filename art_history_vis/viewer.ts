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
import {OrbitControls} from 'three-orbitcontrols-ts';
import {Points} from 'three/src/objects/Points.js';


// Constants
const BACKGROUND_COLOR = 0x222222;
const LIGHT_COLOR = 0xffffff;
const CAMERA_FOV = 27;
const CAMERA_NEAR = 5;
const CAMERA_FAR = 3500;
const CAMERA_POS_Y = 0.3;
const CAMERA_POS_Z = 3;
const CAMERA_FOCAL_LENGTH = 60;
const LIGHT_INTENSITY = 1;
const LIGHT_DISTANCE = 200;
const LIGHT_POS_X = 4;
const LIGHT_POS_Y = 5;
const LIGHT_POS_Z = 3;

const BLOCK_WIDTH = 1;

/**
* This class creates a 3D canvas for viewing impossible object OBJs.
*/
interface Painting {
  year: number;
  depth: number;
}

/**
 * This class creates a 3D canvas for viewing impossible object OBJs.
 */
export class Viewer {

  static renderer: THREE.WebGLRenderer;
  static camera: THREE.PerspectiveCamera;
  static scene: THREE.Scene;


  /**
   * The constructor for the Viewer class.
   */
  constructor() {
    this.initializeCanvas();
    Viewer.animate();
  }

  /**
   * Initializes the main THREE.js components of the visualizer:
   * the renderer, camera, and scene.
   */
  private initializeCanvas() {
    const canvas = document.getElementById("canvas-container");

    // Initialize renderer.
    Viewer.renderer = new THREE.WebGLRenderer({canvas});
    Viewer.renderer.setSize(window.innerWidth,
      window.innerHeight);


    // Initialize camera.
    Viewer.camera = new THREE.PerspectiveCamera(
      CAMERA_FOV, window.innerWidth / window.innerHeight,
      CAMERA_NEAR, CAMERA_FAR);
    Viewer.camera.position.y = CAMERA_POS_Y;
    Viewer.camera.position.z = CAMERA_POS_Z;
    Viewer.camera.setFocalLength(CAMERA_FOCAL_LENGTH);

    // Initialize orbit controls.
    let controls = new OrbitControls(
      Viewer.camera, Viewer.renderer.domElement);
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

    // Initialize scene.
    Viewer.scene = new THREE.Scene();
    Viewer.scene.background = new THREE.Color(BACKGROUND_COLOR);
    this.addLightsAndGeometry();
  }


  /**
   * This method is called to update the canvas at each frame.
   */
  public static animate() {
    requestAnimationFrame(Viewer.animate);
    Viewer.renderer.render(Viewer.scene,
      Viewer.camera);
  }

  /**
   * Adds the depth image pixel points to the scene.
   */
  private addPixelGeometry() {
    const img = document.getElementById('my-image');
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;

    const context = canvas.getContext('2d');
    context.drawImage(img, 0, 0, img.width, img.height);


    //This will add a starfield to the background of a scene
    const pointsGeometry = new THREE.BufferGeometry();

    const positions = [];
    const colors = [];
    const color = new THREE.Color();
    const n = 1000, n2 = n / 2; // particles spread in the cube


    const num_points = 400;
    const widthStep = img.width / num_points;
    const heightStep = img.height / num_points;
    for (let i = 0; i < img.width; i += widthStep) {
      for (let j = 0; j < img.height; j += heightStep) {
        const pixelData = context.getImageData(i, img.height - j, 1, 1).data;

        // positions
        const x = i / 5 - 50;
        const y = j / 5 - 90;
        const z = -20 + pixelData[0] / 3;
        positions.push(x, y, z);

        // colors
        const vx = (x / n) + 0.5;
        const vy = (y / n) + 0.5;
        const vz = (z / n) + 0.5;
        color.setRGB(pixelData[0] / 255.0, pixelData[1] / 255.0, pixelData[2] / 255.0);
        colors.push(color.r, color.g, color.b);
      }

    }

    pointsGeometry.addAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    pointsGeometry.addAttribute('color', new THREE.Float32BufferAttribute(colors, 3));


    var pointsMaterial = new THREE.PointsMaterial({size: 15, vertexColors: THREE.VertexColors});

    var pointCloud = new Points(pointsGeometry, pointsMaterial);

    Viewer.scene.add(pointCloud);

  }



  private makeGraph(paintings: Array<Painting>) {
    console.log(paintings);

    // var geometry = new THREE.BufferGeometry();
    // // create a simple square shape. We duplicate the top left and bottom right
    // // vertices because each vertex needs to appear once per triangle.
    // var vertices = new Float32Array([
    //   -1.0, -1.0, 1.0,
    //   1.0, -1.0, 1.0,
    //   1.0, 1.0, 1.0,

    //   1.0, 1.0, 1.0,
    //   -1.0, 1.0, 1.0,
    //   -1.0, -1.0, 1.0
    // ]);

    // // itemSize = 3 because there are 3 values (components) per vertex
    // geometry.addAttribute('position', new THREE.BufferAttribute(vertices, 3));
    // var material = new THREE.MeshBasicMaterial({color: 0xff0000});
    // var mesh = new THREE.Mesh(geometry, material);
    // Viewer.scene.add(mesh)
    const startYear = 1000;
    const endYear = 2010;
    const offset = (endYear - startYear) / 2.0;

    let colors = [0x00ff00, 0x0000ff, 0xff0000];
    for (let i = 0; i < paintings.length; i++) {
      const width = BLOCK_WIDTH
      const height = BLOCK_WIDTH;
      const depth = BLOCK_WIDTH * paintings[i].depth / 1000.0;

      const geometry = new THREE.BoxBufferGeometry(width, height, depth);
      const deltaX = i - paintings.length / 2.0;
      const deltaZ = - depth / 2.0;
      // geometry.rotateX(Math.PI / 2.0);
      geometry.translate(deltaX, 0, deltaZ);
      var material = new THREE.MeshLambertMaterial({color: colors[i % 3]});
      var cube = new THREE.Mesh(geometry, material);
      Viewer.scene.add(cube);
    }
  }

  /**
   * Adds lights and geometry to the scene.
   */
  private addLightsAndGeometry() {
    // this.addPixelGeometry();
    let paintings = new Array<Painting>();
    paintings.push({year: 1050, depth: 2000});
    paintings.push({year: 1823, depth: 7000});
    paintings.push({year: 2001, depth: 4000});
    paintings.push({year: 1050, depth: 2000});
    paintings.push({year: 1823, depth: 7000});
    paintings.push({year: 2001, depth: 4000});
    paintings.push({year: 1050, depth: 2000});
    paintings.push({year: 1823, depth: 7000});
    paintings.push({year: 2001, depth: 4000});

    this.makeGraph(paintings);



    var light = new THREE.PointLight(LIGHT_COLOR, LIGHT_INTENSITY,
      LIGHT_DISTANCE);
    light.position.set(LIGHT_POS_X, LIGHT_POS_Y, LIGHT_POS_Z);
    Viewer.scene.add(light);
  }
}


