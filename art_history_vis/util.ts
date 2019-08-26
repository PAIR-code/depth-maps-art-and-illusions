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

// Constants
const ART_STYLE_COLOR_MAP = {
  'Baroque': 0x1c366a,
  'Renaissance': 0xc3ced0,
  'Romanticism': 0xe43034,
  'Realism': 0xfc4e51,
  'Dutch Golden Age': 0xaf060f,
  'Impressionism': 0x003f5c,
  'Post-Impressionism': 0x2f4b7c,
  'Rococo': 0x665191,
  'Contemporary art': 0xa05195,
  'Neoclassicism': 0xd45087,
  'Italian Renaissance': 0xf95d6a,
  'Academic art': 0xff7c43,
  'Mannerism': 0xffa600,
  'Abstract art': 0x1dabe6
}

/**
* Represents a single painting from the GAC dataset.
*/
export interface Painting {
  imageid: string;
  image: string,
  partner_name: string;
  thumbnail: string;
  title: string;
  artist_name: string;
  location: string;
  art_movements: string;
  year: number;
  depth: number;
  style: string;
  range: number;
  std_difference: number;
  range_difference: number;
  asset_link: string;
}

/**
 * Gets the context of an image DOM element.
 * @param image: the Image DOM element.
 */
export function getImageContext(image: Image) {
  const canvas = document.createElement('canvas');
  canvas.width = image.width * 2;
  canvas.height = image.height * 2;

  const context = canvas.getContext('2d');
  context.drawImage(image, 0, 0, image.width * 2, image.height * 2);

  return context;
}

/**
 * Gets the pixel data at a given x and y position of a canvas.
 * @param context the CanvasRenderingContext2D of the image canvas.
 * @param x a number that is the x position of the pixel.
 * @param y a number that is the y position of the pixel.
 * @returns the ImageData object with RGB information for the pixel.
 */
export function getPixelDataFromContext(context: CanvasRenderingContext2D,
  x: number, y: number) {
  return context.getImageData(x, y, 1, 1).data;
}

/**
   * Gets the color value for a given style.
   * @param style the string with the name of the style.
   */
export function getStyleColor(style: string) {
  if (style in ART_STYLE_COLOR_MAP) {
    return ART_STYLE_COLOR_MAP[style];
  }
  return null;
}
