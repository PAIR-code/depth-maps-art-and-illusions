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
import {main} from './main';
import {Painting} from './util';

/**
 * Loads art history csv data and initializes the three.js scenes.
 */
d3.csv('paintings.csv').then((data: object) => {
  // Loads csv data into Painting interface objects.
  const paintings = Array<Painting>();
  // Maps painting imageids to Painting objects.
  const idToPainting: {[id: string]: Painting} = {};

  for (let i = 0; i < data.length; i++) {
    const link = data[i]['asset_link']
    const imageid = link.split("/").pop();
    const {asset_link, image, thumbnail, partner_name,
      title, artist_name, year, location, art_movements, Depth,
      range, range_difference, std_difference} = data[i];
    const painting = {
      asset_link: asset_link,
      image: image,
      thumbnail: thumbnail,
      partner_name: partner_name,
      year: year,
      depth: Depth,
      style: art_movements,
      imageid: imageid,
      title: title,
      artist_name: artist_name,
      location: location,
      art_movements: art_movements,
      range: range,
      range_difference: range_difference,
      std_difference: std_difference
    }
    paintings.push(painting);
    idToPainting[imageid] = painting;

  }
  main(paintings, idToPainting);
});
