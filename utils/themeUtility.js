export function isColorLight(color) {
  // Create an offscreen canvas for measuring the color brightness
  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  const context = canvas.getContext("2d");
  context.fillStyle = color;
  context.fillRect(0, 0, 1, 1);

  // Get the color data (RGBA) of the filled rectangle
  const [r, g, b] = context.getImageData(0, 0, 1, 1).data;

  // Calculate brightness (luminance)
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;

  // Return true if the color is light, otherwise false
  return brightness > 128;
}