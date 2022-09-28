import Register from './PlatformRegister';
import JourneyWebService from './JourneyWebService';
import Success from './Success';
import PlatformLogin from './PlatformLogin';
import Homepage from './Homepage';
import AMLogin from './AMLogin';
import IDMRegister from './IDMRegister';
import StageWebService from './StageWebService';
import PageNotFound from './PageNotFound';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import TreeWebService from './TreeWebService';

function App() {
  return (
    <Router>
      <main className="App">
        <Routes>
          <Route path="/journeywebservice" element={<JourneyWebService />} />
          <Route path="/platformregister" element={<Register />} />    
          <Route path="/success" element={<Success />} />
          <Route path="/platformlogin" element={<PlatformLogin />} />
          <Route path="/" element={<Homepage />} />
          <Route path="/amlogin" element={<AMLogin />} />
          <Route path="/idmregister" element={<IDMRegister />} />
          <Route path="/idmwebservice/" element={<StageWebService />} />
          <Route path="/treewebservice" element={<TreeWebService />} />
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </main>
    </Router>
      
  );
}

export default App;
