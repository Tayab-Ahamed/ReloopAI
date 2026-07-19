const Donation = require('../models/Donation');
const User = require('../models/User');
const axios = require('axios');
const Feedback = require('../models/Feedback');
const sendEmail = require('../utils/sendEmail');
const otpVerificationTemplate = require('../helper/OTPVerification');

// const { calculateDistance, calculateMaxDistance, sendEmail, generateNGOEmail } = require("../utils");
const {calculateDistance}= require("../utils/calculateDistance");
const {calculateMaxDistance}= require("../utils/calculateMaxDistance");
const {generateNGOEmail}= require("../utils/generateNgoEmail");

require("dotenv").config();


const getMatchNgos = async (req, res) => {
  try {
    const { donorId } = req.body;
    if (!donorId || !process.env.GOOGLE_MAPS_API_KEY) return res.status(503).json({ error: 'Matching service is not configured' });
    const donor = await Donation.findOne({ _id: donorId, donor: req.user.id }).populate('donor', 'name');
    if (!donor) return res.status(404).json({ error: 'Donation not found' });
    const ngos = await User.find({ role: 'NGO', location: { $exists: true, $ne: '' } }).select('_id name location');
    const geocode = async (address) => {
      const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', { params: { address, key: process.env.GOOGLE_MAPS_API_KEY }, timeout: 8000 });
      const location = response.data?.results?.[0]?.geometry?.location;
      if (!location) throw new Error('Address could not be geocoded');
      return location;
    };
    const donorLocation = await geocode(donor.pickupLocation);
    const now = new Date();
    const maxDistance = calculateMaxDistance(donor.expirationDate, now);
    if (!Number.isFinite(maxDistance) || maxDistance <= 0) return res.json({ matches: [] });
    const matches = (await Promise.all(ngos.map(async (ngo) => {
      try {
        const ngoLocation = await geocode(ngo.location);
        const distance = calculateDistance(donorLocation.lat, donorLocation.lng, ngoLocation.lat, ngoLocation.lng);
        const travelTime = distance / 30;
        const timeDifference = (new Date(donor.expirationDate) - travelTime * 3600000 - now) / 3600000;
        if (distance > maxDistance || timeDifference <= 0) return null;
        const score = 0.6 * Math.max(0, 1 - distance / maxDistance) + 0.4 * Math.max(0, 1 - timeDifference / 168);
        return { id: ngo._id, name: ngo.name, distance, timeDifference, travelTime, score };
      } catch (_error) { return null; }
    }))).filter(Boolean).sort((a, b) => b.score - a.score);
    return res.json({ matches });
  } catch (_error) { return res.status(502).json({ error: 'Matching service is unavailable' }); }
};


const getDonationsUsingStatus = async (req, res) => {

   console.log("Heloooo")

    try {
        const { status } = req.params; // Get status from request parameters
        console.log("status", status);
        // Validate status
        const validStatuses = ['pending', 'accepted', 'delivered'];
        if (!validStatuses.includes(status)) {
          return res.status(400).json({ error: "Invalid status value" });
        }
    
        // Find donations with the given status
        const donations = await Donation.find({ status });
        // console.log("donations in backend", donations);
        res.status(200).json(donations);
    } catch (error) {
        res.status(500).json({ error: "Internal server error", details: 'Request could not be completed' });
      }

}

const getDonationUsingId = async (req, res) => {
  try {
    const { ListId } = req.params;
      
    const donation = await Donation.findById(ListId);
    res.status(200).json({
      success:true,
      message:"Attached the Donation",
      donation
    });
    }
    catch (error) {
      res.status(500).json({
        success:false,
        message: "Internal server error"
      });
    }
}


const getTotalDonations = async (req, res) => {
  try {
    const totalDonations = await Donation.countDocuments({ status: "delivered" });

    res.status(200).json({ totalDonations });
  } catch (error) {
    console.error("Error fetching total donations:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const deliverdDonationsCount = async (req, res) => {
  try{
  const foodCount=await Donation.aggregate([
    {$match:{status:"delivered"}},
    {$group:{_id:null,total:{$sum:"$quantity"}}}
  ]);
  res.status(200).json({ totalDeliveredFood: foodCount[0]?.total || 0 });
}
catch{
  res.status(500).json({ error: "Internal server error" });
}



}


//add on to add dashboard

const getTotalFoodSaved =async (req,res)=>{
  try{
    const totalFoodSaved=await Donation.aggregate([
      { $match: { status: { $in: ["accepted", "delivered"] } } }, // Consider only approved or delivered donations
      { $group: { _id: null, total: { $sum: "$quantity" } } }, // Sum up quantities
    ]);
    console.log("Aggregation Result:", totalFoodSaved);
    res.json({ totalFoodSaved: totalFoodSaved.length > 0 ? totalFoodSaved[0].total : 0 });
  } catch (error) {
    res.status(500).json({ error: "Failed to calculate food saved" });
  }

  }


const getTopDonors=async(req,res)=>{

  try{
  const topDonors = await Donation.aggregate([
    { $match: { status: { $in: ["accepted", "delivered"] } } }, // Filter by status
    { $group: { _id: "$donor", totalDonations: { $sum: "$quantity" } } }, // Group by donor and sum donations
    { $sort: { totalDonations: -1 } }, // Sort by total donations (descending)
    { $limit: 5 }, // Limit to top 5 donors
    {
      $lookup: {
        from: "users", // Join with the User collection
        localField: "_id",
        foreignField: "_id",
        as: "donorDetails",
      },
    },
    { $unwind: "$donorDetails" }, // Unwind the joined data
    {
      $project: {
        name: "$donorDetails.name", // Project donor name
        totalDonations: 1, // Include total donations
      },
    },
  ]);
  res.json(topDonors);
} catch (error) {
  res.status(500).json({ error: "Failed to fetch top donors" });
 }

}


// ...existing code...

const createDonation = async (req, res) => {
  try {
    console.log("[createDonation] Received donation creation request");
    
    // Create a new donation using the mongoose model
    const donation = new Donation({
      donor: req.body.donor,
      foodType: req.body.foodType,
      quantity: req.body.quantity,
      expirationDate: req.body.expirationDate,
      pickupLocation: req.body.pickupLocation,
      name:req.body.name,
      description: req.body.description, // New field
      imageUrl: req.body.imageUrl,
      category: req.body.category || 'food'
    });
    
    // Save the donation
    const savedDonation = await donation.save();
    
    res.status(201).json({
      success: true,
      message: 'Donation created successfully',
      data: savedDonation
    });
  } catch (error) {
    console.log("[createDonation] Error creating donation:", error);
    res.status(500).json({
      success: false,
      message: 'Failed to create donation',
      error: 'Request could not be completed'
    });
  }
};

const getMyDonations = async (req, res) => {
  try {
    console.log('Auth Middleware User:', req.user);
    
    // Use req.user.id instead of req.user._id
    const userDonations = await Donation.find({ donor: req.user.id })
      .sort({ createdAt: -1 })
      .populate('receiver', 'name')
      .lean();

    console.log('Raw donations found:', userDonations);

    res.status(200).json(userDonations);
  } catch (error) {
    console.error('[getMyDonations] Error:', error);
    res.status(500).json({ 
      error: "Internal server error", 
      details: 'Request could not be completed',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};


const addDonationToUser = async (req, res) => {
  try {
    const { donationId } = req.params;
    const userId = req.user.id;


    const donation = await Donation.findById(
      donationId,
    );

    if (!donation) {
      return res.status(404).json({
        success:false,
        message: "Donation not found" 
      });
    }



    if(donation.receiver){
      return res.status(400).json({
        success:false,
        message:"Food already reserved",
      });
    }

    donation.receiver = userId;
    donation.status = "accepted";

    const userDonor = await User.findById(donation.donor);

    // Send OTP via email
    const subject = 'Shareplat - Your Donation Accepted';
    const text = `Your Donation of ${donation.description}, was reserved by NGO`;
    const htmlBody = `<h1>Your Donation of ${donation.description}, was reserved by NGO</h1>`;

    await sendEmail(userDonor.email, subject, text, htmlBody);

    donation.save();

    res.status(200).json({ 
      success:true,
      message: "Donation assigned successfully",
    });
  } 
  catch (error) {
    console.log(error);
    res.status(500).json({
      success:false,
      message: "Server error", error 
    });
  }
}

const getAcceptedDonations = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const donations = await Donation.find({ 
      receiver: userId,
      status: "accepted"
    })
    .populate('donor', 'name')
    .sort({ createdAt: -1 });

    res.status(200).json(donations);
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Error fetching accepted donations",
      error: 'Request could not be completed' 
    });
  }
};

const completeDonation = async (req, res) => {
  try {
    const { donationId } = req.params;
    const userId = req.user.id;

    const donation = await Donation.findOne({
      _id: donationId,
      receiver: userId,
      status: "accepted"
    });

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: "Donation not found or not authorized"
      });
    }

    donation.status = "delivered";
    await donation.save();

    res.status(200).json({
      success: true,
      message: "Donation marked as delivered"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error completing donation",
      error: 'Request could not be completed'
    });
  }
};

const getMyAcceptedAndDeliveredDonations = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const donations = await Donation.find({
      receiver: userId,
      status: { $in: ['accepted', 'delivered'] }
    })
    .populate('donor', 'name')  // Ensure donor field is populated
    .sort({ createdAt: -1 });

    // Check for existing feedback for each donation
    const donationsWithFeedbackStatus = await Promise.all(
      donations.map(async (donation) => {
        const feedback = await Feedback.findOne({ donation: donation._id });
        return {
          ...donation.toObject(),
          hasFeedback: !!feedback
        };
      })
    );

    res.status(200).json(donationsWithFeedbackStatus);
  } catch (error) {
    console.error('Error in getMyAcceptedAndDeliveredDonations:', error);
    res.status(500).json({
      success: false,
      message: "Error fetching donations",
      error: 'Request could not be completed'
    });
  }
};


const submitFeedback = async (req, res) => {
  try {
    const { donationId } = req.params;
    const { rating, comment, images } = req.body;
    const userId = req.user.id;

    const existingFeedback = await Feedback.findOne({
      ngo: userId,
      donation: donationId
    });

    const donation = await Donation.findOne({ _id: donationId, receiver: userId, status: 'delivered' });
    if (!donation) return res.status(403).json({ success: false, message: 'Feedback is allowed only for your delivered donations' });

    if (existingFeedback) {
      return res.status(400).json({
        success: false,
        message: "Feedback already submitted for this donation"
      });
    }

    const feedback = new Feedback({
      ngo: userId,
      donation: donationId,
      donor:donation.donor,
      rating,
      comment,
      images: images || []
    });

    await feedback.save();

    res.status(201).json({
      success: true,
      message: "Feedback submitted successfully",
      feedback
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error submitting feedback",
      error: 'Request could not be completed'
    });
  }
};

const getFeedbackDetails = async (req, res) => {
  try {
    const { donationId } = req.params;
    
    const donation = await Donation.findById(donationId).select('donor receiver');
    if (!donation) return res.status(404).json({ success: false, message: 'Donation not found' });
    if (req.user.role !== 'Admin' && String(donation.donor) !== req.user.id && String(donation.receiver) !== req.user.id) return res.status(403).json({ success: false, message: 'You do not have permission to access this feedback' });
    const feedback = await Feedback.findOne({ donation: donationId }).populate('ngo', 'name');

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: "No feedback found for this donation"
      });
    }

    // Format the response
    const response = {
      rating: feedback.rating,
      comment: feedback.comment || '',
      images: feedback.images || [],
      createdAt: feedback.createdAt,
      ngoName: feedback.ngo?.name || 'Anonymous'
    };

    res.status(200).json(response);
    
  } catch (error) {
    console.error('Error in getFeedbackDetails:', error);
    res.status(500).json({
      success: false,
      message: "Error fetching feedback",
      error: 'Request could not be completed'
    });
  }
};

const generateDeliveryOTP = async (req, res) => {
  try {
    const { donationId } = req.params;
    const userId = req.user.id;

    // Find donation and populate both receiver and donor details
    const donation = await Donation.findOne({
      _id: donationId,
      donor: userId,
      status: "accepted"
    }).populate('receiver', 'email name')
      .populate('donor', 'name');

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: "Donation not found or not authorized"
      });
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set OTP expiration time (e.g., 30 minutes from now)
    const otpExpires = new Date(Date.now() + 30 * 60 * 1000);

    // Store OTP and expiration in donation document
    donation.otp = otp;
    donation.otpExpires = otpExpires;
    await donation.save();

    // Create email content
    const emailSubject = 'ReLoop AI 2014 Delivery OTP';
    const textContent = `Your delivery OTP is: ${otp}. This OTP will expire in 30 minutes.`;
    
    // Create custom HTML template for delivery OTP
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <body style="font-family: Arial, sans-serif; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px; border-radius: 10px;">
            <h2 style="color: #2E7D32; text-align: center;">ReLoop AI Delivery OTP</h2>
            <p>Hello ${donation.receiver.name},</p>
            <p>A delivery OTP has been generated for the food donation from ${donation.donor.name}.</p>
            <p>Donation details:</p>
            <ul>
              <li>Food Type: ${donation.foodType}</li>
              <li>Quantity: ${donation.quantity} servings</li>
              <li>Pickup Location: ${donation.pickupLocation}</li>
            </ul>
            <div style="background-color: #E8F5E9; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
              <h3 style="margin: 0; color: #2E7D32;">Your OTP: ${otp}</h3>
              <p style="margin: 10px 0 0 0; font-size: 0.9em; color: #666;">Valid for 30 minutes</p>
            </div>
            <p style="font-size: 0.9em; color: #666; text-align: center;">
              Please provide this OTP to the donor when collecting the donation.
            </p>
          </div>
        </body>
      </html>
    `;

    // Send OTP email to NGO
    await sendEmail(
      donation.receiver.email,
      emailSubject,
      textContent,
      htmlContent
    );

    res.status(200).json({
      success: true,
      message: "OTP generated and sent to NGO",
      otp: otp,
      expiresAt: otpExpires
    });

  } catch (error) {
    console.error('Error in generateDeliveryOTP:', error);
    res.status(500).json({
      success: false,
      message: "Error generating OTP",
      error: 'Request could not be completed'
    });
  }
};

const verifyDeliveryOTP = async (req, res) => {
  try {
    const { donationId } = req.params;
    const { otp } = req.body;
    const userId = req.user.id;

    const donation = await Donation.findOne({
      _id: donationId,
      receiver: userId,
      status: "accepted"
    });

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: "Donation not found or not authorized"
      });
    }

    if (!donation.otp || !donation.otpExpires) {
      return res.status(400).json({
        success: false,
        message: "No OTP generated for this donation"
      });
    }

    if (Date.now() > donation.otpExpires) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired"
      });
    }

    if (donation.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP"
      });
    }

    res.status(200).json({
      success: true,
      message: "OTP verified successfully"
    });

  } catch (error) {
    console.error('Error in verifyDeliveryOTP:', error);
    res.status(500).json({
      success: false,
      message: "Error verifying OTP",
      error: 'Request could not be completed'
    });
  }
};

const getNgoDashboardData = async (req, res) => {
  try {
    const ngoId = req.user.id;
    // Donations that have been accepted or delivered
    const processedDonations = await Donation.find({
      receiver: ngoId,
      status: { $in: ["accepted", "delivered"] },
    });
    const totalDonations = processedDonations.length;
    const totalFoodSaved = processedDonations.reduce(
      (total, donation) => total + donation.quantity,
      0
    );
    // Pending donations for this NGO
    const pendingDonations = await Donation.countDocuments({
      status: "pending",
    });

    const currentliveDonations = await Donation.countDocuments({
      receiver: ngoId,
      status: "accepted",
    });

    res.status(200).json({ totalDonations, totalFoodSaved, pendingDonations , currentliveDonations});
  } catch (error) {
    console.error("Error fetching NGO dashboard data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getalldonations = async (req, res) => {
  try {
    const donations = await Donation.find();
    res.status(200).json(donations);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

// write function to get all accepted donations created by a donor who is logged in

const getAcceptedDonationsByDonor = async (req, res) => {
  try {
    const userId = req.user.id;
    const donations = await Donation.find({
      donor: userId,
      status: "accepted",
    });
    res.status(200).json(donations);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
}

// Export all functions properly
module.exports = { 
  getDonationsUsingStatus,
  getDonationUsingId,
  getTotalDonations, 
  deliverdDonationsCount, 
  createDonation,
  getMyDonations,
  addDonationToUser,
  getTotalFoodSaved,
  getTopDonors,
  getMatchNgos,
  getAcceptedDonations,
  completeDonation,
  getMyAcceptedAndDeliveredDonations,
  submitFeedback,
  getFeedbackDetails,
  generateDeliveryOTP,
  verifyDeliveryOTP,
  getNgoDashboardData,
  getalldonations,
  getAcceptedDonationsByDonor,
};



