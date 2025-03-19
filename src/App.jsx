import React, { useState } from "react";
import JSZip from "jszip";
import { saveAs } from "file-saver";
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

  const downloadAllImages = () => {
    const zip = new JSZip();
    processedImages.forEach((image, index) => {
      zip.file(`sharpened_image_${index + 1}.png`, image.split(',')[1], { base64: true });
    });
    
    zip.generateAsync({ type: "blob" }).then((content) => {
      console.log("aaaa")
      saveAs(content, "Images.zip");
    });
  }

  return (
    <div className="flex flex-col items-center gap-4 p-4 bg-[#111] text-white h-screen overflow-scroll">
    <div className="flex w-full justify-between px-24">

    <h1 className=" text-3xl font-bold">Welcome to Sharpnator3000</h1>
     <label className="bg-purple-500 hover:bg-purple-600 active:bg-purple-700 text-white p-2 rounded cursor-pointer">
      Choose Images
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={handleImageUpload}
        className="hidden"
      />
    </label>
    </div>
    {images.length > 0  &&
    <>
    <div className="flex gap-4 items-center">
      <button onClick={sharpenImages} className="px-4 py-2 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white rounded">Sharpen Images</button>
      <input
        type="range"
        min="1"
        max="100"
        value={pow * 10}
        onChange={(e) => setSharpness(parseInt(e.target.value) * 0.1)}
        />
        <span>Sharpness: {Math.round(pow * 10)  }</span>
      </div>
      <h1>Original</h1>
        </>
       }
      <div className="flex flex-wrap justify-center gap-4">
        {images.map((image, index) => (
          <img key={index} src={image} alt={`Uploaded ${index + 1}`} className="w-64 h-fit" />
        ))}
      </div>
        {loading ? 
        <div><h1>Loading...</h1></div>
        :
        <>
        {processedImages.length > 0 && <><h1>Sharpened</h1> <button className="bg-blue-500 hover:bg-blue-600 active:bg-blue-700 p-2 rounded text-white "
           onClick={downloadAllImages}>Download All</button></> } 
        <div className="flex flex-wrap justify-center gap-4">
            {processedImages.map((processedImage, index) => (
            <div key={index} className="flex flex-col items-center">
              <img src={processedImage} alt={`Sharpened ${index + 1}`} className="w-64" />
              <button onClick={() => downloadImage(processedImage, index)} className="px-4 py-2 bg-green-500 hover:bg-green-600 active:bg-green-700 text-white rounded">Download</button>

              
            </div>))}
        </div>  
        </>}

       
      
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