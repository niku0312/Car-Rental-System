import React from "react";
import Hero from "../components/Hero";
import FeaturedSection from "../components/FeaturedSection";
import Banner from "../components/Banner";
import Testiomonial from "../components/Testimonial";
import NewsLetter from "../components/NewsLetter";

const Home = () =>{
  return(
    <>
      <Hero/>
      <FeaturedSection/>
      <Banner/>
      <Testiomonial/>
      <NewsLetter/>
    </>
  )
}

export default Home;