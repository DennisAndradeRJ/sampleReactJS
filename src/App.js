import Register from './Register';
import JourneyWebService from './JourneyWebService';
import Success from './Success';
import Login from './Login';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

function App() {
  return (
    <Router>
      <main className="App">
        <Routes>
          <Route path="/journeywebservice" element={<JourneyWebService />} />
          <Route path="/register" element={<Register />} />    
          <Route path="/success" element={<Success />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </main>
    </Router>
      
  );
}

export default App;
