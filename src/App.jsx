import { Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import FileUpload from './components/FileUpload';
import StudentJoin from './components/StudentJoin';

import QuizPlayer from './components/QuizPlayer';
import PhaserGameLauncher from './components/PhaserGameLauncher';
import TeacherLogin from './components/TeacherLogin';
import Register from './components/Register';
import TeacherDashboard from './components/TeacherDashboard';
import QuestionEditor from './components/QuestionEditor';

function App() {
  return (
    <div className="App">
      <Routes>
        {/* Home Page */}
        <Route path="/" element={<HomePage />} />
        
        {/* Teacher Routes */}
        <Route path="/teacher/login" element={<TeacherLogin />} />
        <Route path="/teacher/register" element={<Register />} />
        <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
        <Route path="/admin" element={<FileUpload />} />
        <Route path="/create-manual" element={<QuestionEditor />} />
        
        {/* Student Routes */}
        <Route path="/join" element={<StudentJoin />} />
        <Route path="/student/join" element={<StudentJoin />} />
        
        {/* Game Routes */}
        <Route path="/game/:roomCode" element={<PhaserGameLauncher />} />
        <Route path="/play/:roomCode" element={<PhaserGameLauncher />} />
        <Route path="/quiz/:roomCode" element={<PhaserGameLauncher />} />
      </Routes>
    </div>
  );
}

export default App;

