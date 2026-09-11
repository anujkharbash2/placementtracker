import {BrowserRouter, Routes, Route} from 'react-router-dom';
import Student from './dashboards/Student';
import Recruiter from './dashboards/Recruiter';
import Admin from './dashboards/Admin';
import Login from "./Login";


function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/student" element={<Student />} />
          <Route path="/recruiter" element={<Recruiter />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/" element={<Login />} />
        </Routes>
      </BrowserRouter>

    </div>
  )
}

export default App;