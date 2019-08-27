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

// Constants
const SELECTED_COLOR = 0xFF1493;


// Calculates mouse position in normalized device coordinates for RayCasting.
const mouse = new THREE.Vector2();
window.addEventListener('mousemove', (event: any) => {
  const depthContainer = document.getElementById('outer-container');
  mouse.x = (event.clientX / depthContainer.clientWidth) * 2 - 1;
  mouse.y = - ((event.clientY - 425) /
    depthContainer.clientHeight) * 2 + 1;
}, false);


/**
 * This class extends Viewer, which creates a three.js scene. It sets up the
 * DepthPlot three.js scene.
 */
export class DepthPlotViewer extends Viewer {
  public depthPlot: DepthPlot;
  private raycaster: THREE.Raycaster = new THREE.Raycaster();
  private currSelected: THREE.Mesh = null;
  private storedColor: Color = new THREE.Color();

  /**
   * The constructor for the DepthPlotViewer class.
   * @param paintings an Array of Painting objects.
   * @param canvas the HTMLCanvasElement for rendering the three.js scene
   * @param width the width of the viewer.
   * @param height the height of the viewer.
   * @param enableRotate whether the viewer should allow rotation.
   */
  constructor(paintings: Array<Painting>, canvas: HTMLCanvasElement,
    width: number, height: number, enableRotate: boolean) {
    super(canvas, width, height, enableRotate);
    this.depthPlot = new DepthPlot(this.scene,
      paintings);

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
   * This method updates the selected painting's color and opacity.
   */
  public updateSelected() {
    if (this.currSelected != null) {
      this.depthPlot.updateBlock(this.currSelected, this.storedColor, false);
      this.currSelected = null;
    }
    // Update the picking ray with the camera and mouse position.
    this.raycaster.setFromCamera(mouse, this.camera);

    // Calculate objects intersecting the picking ray.
    const intersects = this.raycaster.intersectObjects(this.scene.children, true);

    if (intersects.length > 0) {
      const intersection = intersects[0].object as THREE.Mesh;
      if (intersection.uuid in this.depthPlot.blockToPainting) {
        // Store the selected block's color before updating its appearance.
        this.currSelected = intersection;
        this.storedColor.copy(this.currSelected.material.color);

        this.depthPlot.updateBlock(this.currSelected,
          new THREE.Color(SELECTED_COLOR), true);
      }
    }
  }

  /**
   * This method gets the painting object of the selected block.
   *
   * @return the selected Painting.
   */
  public getSelectedPainting(): Painting {
    if (this.currSelected != null) {
      return this.depthPlot.getPainting(this.currSelected.uuid);
    }
    return null;
  }
}
