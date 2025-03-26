import './App.css';
import PhotoUploader from './components/PhotoUploader';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Photo Upscaler</h1>
      </header>
      <main>
        <PhotoUploader />
      </main>
    </div>
  );
}

export default App;
