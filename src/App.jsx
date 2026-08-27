import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./login/login";
import Signup from "./signup/signup";
import Home from "./home/home";
import Account from "./account/account";
import Terms from "./terms/terms";

import PostTask from "./tasks/PostTask";
import MatchingProviders from "./tasks/MatchingProviders";

import ProviderHome from "./provider/ProviderHome";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route path="/signup" element={<Signup />} />

        <Route path="/home" element={<Home />} />

        <Route path="/provider" element={<ProviderHome />} />

        <Route path="/account" element={<Account />} />

        <Route path="/terms" element={<Terms />} />

        <Route path="/post-task" element={<PostTask />} />

        <Route path="/task/:taskId/providers" element={<MatchingProviders />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
