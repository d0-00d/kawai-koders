// client/src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import SignIn from './pages/SignIn';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/signin" element={<SignIn />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
