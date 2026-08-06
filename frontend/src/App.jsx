import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home/Home";
import About from "./pages/About/About";
import Features from "./pages/Features/Features";
import HowItWorks from "./pages/HowItWorks/HowItWorks";
import WhoWeServe from "./pages/WhoWeServe/WhoWeServe";
import Contact from "./pages/Contact/Contact";
import Login from "./pages/Login/Login";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route path="/about" element={<About />} />

      <Route path="/features" element={<Features />} />

      <Route path="/how-it-works" element={<HowItWorks />} />

      <Route path="/who-we-serve" element={<WhoWeServe />} />

      <Route path="/contact" element={<Contact />} />

      <Route path="/login" element={<Login />} />
    </Routes>
  );
}

export default App;