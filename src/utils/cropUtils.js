// src/utils/cropUtils.js

/**
 * 将给定图片按指定的像素裁剪区域和旋转角度，返回新的 data URL。
 * 
 * @param {string} imageSrc - 原始图片的 Data URL 或 URL。
 * @param {{ x: number, y: number, width: number, height: number }} pixelCrop - 裁剪区域的像素信息。
 * @param {number} [rotation=0] - 顺时针旋转角度，单位为度。
 * @returns {Promise<string>} - 处理后图片的 Data URL。
 */
export async function getCroppedImg(imageSrc, pixelCrop, rotation = 0) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  // 设置画布为裁剪区域的尺寸
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  // 平移到画布中心后旋转
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((rotation * Math.PI) / 180);

  // 将原图绘制到画布上
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    -pixelCrop.width / 2,
    -pixelCrop.height / 2,
    pixelCrop.width,
    pixelCrop.height
  );

  // 返回 JPEG 格式的 Data URL
  return canvas.toDataURL('image/jpeg');
}

/**
 * 创建一个 Image 实例并加载 URL。
 * @param {string} url - 图片 URL 或 Data URL。
 * @returns {Promise<HTMLImageElement>}
 */
function createImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = url;
  });
}
