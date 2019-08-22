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
