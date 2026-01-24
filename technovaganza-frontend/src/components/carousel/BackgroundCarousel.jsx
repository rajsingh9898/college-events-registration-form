import React from "react";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";

const BackgroundCarousel = () => {
  const images = [
    "img0.jpg",
    "img1.jpeg",
    "img2.jpeg",
    "img3.jpeg",
    "img4.jpeg",
    "img5.jpeg",
    "img6.jpeg",
    "img7.jpeg",
    "img8.jpeg",
    "img9.jpeg",
    "img10.jpeg",

   
  ];

  return (
    <div className="absolute inset-0 -z-10">
      <Carousel
        autoPlay
        infiniteLoop
        showThumbs={false}
        showIndicators={false}
        showStatus={false}
        interval={2500}
        transitionTime={1500}
        swipeable={false}
        emulateTouch={false}
      >
        {images.map((src, i) => (
          <div key={i}>
            <img
              src={src}
              alt={`Background ${i + 1}`}
              className="h-screen w-full object-cover brightness-50"
            />
          </div>
        ))}
      </Carousel>
    </div>
  );
};

export default BackgroundCarousel;
