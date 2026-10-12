import Experience from './three/Experience';
import ScrollController from './three/ScrollController';
import SideNav from './components/SideNav';
import Hero from './sections/Hero';
import AboutSection from './sections/AboutSection';
import SkillsSection from './sections/SkillsSection';

function App() {
  return (
    <>
      <SideNav />

      <main className="portfolio">
        {/* Canvas 3D tunggal, fixed di belakang semua section */}
        <Experience />
        <ScrollController />

        <Hero />
        <AboutSection />
        <SkillsSection />
      </main>
    </>
  );
}

export default App;