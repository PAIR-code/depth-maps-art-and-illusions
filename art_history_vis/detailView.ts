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
import {Points} from 'three/src/objects/Points.js';


/**
 * This class creates a 3D canvas for viewing impossible object OBJs.
 */
export class DetailView {

  scene: THREE.Scene;
  pointCloudGroup: THREE.Group;
  isHidden: boolean;

  /**
   * The constructor for the Viewer class.
   */
  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.pointCloudGroup = new THREE.Group();
    this.isHidden = true;

    this.initializePointCloud();

  }

  /**
   * Adds the depth image pixel points to the scene.
   */
  public initializePointCloud() {
    const pointsGeometry = this.makePointsGeometry();
    const pointsMaterial = new THREE.PointsMaterial({
      size: 5,
      vertexColors: THREE.VertexColors
    });

    const pointCloud = new Points(pointsGeometry, pointsMaterial);
    this.pointCloudGroup.children = [];
    this.pointCloudGroup.add(pointCloud);
  }


  private makePointsGeometry() {
    const img = document.getElementById('my-image');
    const context = this.getImageContext(img);

    const coloredImg = document.getElementById('my-colored-image');
    const coloredContext = this.getImageContext(coloredImg);


    const pointsGeometry = new THREE.BufferGeometry();

    const positions = [];
    const colors = [];
    const color = new THREE.Color();
    const n = 1000, n2 = n / 2; // particles spread in the cube


    const num_points = 200;
    const widthStep = img.width / num_points;
    const heightStep = img.height / num_points;

    for (let i = 0; i < img.width; i += widthStep) {
      for (let j = 0; j < img.height; j += heightStep) {
        const pixelData = context.getImageData(i, img.height - j, 1, 1).data;
        const coloredPixelData = coloredContext.getImageData(i, img.height - j, 1, 1).data;

        // positions
        const x = i / 5 - 50;
        const y = j / 5 - 90;
        const z = -20 + pixelData[0] / 3;
        positions.push(x, y, z);

        // colors
        const vx = (x / n) + 0.5;
        const vy = (y / n) + 0.5;
        const vz = (z / n) + 0.5;
        color.setRGB(coloredPixelData[0] / 255.0, coloredPixelData[1] / 255.0, coloredPixelData[2] / 255.0);
        colors.push(color.r, color.g, color.b);
      }

    }

    pointsGeometry.addAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    pointsGeometry.addAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    return pointsGeometry;
  }

  private getImageContext(img: Image) {
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;

    const context = canvas.getContext('2d');
    context.drawImage(img, 0, 0, img.width, img.height);

    return context;
  }

  // turn this into interface?
  public show() {
    if (this.isHidden == true) {
      this.scene.add(this.pointCloudGroup);
      this.isHidden = false;
    }
  }

  public hide() {
    if (this.isHidden == false) {
      this.scene.remove(this.pointCloudGroup);
      this.isHidden = true;
    }
  }
}



// <div class="image-container">
// <image id="my-image"
//        src="cat_depth_map.png"
//        class="image"></image>
// </div>

//        const styles = curr_paintings[i].style.split(', ');

// let currColor = DEFAULT_COLORS[i % 3];

// for (let i = 0; i < STYLE_NAMES.length; i++) {
//   if (styles.includes(STYLE_NAMES[i])) {
//     currColor = STYLE_COLORS[i % 14];
//   }
// }

//import * as detailView from './detailView';

/*
const STYLE_COLORS = [0x1dabe6, 0x1c366a, 0xc3ced0, 0xe43034, 0xfc4e51,
  0xaf060f, 0x003f5c, 0x2f4b7c, 0x665191, 0xa05195, 0xd45087, 0xf95d6a,
  0xff7c43, 0xffa600];
const STYLE_NAMES = ['Modern art', 'Baroque', 'Renaissance', 'Romanticism',
  'Realism', 'Dutch Golden Age', 'Impressionism', 'Post-Impressionism',
  'Rococo', 'Contemporary art', 'Neoclassicism', 'Italian Renaissance',
  'Academic art', 'Mannerism', 'Abstract art', 'Symbolism', 'Modernism',
  'Street art', 'Ukiyo-e', 'Expressionism', 'American Impressionism',
  'Northern Renaissance', 'Antwerp school', 'Tonalism', 'Neo-impressionism',
  'Aestheticism', 'Cubism', 'Art Nouveau', 'Surrealism', 'Barbizon school',
  'American Realism', 'Hudson River School',
  'Dutch and Flemish Renaissance painting', 'Venetian school', 'Luminism',
  'High Renaissance', 'Classicism', 'Primitivism', 'Skagen Painters',
  'Hague School', 'Gothic art', 'Abstract expressionism',
  'German Renaissance', 'Ashcan School', 'Color Field', 'Nihonga',
  'Conceptual art', 'Caravaggisti', 'American Renaissance', 'Synthetism',
  'Utrecht Caravaggism', 'Pre-Raphaelite Brotherhood',
  'Amsterdam Impressionism', 'German Expressionism', 'Florentine painting',
  'Naturalism', 'American modernism', 'Spanish Renaissance', 'Social realism',
  'Na\xc3\xafve art', 'Fauvism', 'Sienese School', 'Early renaissance',
  'Vienna Secession', 'Sturm und Drang', 'Harlem Renaissance',
  'Der Blaue Reiter', 'Les Nabis', 'Heidelberg School',
  'Arts and Crafts movement', 'Futurism', 'Folk art', 'School of Paris',
  'Magical Realism', 'Japonism', 'Geometric abstraction',
  'Socialist realism', 'Paduan School', 'Nazarene movement',
  'Bauhaus style', 'Norwich School', 'School of Ferrara', 'Milanese School',
  'Die Br\xc3\xbccke', 'Spanish Eclecticism', 'Photorealism',
  'Neo-expressionism', 'French Renaissance', 'Regionalism',
  'Metaphysical art', "Section d'Or", 'Shin-hanga', 'Neo-romanticism',
  'Constructivism', 'Minimalism', 'Dada', 'Pop art', 'De Stijl',
  'Performance art', 'Bolognese School', 'Washington Color School',
  'School of Fontainebleau', 'Pennsylvania Impressionism',
  'New Objectivity', 'Art Deco', 'Tachisme', 'Op art',
  'Nouveau r\xc3\xa9alisme', 'COBRA', 'Postmodernism', 'Land art', 'Fluxus',
  'Suprematism', 'Public art', 'Hyperrealism', 'Young British Artists',
  'Rayonism', 'Byzantine art', 'Biomorphism', 'Arte Povera'];
*/
