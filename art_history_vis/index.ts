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

import * as d3 from 'd3';
import * as timelineCanvas from './timelineCanvas';
import * as timeline from './timeline';


/**
 * Loads art history csv data and initializes the timeline scene.
 */
d3.csv('ellen_depth_test.csv').then(function (data: object) {
  const paintings = Array<timeline.Painting>();

  for (let i = 0; i < data.length; i++) {
    const painting = {
      year: data[i]['year'],
      depth: data[i]['Depth'],
      style: data[i]['art_movements']
    };
    paintings.push(painting);
  }

  new timelineCanvas.TimelineCanvas(paintings);
});
