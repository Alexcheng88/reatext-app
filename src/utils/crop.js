// src/utils/crop.js
export async function getCroppedImg(imageSrc, pixelCrop, rotation = 0) {
  const image = await new Promise((res, rej) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageSrc;
    img.onload = () => res(img);
    img.onerror = () => rej(new Error('加载图片失败'));
  });

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  const radians = rotation * Math.PI / 180;
  // 计算旋转后画布大小
  const bBoxW = Math.abs(Math.cos(radians) * image.width) + Math.abs(Math.sin(radians) * image.height);
  const bBoxH = Math.abs(Math.sin(radians) * image.width) + Math.abs(Math.cos(radians) * image.height);

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.translate(canvas.width/2, canvas.height/2);
  ctx.rotate(radians);
  ctx.translate(-image.width/2 - pixelCrop.x, -image.height/2 - pixelCrop.y);

  ctx.drawImage(image, 0, 0);

  return canvas.toDataURL('image/jpeg');
}
