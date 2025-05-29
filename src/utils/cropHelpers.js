// src/utils/cropHelpers.js
export async function getCroppedImg(imageSrc, pixelCrop, rotation = 0) {
  const createImage = (url) =>
    new Promise((res, rej) => {
      const img = new Image();
      img.setAttribute('crossOrigin', 'anonymous');
      img.onload = () => res(img);
      img.onerror = (e) => rej(e);
      img.src = url;
    });

  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  const radians = rotation * Math.PI / 180;
  const { width: bBoxWidth, height: bBoxHeight } = {
    width: Math.abs(Math.cos(radians) * image.width) + Math.abs(Math.sin(radians) * image.height),
    height: Math.abs(Math.sin(radians) * image.width) + Math.abs(Math.cos(radians) * image.height),
  };

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  // 平移到中心，旋转，再平移回来
  ctx.translate(-pixelCrop.x, -pixelCrop.y);
  ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
  ctx.rotate(radians);
  ctx.translate(-image.width / 2, -image.height / 2);

  ctx.drawImage(image, 0, 0);

  return canvas.toDataURL('image/jpeg');
}
