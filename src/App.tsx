import Experience from './three/Experience';
import ScrollController from './three/ScrollController';
import AboutSection from './sections/AboutSection';

function App() {
  return (
    <main className="portfolio">
      <ScrollController />
      <section className="hero">
        <div className="hero-content">
          <p className="hero-label">
            IRPAN AFRIZAL — SOFTWARE DEVELOPER
          </p>

          <h1>
            Building digital
            <span> experiences.</span>
          </h1>

          <p className="hero-description">
            Web Developer • Android Developer • AI &amp; RAG Enthusiast
          </p>

          <button className="hero-button">
            Explore My Universe
          </button>
        </div>

        <Experience />
      </section>

      <AboutSection />
    </main>
  );
}

export default App;