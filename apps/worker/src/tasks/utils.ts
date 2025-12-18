import sharp from "sharp";

export const removeWhiteBackground = async (
  imageBuffer: Buffer,
): Promise<Buffer> => {
  const { data, info } = await sharp(imageBuffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const threshold = 230;
  const pixels = new Uint8Array(data);
  const { width, height } = info;
  const visited = new Uint8Array(width * height);

  const isWhite = (idx: number) => {
    const r = pixels[idx * 4];
    const g = pixels[idx * 4 + 1];
    const b = pixels[idx * 4 + 2];
    return r >= threshold && g >= threshold && b >= threshold;
  };

  const floodFill = (startX: number, startY: number) => {
    const stack: [number, number][] = [[startX, startY]];

    while (stack.length > 0) {
      const item = stack.pop();
      if (!item) continue;
      const [x, y] = item;
      if (x < 0 || x >= width || y < 0 || y >= height) continue;

      const idx = y * width + x;
      if (visited[idx] || !isWhite(idx)) continue;

      visited[idx] = 1;
      pixels[idx * 4 + 3] = 0;

      stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
    }
  };

  for (let x = 0; x < width; x++) {
    floodFill(x, 0);
    floodFill(x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    floodFill(0, y);
    floodFill(width - 1, y);
  }

  return sharp(Buffer.from(pixels), {
    raw: { width, height, channels: 4 },
  })
    .png()
    .toBuffer();
};
