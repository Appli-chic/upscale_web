import React, { useState, useRef, useEffect } from 'react';
import './PhotoUploader.css';

function PhotoUploader() {
  const [imageUrl, setImageUrl] = useState('https://www.happybrainscience.com/wp-content/uploads/2017/07/derwent-morning-Cropped.jpg');
  const [uploadedImage, setUploadedImage] = useState(null);
  const [displayImage, setDisplayImage] = useState('');
  const [upscaledImage, setUpscaledImage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [inputMethod, setInputMethod] = useState('file'); // 'file' or 'url'
  const [sliderPosition, setSliderPosition] = useState(50); // Default to middle (50%)
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef(null);
  const sliderRef = useRef(null);
  const containerRef = useRef(null);
  const originalImageRef = useRef(null);
  const upscaledImageRef = useRef(null);

  // Set up the comparison slider when both images are loaded
  useEffect(() => {
    if (displayImage && upscaledImage) {
      // Reset slider position to middle when new images are loaded
      setSliderPosition(50);
    }
  }, [displayImage, upscaledImage]);

  // Handle image load to adjust container height
  const handleImageLoad = (e) => {
    if (containerRef.current && e.target.naturalHeight && e.target.naturalWidth) {
      // Set container height based on image aspect ratio
      const aspectRatio = e.target.naturalWidth / e.target.naturalHeight;
      const containerWidth = containerRef.current.offsetWidth;
      const newHeight = containerWidth / aspectRatio;
      containerRef.current.style.height = `${newHeight}px`;
    }
  };

  // Send image to upscale API
  const upscaleImage = async (imageFile) => {
    try {
      setIsLoading(true);
      setErrorMessage(''); // Clear any existing error message

      const formData = new FormData();
      formData.append('file', imageFile);

      const response = await fetch('http://localhost:5000/upscale', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const blob = await response.blob();
      const upscaledUrl = URL.createObjectURL(blob);
      setUpscaledImage(upscaledUrl);
    } catch (error) {
      console.error('Error upscaling image:', error);
      setErrorMessage('Le serveur fonctionne seulement le vendredi aux heures de travail.');
    } finally {
      setIsLoading(false);
    }
  };

  // Send URL to upscale API
  const upscaleImageUrl = async (url) => {
    try {
      setIsLoading(true);
      setErrorMessage(''); // Clear any existing error message

      const response = await fetch('http://localhost:5000/upscale_url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const blob = await response.blob();
      const upscaledUrl = URL.createObjectURL(blob);
      setUpscaledImage(upscaledUrl);
    } catch (error) {
      console.error('Error upscaling image from URL:', error);
      setErrorMessage('Le serveur fonctionne seulement le vendredi aux heures de travail.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle file upload
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedImage(file);
      setDisplayImage(URL.createObjectURL(file));

      // Send file to upscale API
      upscaleImage(file);
    }
  };

  // Handle URL input
  const handleUrlChange = (e) => {
    setImageUrl(e.target.value);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (inputMethod === 'url' && imageUrl) {
      setDisplayImage(imageUrl);

      // Send URL directly to upscale API
      await upscaleImageUrl(imageUrl);
    }
  };

  // Handle Upload from PC button click
  const handleUploadFromPC = () => {
    // Only trigger file input click if not already in file mode
    if (inputMethod !== 'file') {
      setInputMethod('file');
    }
  };

  // Handle slider movement
  const handleSliderMouseDown = (e) => {
    e.preventDefault();

    const handleMouseMove = (moveEvent) => {
      if (containerRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const newPosition = ((moveEvent.clientX - containerRect.left) / containerRect.width) * 100;

        // Clamp the position between 0 and 100
        const clampedPosition = Math.max(0, Math.min(100, newPosition));
        setSliderPosition(clampedPosition);
      }
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Handle touch events for mobile devices
  const handleSliderTouchStart = (e) => {
    const touch = e.touches[0];

    const handleTouchMove = (moveEvent) => {
      if (containerRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const newPosition = ((moveEvent.touches[0].clientX - containerRect.left) / containerRect.width) * 100;

        // Clamp the position between 0 and 100
        const clampedPosition = Math.max(0, Math.min(100, newPosition));
        setSliderPosition(clampedPosition);
      }
    };

    const handleTouchEnd = () => {
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };

    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);
  };

  return (
    <div className="photo-uploader">
      <div className="input-method-selector">
        <button 
          className={inputMethod === 'file' ? 'active' : ''} 
          onClick={handleUploadFromPC}
        >
          Upload from PC
        </button>
        <button 
          className={inputMethod === 'url' ? 'active' : ''} 
          onClick={() => setInputMethod('url')}
        >
          Use URL
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {inputMethod === 'file' ? (
          <div className="file-input">
            <label htmlFor="file-upload" className="custom-file-upload">
              Choose File
            </label>
            <input 
              id="file-upload" 
              type="file" 
              accept="image/*" 
              onChange={handleFileChange}
              ref={fileInputRef}
            />
            {uploadedImage && <p>Selected file: {uploadedImage.name}</p>}
          </div>
        ) : (
          <div className="url-input">
            <input
              type="text"
              placeholder="Enter image URL"
              value={imageUrl}
              onChange={handleUrlChange}
            />
            <button type="submit">Load Image</button>
          </div>
        )}
      </form>

      {errorMessage && (
        <div className="error-message">
          <p>{errorMessage}</p>
        </div>
      )}

      {isLoading && (
        <div className="loading">
          <div className="loading-animation">
            <div className="photo-icon">
              <div className="photo-icon-frame">
                <div className="photo-icon-inner"></div>
                <div className="photo-icon-mountain"></div>
                <div className="photo-icon-sun"></div>
              </div>
            </div>
          </div>
          <p>Upscaling image... Please wait.</p>
        </div>
      )}

      {displayImage && upscaledImage && !isLoading && (
        <div className="image-comparison-container">
          <h3>Image Comparison</h3>
          <div 
            className="comparison-slider-container" 
            ref={containerRef}
          >
            <div 
              className="upscaled-image-container"
              style={{ width: '100%' }}
            >
              <img 
                src={upscaledImage} 
                alt="Upscaled" 
                ref={upscaledImageRef}
                onLoad={handleImageLoad}
              />
            </div>
            <div 
              className="original-image-container"
              style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`, width: '100%' }}
            >
              <img 
                src={displayImage} 
                alt="Original" 
                ref={originalImageRef}
                onLoad={handleImageLoad}
              />
            </div>
            <div 
              className="slider-handle"
              style={{ left: `${sliderPosition}%` }}
              ref={sliderRef}
              onMouseDown={handleSliderMouseDown}
              onTouchStart={handleSliderTouchStart}
            >
              <div className="slider-line"></div>
              <div className="slider-button"></div>
            </div>
          </div>
          <div className="comparison-labels">
            <span className="original-label">Original</span>
            <span className="upscaled-label">Upscaled</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default PhotoUploader;
