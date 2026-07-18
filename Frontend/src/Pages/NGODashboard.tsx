import React, { useState } from 'react';
import UserDashboard from './UserDashBoard';
import { useAuth } from '@/context/AuthContext';
import { AlertCircle } from 'lucide-react'; 
import { Button } from '@/components/ui/button';
import axios from 'axios';

import { 
    LayoutDashboard,
    ListChecks,
    HandPlatter,
    Star,
} from "lucide-react";


const NGODashboard: React.FC = () => {
    const {user, fetchUserData} = useAuth();
    const [isVerifying, setIsVerifying] = useState(false);
    console.log(user);

    const handleVerifyNgo = async () => {
      setIsVerifying(true);
      try {
        await axios.get(`${import.meta.env.VITE_Backend_URL}/api/ngos/approve/${user?._id}`);
        await fetchUserData();
      } catch (err) {
        console.error("Self approval failed:", err);
      } finally {
        setIsVerifying(false);
      }
    };

    const NGO = {
        navMenu: [
            {
                name: "Dashboard",
                url: "/user/NGO",
                icon: LayoutDashboard, 
            },
            { 
                name: "Listings", 
                url: "/user/NGO/listings", 
                icon: ListChecks,
            },
            {
                title: "Donations",
                url: "#",
                icon: HandPlatter,
                isActive: false,
                items:[
                    {
                        title:"Track Donations",
                        url:'/user/NGO/trackdonations'
                    },
                    {
                        title:"Donation History",
                        url:'/user/NGO/donationHistory'
                    },
                ],
                
            },
            {
                name: "Near Recycling Partners",
                url: "/user/ngo/allDonor",
                icon: Star,
            },
            {
                name: "Donar",
                url: "/user/ngo/allDonor",
                icon: Star,
            },
        ],
      };

  return (
    <>
      {
        user.isVerified ?
        <UserDashboard data={NGO}/>
        :
        <div className="flex flex-col items-center justify-center min-h-screen">
            <div className=" border shadow-sm rounded-sm  p-4 text-center max-w-md">
                {/* Warning Icon */}
                <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />

                {/* Title */}
                <h1 className="text-2xl font-bold text-gray-800 mb-2">
                    Account Not Verified
                </h1>

                {/* Description */}
                <p className="text-gray-600 mb-6">
                Your NGO account is currently not verified. Please contact support or request verification to access the dashboard.
                </p>

                {/* Action Buttons */}
                <div className="flex gap-4 justify-center">
                  <Button
                    onClick={handleVerifyNgo}
                    disabled={isVerifying}
                    className="bg-primary hover:bg-primary/95 text-white font-semibold shadow-glow animate-pulse"
                  >
                    {isVerifying ? "Verifying..." : "Verify NGO (Demo Mode)"}
                  </Button>
                </div>
            </div>
        </div>
      }
    </>
  )
}

export default NGODashboard;