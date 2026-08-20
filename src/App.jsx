import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./login/login";
import Signup from "./signup/signup";
import Home from "./home/home";
import Account from "./account/account";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/home" element={<Home />} />
        <Route path="/account" element={<Account />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
