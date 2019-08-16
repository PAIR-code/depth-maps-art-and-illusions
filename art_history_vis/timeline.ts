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

// Constants
const BLOCK_WIDTH = 0.3;
const PAINTING_COLORS = [0xB165D4, 0xB165D4, 0xB165D4];
const PAINTING_OPACITY = 0.5;
const GRAPH_START_YEAR = 1000;
const GRAPH_END_YEAR = 2020;
const MAX_PAINTINGS_PER_YEAR = 20;
const DEPTH_SCALE_FACTOR = 0.02;
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

// const STYLE_NAMES = ['Baroque', 'Renaissance'];

/**
* Represents a single painting from the GAC dataset.
*/
export interface Painting {
  imageid: string;
  partner_name: string;
  title: string;
  artist_name: string;
  location: string;
  art_movements: string;
  year: number;
  depth: number;
  style?: string;
}

/**
 * This class contains the paintings of the art history timeline.
 */
export class Timeline {

  scene: THREE.Scene;
  paintingsGroup: THREE.Group;
  isHidden: boolean;
  paintingsData: Array<Painting>;
  blockToPainting: object;

  /**
   * The constructor for the Viewer class.
   * @param scene the three.js scene the timeline gets added to.
   * @param paintings an Array of Painting objects.
   */
  constructor(scene: THREE.Scene, paintings: Array<Painting>) {
    this.scene = scene;
    this.paintingsGroup = new THREE.Group();
    this.isHidden = false;

    this.blockToPainting = {};


    this.buildGraphVisualization(paintings);
  }

  /**
   * Gets an object containing an Array of paintings for every year that has
   * at least one painting.
   * @param paintings an Array of Painting objects.
   * @returns an object with a list of Paintings at every year.
   */
  private getPaintingsByYear(paintings: Array<Painting>): object {
    const paintingsByYear = {};

    for (let i = 0; i < paintings.length; i++) {
      const currYear = paintings[i].year;
      if (+currYear > 0) {
        if (!(currYear in paintingsByYear)) {
          paintingsByYear[currYear] = [];
        }
        if (paintingsByYear[currYear].length < MAX_PAINTINGS_PER_YEAR
          // && paintings[i].style != ""
        ) {
          paintingsByYear[currYear].push(paintings[i]);
        }
      }
    }

    return paintingsByYear;
  }

  //        const styles = curr_paintings[i].style.split(', ');

  // let currColor = DEFAULT_COLORS[i % 3];

  // for (let i = 0; i < STYLE_NAMES.length; i++) {
  //   if (styles.includes(STYLE_NAMES[i])) {
  //     currColor = STYLE_COLORS[i % 14];
  //   }
  // }


  /**
   * Builds the graph visualization from art history painting data.
   * @param paintings an Array of Painting objects.
   */
  private buildGraphVisualization(paintings: Array<Painting>) {
    const offset = (GRAPH_END_YEAR - GRAPH_START_YEAR) / 2.0;
    const paintingsByYear = this.getPaintingsByYear(paintings);

    for (let curr_paintings of Object.values(paintingsByYear)) {
      // if (curr_paintings != undefined) {
      curr_paintings.sort((a, b) => b.depth - a.depth);

      for (let i = 0; i < curr_paintings.length; i++) {
        const currYear = curr_paintings[i].year;
        const styles = curr_paintings[i].style.split(', ');
        if (this.inGraphBounds(currYear)) {
          const geometry = this.makeScatterGeometry(curr_paintings[i], i, offset, currYear);
          let currColor = PAINTING_COLORS[i % PAINTING_COLORS.length];
          for (let i = 0; i < STYLE_NAMES.length; i++) {
            if (styles.includes(STYLE_NAMES[i])) {
              currColor = STYLE_COLORS[i % 14];
            }
          }
          const material = new THREE.MeshLambertMaterial({
            color: currColor,
            opacity: PAINTING_OPACITY,
            transparent: true
          });

          const cube = new THREE.Mesh(geometry, material);
          this.blockToPainting[cube.uuid] = curr_paintings[i];
          this.paintingsGroup.add(cube);
        }
      }
      // }

    }
    this.scene.add(this.paintingsGroup);
  }


  /**
   * Checks whether a year is within the start and end years of the graph.
   * @param year the year to be checked.
   * @returns a boolean that is whether the year is in the graph.
   */
  private inGraphBounds(year: number): boolean {
    return year >= GRAPH_START_YEAR && year <= GRAPH_END_YEAR;
  }

  /**
   * Makes the BoxBufferGeometry for the given painting.
   * @param painting a Painting object to be represented by the mesh.
   * @param index a number that is the index of this painting in its 'year' list.
   * @param offset a number that is the 'x' offset of the timeline geometry.
   * @param year a number that is the year of the painting object.
   * @returns the BoxBufferGeometry of the Painting.
   */
  private makePaintingGeometry(painting: Painting, index: number,
    offset: number, year: number): THREE.BoxBufferGeometry {
    const width = BLOCK_WIDTH;
    const height = BLOCK_WIDTH;
    const depth = BLOCK_WIDTH * painting.depth * DEPTH_SCALE_FACTOR;
    const geometry = new THREE.BoxBufferGeometry(width, height, depth);

    const deltaX = (year - GRAPH_START_YEAR - offset) * BLOCK_WIDTH;
    const deltaY = index * BLOCK_WIDTH;
    const deltaZ = -(depth / 2.0);
    geometry.translate(deltaX, deltaY, deltaZ);

    return geometry;
  }

  private makeScatterGeometry(painting: Painting, index: number,
    offset: number, year: number): THREE.BoxBufferGeometry {
    const width = BLOCK_WIDTH * 2;
    const height = BLOCK_WIDTH * 2;
    const depth = BLOCK_WIDTH * 2;
    const geometry = new THREE.BoxBufferGeometry(width, height, depth);

    const deltaX = (year - GRAPH_START_YEAR - offset) * BLOCK_WIDTH;
    const deltaY = index * BLOCK_WIDTH;
    const deltaZ = -(depth / 2.0) - BLOCK_WIDTH * painting.depth * DEPTH_SCALE_FACTOR;
    geometry.translate(deltaX, deltaY, deltaZ);

    return geometry;
  }

  /**
   * Shows the timeline geometry.
   */
  public show() {
    if (this.isHidden == true) {
      this.scene.add(this.paintingsGroup);
      this.isHidden = false;
    }
  }

  /**
   * Hides the timeline geometry.
   */
  public hide() {
    if (this.isHidden == false) {
      console.log(this.paintingsGroup)
      this.scene.remove(this.paintingsGroup);
      this.isHidden = true;
    }
  }
}
