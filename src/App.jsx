import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./login/login";
import Signup from "./signup/signup";

import Home from "./home/home";
import Account from "./account/account";

import Terms from "./terms/terms";

import PostTask from "./tasks/PostTask";
import MatchingProviders from "./tasks/MatchingProviders";
import CustomerOffers from "./tasks/CustomerOffers";

import ProviderHome from "./provider/ProviderHome";
import ProviderAccount from "./provider/ProviderAccount";
import ProviderJob from "./provider/ProviderJob";

import JobChat from "./Chat/JobChat";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route path="/signup" element={<Signup />} />

        {/* CUSTOMER */}

        <Route path="/home" element={<Home />} />

        <Route path="/account" element={<Account />} />

        <Route path="/post-task" element={<PostTask />} />

        <Route path="/task/:taskId/providers" element={<MatchingProviders />} />

        <Route path="/task/:taskId/offers" element={<CustomerOffers />} />

        {/* PROVIDER */}

        <Route path="/provider" element={<ProviderHome />} />

        <Route path="/provider-account" element={<ProviderAccount />} />

        <Route path="/provider/job/:jobId" element={<ProviderJob />} />

        {/* SHARED CHAT */}

        <Route path="/task/:taskId/chat" element={<JobChat />} />

        {/* TERMS */}

        <Route path="/terms" element={<Terms />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
