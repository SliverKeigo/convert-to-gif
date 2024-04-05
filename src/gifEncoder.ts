// @ts-ignore
import gifshot from 'gifshot'

export const createGIF = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const imageData = reader.result as string;
      gifshot.createGIF(
        {
          gifWidth: 240,
          gifHeight: 240,
          images: [imageData],
          frameDuration: 1,
          transparent: true,
        },
        (obj:any) => {
          if (!obj.error) {
            const gifData = obj.image;
            resolve(gifData);
          } else {
            reject(obj.errorCode);
          }
        }
      );
    };
    reader.readAsDataURL(file);
  });
};