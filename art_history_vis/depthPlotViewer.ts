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
import {DepthPlot} from './depthPlot';
import {Viewer} from './viewer';
import {Painting} from './util';
import {Color} from 'three';

const SELECTED_COLOR = 0x000000;

const mouse = new THREE.Vector2();
window.addEventListener('mousemove', (event: any) => {
  // Calculates mouse position in normalized device coordinates.
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
}, false);


/**
 * This class sets up the three.js scene and instantiates the depth plot.
 */
export class DepthPlotViewer extends Viewer {

  depthPlot: DepthPlot;
  raycaster: THREE.Raycaster;
  currSelected: THREE.Mesh;
  storedColor: Color;

  /**
   * The constructor for the DepthPlotViewer class.
   * @param paintings an Array of Painting objects.
   */
  constructor(paintings: Array<Painting>, canvasid: string, width: number, height: number) {
    super(canvasid, width, height);

    this.depthPlot = new DepthPlot(this.scene,
      paintings);
    this.currSelected = null;
    this.storedColor = new THREE.Color();
    this.raycaster = new THREE.Raycaster();

    this.animate();
  }

  /**
   * This method is called to update the canvas at each frame.
   */
  public animate() {
    requestAnimationFrame(() => this.animate());

    this.renderer.render(this.scene, this.camera);
  }

  /**
   * This method updates the selected painting.
   */
  public updateSelected(): Painting {
    if (this.currSelected != null) {
      this.depthPlot.updateBlock(this.currSelected, this.storedColor, false);
      this.currSelected = null;
    }

    // update the picking ray with the camera and mouse position
    this.raycaster.setFromCamera(mouse, this.camera);
    // calculate objects intersecting the picking ray
    var intersects = this.raycaster.intersectObjects(this.scene.children, true);

    if (intersects.length > 0) {
      this.currSelected = intersects[0].object as THREE.Mesh;

      this.storedColor.copy(this.currSelected.material.color);
      this.depthPlot.updateBlock(this.currSelected,
        new THREE.Color(SELECTED_COLOR), true)

      const uuid = this.currSelected.uuid;
      const currPainting = this.depthPlot.blockToPainting[uuid] as Painting);
      return currPainting;
    }
    return null;
  }
}
