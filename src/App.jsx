import React, { useState } from "react";

export default function ImageSharpener() {
  const [images, setImages] = useState([]);
  const [processedImages, setProcessedImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pow, setSharpness] = useState(5);

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    const imageUrls = files.map((file) => URL.createObjectURL(file));
    setImages(imageUrls);
  };
  
  const sharpenImages = () => {
    if (!images.length) return;
    
    setLoading(true)

    const sharpenPromises = images.map(image => {
      return new Promise((resolve) => {
        const img = new Image();
        img.src = image;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          const ctx = canvas.getContext("2d");
          ctx.filter = "url(#sharp)";
          ctx.drawImage(img, 0, 0);
          const sharpenedImage = canvas.toDataURL();
          resolve(sharpenedImage);
        };
      });
    });
  
    Promise.all(sharpenPromises).then((processedImages) => {
      setProcessedImages(processedImages);
      setLoading(false);
    });
  };

  const downloadImage = (processedImage, index) => {
    const link = document.createElement("a");
    link.href = processedImage;
    link.download = `sharpened_image_${index + 1}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <input type="file" accept="image/*" multiple onChange={handleImageUpload} />
      <input
        type="range"
        min="1"
        max="100"
        value={pow * 10}
        onChange={(e) => setSharpness(parseInt(e.target.value) * 0.1)}
      />
      <span>Sharpness: {Math.round(pow * 10)  }</span>
      <button onClick={sharpenImages} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 active:bg-blue-600">Sharpen Images</button>
      <div className="flex flex-wrap gap-4">
        {images.map((image, index) => (
          <img key={index} src={image} alt={`Uploaded ${index + 1}`} className="w-64 h-fit" />
        ))}
      </div>
      <div className="flex flex-wrap gap-4">
        {loading ? <div>
          <h1>Loading...</h1></div> : processedImages.map((processedImage, index) => (
          <div key={index} className="flex flex-col items-center">
            <img src={processedImage} alt={`Sharpened ${index + 1}`} className="w-64" />
            <button onClick={() => downloadImage(processedImage, index)} className="px-4 py-2 bg-green-500 text-white rounded">Download</button>
          </div>
        ))}
      </div>  
      <svg width="0" height="0" 
      >
        <filter id="sharp">
          <feConvolveMatrix
          
            kernelMatrix={pow * 1 + ' ' + pow *  1 + ' ' + pow * -1 + ' ' +
              pow * 1 + ' ' + 1 + ' ' + pow * -1 + ' ' +
              pow * 1 + ' ' + pow * -1 + ' ' + pow * -1}

            />
        </filter>
      </svg>
    </div>
  );
}
