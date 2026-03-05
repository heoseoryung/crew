import React from 'react'; // Vite 안정성을 위해 추가
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';


// 💡 모든 경로를 대문자 + 확장자(.jsx) 명시로 통일했어!
import FindID from './component/login/FindID.jsx';
import Logins from './component/login/Login.jsx'; 
import ReactDOM from 'react-dom/client';
import NoticeFrame from './component/noticeboard/Frame.jsx';
import AdminPage from './component/admin/Admin.jsx';
import AdminLogin from './component/admin/AdminLogin.jsx';
import Register from './component/login/register.jsx';//고칠때 안먹을때는 직접 치기 경로 특히 대문자소문자 컴포넌트 바꿀때

function App() {
  return (
    <BrowserRouter>
      <div className='mainArea'>
        <Routes>
          {/* 컴포넌트 이름(Logins, Register 등)은 유지했으니 안심해! */}
          <Route path='/login' element={<Logins />} />
          <Route path='/register' element={<Register />} />
          <Route path='/findid' element={<FindID />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path='*' element={<NoticeFrame />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;