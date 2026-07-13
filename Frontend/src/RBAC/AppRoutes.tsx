import { Routes, Route } from "react-router-dom";
import ProtectedRoutes from "./ProtectedRoutes";
import ProtectedApp from "./ProtectAPP";

// Public
import LandingPage from "../Pages/LandingPage";
import LoginRegister from "../Pages/LoginRegister";
import Login from "../components/common/LoginForm";
import Register from "../components/common/SignUpForm";
import ForgotPassword from "../components/common/ForgotPassword";

// Dashboard shells
import AdminDashboard from "../Pages/AdminDashboard";
import NGODashboard from "../Pages/NGODashboard";
import DonarDashboard from "../Pages/DonarDashboard";
import VolunteerDashboard from "../Pages/VolunteerDashboard";
import RecyclerDashboard from "../Pages/RecyclerDashboard";

// New shared ReLoop AI impact overview
import ImpactDashboard from "../Dashboard/common/ImpactDashboard";

// Admin
import NgoRegistration from "../Dashboard/Admin/NgoManagementDashboard";
import ActiveUser from "../Dashboard/Admin/UserList";
import DonationManagement from "../Dashboard/Admin/DonationManagement";
import ContentManagement from "../Dashboard/Admin/ContentManagement";
import ReviewAdmin from "../Dashboard/Admin/Reviewadmin";

// Donor (folder still named "Donar" for backward compat with existing files)
import NewDonations from "../Dashboard/Donar/Donations/NewDonations";
import MyDonations from "../Dashboard/Donar/Donations/MyDonations";
import DonationForm from "../Dashboard/Donar/Donations/DonationForm";
import Notification from "../Dashboard/Donar/Notification";
import Reviewdonar from "../Dashboard/Donar/Reviewdonar";
import Donationactivity from "@/Dashboard/Donar/Donations/Donationactivity";

// NGO
import AvailableDonations from "../Dashboard/ngo/AvailableDonations";
import Donations from "../Dashboard/ngo/Donations/MyDonations";
import TrackDonations from "../Dashboard/ngo/Donations/TrackDonations";
import Donor from "@/Dashboard/ngo/Donor";
import Provider from "../Dashboard/ngo/Provider";

// Common
import Profile from "../Dashboard/common/Profile";
import Review from "../Dashboard/ngo/Review";
import Contact from "../Dashboard/common/Contact";

function App() {
  return (
    <Routes>
      <Route element={<ProtectedApp />}>
        <Route index element={<LandingPage />} />

        {/* Auth pages */}
        <Route path="/user" element={<LoginRegister />}>
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<Register />} />
          <Route path="register" element={<Register />} />
          <Route path="forgotPassword" element={<ForgotPassword />} />
        </Route>

        {/* Admin */}
        <Route element={<ProtectedRoutes allowedRoles={["Admin"]} />}>
          <Route path="/user/Admin" element={<AdminDashboard />}>
            <Route index element={<ImpactDashboard />} />
            <Route path="ngomanagement" element={<NgoRegistration />} />
            <Route path="donationmanagement" element={<DonationManagement />} />
            <Route path="userList" element={<ActiveUser />} />
            <Route path="contentManagement" element={<ContentManagement />} />
            <Route path="Reviewadmin" element={<ReviewAdmin />} />
          </Route>
        </Route>

        {/* NGO */}
        <Route element={<ProtectedRoutes allowedRoles={["NGO"]} />}>
          <Route path="/user/NGO" element={<NGODashboard />}>
            <Route index element={<ImpactDashboard />} />
            <Route path="listings" element={<AvailableDonations />} />
            <Route path="trackdonations" element={<TrackDonations />} />
            <Route path="donationhistory" element={<Donations />} />
            <Route path="allDonor" element={<Donor />} />
            <Route path="provider" element={<Provider />} />
            <Route path="id/:userId" element={<Profile />} />
            <Route path="reviews" element={<Review />} />
            <Route path="contact" element={<Contact />} />
          </Route>
        </Route>

        {/* Donor — both new spelling and legacy path work */}
        <Route element={<ProtectedRoutes allowedRoles={["Donor"]} />}>
          <Route path="/user/Donor" element={<DonarDashboard />}>
            <Route index element={<ImpactDashboard />} />
            <Route path="newdonation" element={<NewDonations />} />
            <Route path="mydonations" element={<MyDonations />} />
            <Route path="donationForm" element={<DonationForm />} />
            <Route path="notification" element={<Notification />} />
            <Route path="donationactivity" element={<Donationactivity />} />
            <Route path="id/:userId" element={<Profile />} />
            <Route path="contact" element={<Contact />} />
            <Route path="reviews" element={<Reviewdonar />} />
          </Route>

          {/* Legacy alias */}
          <Route path="/user/Donar" element={<DonarDashboard />}>
            <Route index element={<ImpactDashboard />} />
            <Route path="newdonation" element={<NewDonations />} />
            <Route path="mydonations" element={<MyDonations />} />
            <Route path="donationForm" element={<DonationForm />} />
            <Route path="notification" element={<Notification />} />
            <Route path="donationactivity" element={<Donationactivity />} />
            <Route path="id/:userId" element={<Profile />} />
            <Route path="contact" element={<Contact />} />
            <Route path="reviews" element={<Reviewdonar />} />
          </Route>
        </Route>

        {/* Volunteer */}
        <Route element={<ProtectedRoutes allowedRoles={["Volunteer"]} />}>
          <Route path="/user/Volunteer" element={<VolunteerDashboard />} />
        </Route>

        {/* Recycler */}
        <Route element={<ProtectedRoutes allowedRoles={["Recycler"]} />}>
          <Route path="/user/Recycler" element={<RecyclerDashboard />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
