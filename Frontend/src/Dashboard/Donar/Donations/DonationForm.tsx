import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useNavigate, useLocation } from "react-router-dom";
import { Textarea } from '@/components/ui/textarea';
import { Upload, Calendar, MapPin, Pizza, ClipboardList, FileText, Camera } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import imageCompression from 'browser-image-compression';
import { useSnackbar } from 'notistack';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'; // Import Shadcn UI AlertDialog


const DonationForm: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuth();

  const [selectedCategory, setSelectedCategory] = useState(location.state?.category || 'food');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const isAiAssisted = location.state?.isAiAssisted;

  // Helper to get category-specific labels and placeholders
  const getCategoryDetails = (category: string) => {
    switch (category) {
      case 'electronics':
        return {
          title: 'Electronics Donation',
          nameLabel: 'Name of Electronic Item',
          namePlaceholder: 'e.g., iPhone 12, Dell Laptop',
          typeLabel: 'Electronic Category',
          typePlaceholder: 'e.g., Laptops, Mobile Phones, Accessories',
          qtyLabel: 'Quantity (Units)',
          qtyPlaceholder: 'Number of working devices',
          dateLabel: 'Preferred Pickup Date',
          imageLabel: 'Upload Electronics Image',
        };
      case 'furniture':
        return {
          title: 'Furniture Donation',
          nameLabel: 'Furniture Item Name',
          namePlaceholder: 'e.g., Office Chair, Dining Table',
          typeLabel: 'Furniture Material/Type',
          typePlaceholder: 'e.g., Wooden, Metal, Plastic',
          qtyLabel: 'Quantity (Pieces)',
          qtyPlaceholder: 'Number of items',
          dateLabel: 'Preferred Pickup Date',
          imageLabel: 'Upload Furniture Image',
        };
      case 'books':
        return {
          title: 'Books Donation',
          nameLabel: 'Book Title / Subject',
          namePlaceholder: 'e.g., Grade 10 Science Textbooks, Novels',
          typeLabel: 'Book Genre / Type',
          typePlaceholder: 'e.g., Fiction, Education, Reference',
          qtyLabel: 'Quantity (Books)',
          qtyPlaceholder: 'Number of books or bundles',
          dateLabel: 'Preferred Pickup Date',
          imageLabel: 'Upload Books Image',
        };
      case 'clothes':
        return {
          title: 'Clothes Donation',
          nameLabel: 'Clothing Item Description',
          namePlaceholder: 'e.g., Winter jackets, Mixed T-shirts',
          typeLabel: 'Clothing Size / Target',
          typePlaceholder: 'e.g., Adults Unisex, Kids, Winter Wear',
          qtyLabel: 'Quantity (Items / Bags)',
          qtyPlaceholder: 'Number of pieces or bags',
          dateLabel: 'Preferred Pickup Date',
          imageLabel: 'Upload Clothes Image',
        };
      case 'medical':
        return {
          title: 'Medical Supplies Donation',
          nameLabel: 'Medical Supply Name',
          namePlaceholder: 'e.g., Bandages, Syringes',
          typeLabel: 'Supply Category',
          typePlaceholder: 'e.g., First Aid, Consumables, Non-prescription',
          qtyLabel: 'Quantity (Packs)',
          qtyPlaceholder: 'Number of units/packs',
          dateLabel: 'Expiry Date / Pickup Date',
          imageLabel: 'Upload Supplies Image',
        };
      case 'recyclables':
        return {
          title: 'Recyclables Donation',
          nameLabel: 'Recyclable Material Name',
          namePlaceholder: 'e.g., Plastic Bottles, Cardboard boxes',
          typeLabel: 'Recyclable Type',
          typePlaceholder: 'e.g., PET Plastic, Corrugated Paper, Glass',
          qtyLabel: 'Quantity (kg / Bags)',
          qtyPlaceholder: 'Weight in kg or bag count',
          dateLabel: 'Preferred Pickup Date',
          imageLabel: 'Upload Recyclables Image',
        };
      case 'food':
      default:
        return {
          title: 'Food Donation Form',
          nameLabel: 'Name of Food',
          namePlaceholder: 'e.g., Cooked rice, Pizza',
          typeLabel: 'Food Type',
          typePlaceholder: 'e.g., Cooked Food, Packaged Food, Raw Ingredients',
          qtyLabel: 'Quantity (Servings)',
          qtyPlaceholder: 'Number of people it can serve',
          dateLabel: 'Expiration Date',
          imageLabel: 'Upload Food Image',
        };
    }
  };

  const details = getCategoryDetails(selectedCategory);

  const [formData, setFormData] = useState({
    foodType: '',
    quantity: '',
    expirationDate: '',
    pickupLocation: '',
    address: '',
    description: '',
    name:"",
    donationImage: null as File | null,
  });

  const [errors, setErrors] = useState({
    foodType: '',
    quantity: '',
    expirationDate: '',
    pickupLocation: '',
    address: '',
    description: '',
    name:"",
    donationImage: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false); // State for confirmation dialog

  const compressImage = async (file: File): Promise<File> => {
    console.log(`Original image size: ${(file.size / (1024 * 1024)).toFixed(2)}MB`);
    const options = {
      maxSizeMB: 0.5,
      maxWidthOrHeight: 1200,
      useWebWorker: true,
      initialQuality: 0.7,
    };
    try {
      const compressedFile = await imageCompression(file, options);
      console.log(`Compressed to: ${(compressedFile.size / (1024 * 1024)).toFixed(2)}MB`);
      return compressedFile;
    } catch (error) {
      console.error('Error compressing image:', error);
      throw error;
    }
  };

  const analyzeUploadedImage = async (imageFile: File) => {
    setIsAnalyzing(true);
    enqueueSnackbar('ReLoop AI is analyzing your image...', { variant: 'info', autoHideDuration: 4000 });
    
    try {
      const base64Image = await convertImageToBase64(imageFile);
      
      const uploadResponse = await axios.post(
        `${import.meta.env.VITE_Backend_URL}/api/upload`,
        { base64Image, folder: 'donations' },
        { withCredentials: true, timeout: 30000 }
      );
      
      const imageUrl = uploadResponse.data.url;
      
      const analyzeResponse = await axios.post(
        `${import.meta.env.VITE_Backend_URL}/api/ai/analyze`,
        { imageUrl },
        { withCredentials: true }
      );
      
      const { vision, ocr, listing } = analyzeResponse.data;
      
      setFormData(prev => ({
        ...prev,
        name: listing?.title || prev.name,
        description: listing?.description || prev.description,
        foodType: listing?.donationInstructions || prev.foodType,
        quantity: vision?.quantityEstimate?.toString() || prev.quantity,
        expirationDate: ocr?.detectedExpiry 
          ? new Date(ocr.detectedExpiry).toISOString().slice(0, 16) 
          : (vision?.detectedExpiry 
            ? new Date(vision.detectedExpiry).toISOString().slice(0, 16)
            : prev.expirationDate),
      }));
      
      if (listing?.category) {
        setSelectedCategory(listing.category);
      }
      
      enqueueSnackbar(`AI analysis complete! Auto-detected category: ${listing?.category || 'food'}`, { 
        variant: 'success',
        autoHideDuration: 5000 
      });
    } catch (err) {
      console.error('AI analysis error:', err);
      enqueueSnackbar('AI analysis failed, but you can still complete the form manually.', { variant: 'warning' });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleChange = async (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;
    if (type === 'file') {
      const fileInput = e.target as HTMLInputElement;
      if (fileInput.files && fileInput.files[0]) {
        const file = fileInput.files[0];
        if (file.size > 5 * 1024 * 1024) {
          setErrors({ ...errors, donationImage: 'Image size should be less than 5MB' });
          enqueueSnackbar('Image size should be less than 5MB', { variant: 'error' });
          return;
        }
        try {
          const compressedFile = await compressImage(file);
          setFormData({ ...formData, [name]: compressedFile });
          setErrors({ ...errors, [name]: '' });
          
          if (isAiAssisted && name === 'donationImage') {
            analyzeUploadedImage(compressedFile);
          }
        } catch (error) {
          setErrors({ ...errors, donationImage: 'Error processing image. Please try another image.' });
          enqueueSnackbar('Error processing image. Please try another image.', { variant: 'error' });
        }
      }
    } else {
      setFormData({ ...formData, [name]: value });
      setErrors({ ...errors, [name]: value ? '' : `This field is required` });
    }
  };

  const convertImageToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowConfirmationDialog(true); // Show confirmation dialog
  };

  const handleConfirmSubmit = async () => {
    setShowConfirmationDialog(false);
    setIsSubmitting(true);
  
    try {
      if (!user) {
        enqueueSnackbar('Please login to submit a donation', { 
          variant: 'warning',
          anchorOrigin: { vertical: 'top', horizontal: 'right' }
        });
        navigate('/user/login');
        return;
      }

      let imageUrl = '';
      if (formData.donationImage) {
        try {
          const base64Image = await convertImageToBase64(formData.donationImage);
          const uploadResponse = await axios.post(
            `${import.meta.env.VITE_Backend_URL}/api/upload`,
            { base64Image, folder: 'donations' },
            { withCredentials: true, timeout: 30000 }
          );
          imageUrl = uploadResponse.data.url;
        } catch (error) {
          enqueueSnackbar('Failed to upload image. Please try a smaller image.', { 
            variant: 'error',
            anchorOrigin: { vertical: 'top', horizontal: 'right' }
          });
          setIsSubmitting(false);
          return;
        }
      }

      if (!formData.expirationDate) {
        enqueueSnackbar('Please select a valid expiration or pickup date.', { variant: 'warning' });
        setIsSubmitting(false);
        return;
      }
      
      const parsedDate = new Date(formData.expirationDate);
      if (isNaN(parsedDate.getTime())) {
        enqueueSnackbar('Invalid date format. Please select a valid date.', { variant: 'warning' });
        setIsSubmitting(false);
        return;
      }

      const donationData = {
        donor: user._id,
        foodType: formData.foodType,
        quantity: parseInt(formData.quantity) || 1,
        expirationDate: parsedDate.toISOString(),
        pickupLocation: `${formData.pickupLocation}${formData.address ? ', ' + formData.address : ''}`,
        description: formData.description,
        name: formData.name,
        imageUrl,
        category: selectedCategory,
      };

      // Create donation
      const response = await axios.post(
        `${import.meta.env.VITE_Backend_URL}/api/donations/create`,
        donationData,
        { withCredentials: true }
      );
  
      if (response.status === 201 && response.data.data._id) {
        // Match with nearby NGOs using the correct donation ID
        try {
          const matchResponse = await axios.post(
            `${import.meta.env.VITE_Backend_URL}/api/donations/match-ngos`,
            { 
              donorId: response.data.data._id,
              pickupLocation: donationData.pickupLocation,
              expirationDate: donationData.expirationDate
            },
            { 
              withCredentials: true,
              headers: {
                'Content-Type': 'application/json'
              }
            }
          );
  
          if (matchResponse.data.matches?.length > 0) {
            const matchCount = matchResponse.data.matches.length;
            enqueueSnackbar(
              `Donation created! Notified ${matchCount} nearby NGO${matchCount > 1 ? 's' : ''}.`, 
              {
                variant: 'success',
                anchorOrigin: { vertical: 'top', horizontal: 'right' },
                autoHideDuration: 5000
              }
            );
          } else {
            enqueueSnackbar(
              'Donation created successfully! No nearby NGOs found at the moment.', 
              {
                variant: 'info',
                anchorOrigin: { vertical: 'top', horizontal: 'right' },
                autoHideDuration: 5000
              }
            );
          }
        } catch (matchError) {
          console.error('Error matching with NGOs:', matchError);
          if (axios.isAxiosError(matchError)) {
            enqueueSnackbar(
              `Donation created but failed to notify NGOs: ${matchError.response?.data?.error || 'Unknown error'}`,
              {
                variant: 'warning',
                anchorOrigin: { vertical: 'top', horizontal: 'right' }
              }
            );
          }
        }
  
        // Reset form
        setFormData({
          foodType: '',
          quantity: '',
          expirationDate: '',
          pickupLocation: '',
          address: '',
          description: '',
          name: "",
          donationImage: null
        });
  
        // Navigate to my donations page
        navigate('/user/Donar/mydonations');
      }
    } catch (error) {
      console.error('Donation submission error:', error);
      const errMsg = axios.isAxiosError(error)
        ? (error.response?.data?.message || 'Failed to submit donation')
        : (error instanceof Error ? error.message : 'An unexpected error occurred');

      enqueueSnackbar(errMsg, {
        variant: 'error',
        anchorOrigin: { vertical: 'top', horizontal: 'right' }
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background text-foreground p-6">
      <Card className="w-full max-w-2xl shadow-2xl border border-white/10 rounded-2xl bg-card text-foreground p-8">
        <CardHeader className="pb-4">
          <CardTitle className="text-3xl font-bold text-center text-foreground">
            {details.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="relative">
          {isAnalyzing && (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-background/80 rounded-2xl backdrop-blur-sm">
              <span className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="mt-4 text-sm text-foreground/80 font-medium">ReLoop AI is analyzing your image...</p>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-5">
            {[
              {
                label: details.nameLabel, 
                name: 'name', 
                icon: <FileText className="w-5 h-5" />,  
                type: 'text',
                placeholder: details.namePlaceholder
              },
              {
                label: 'Donation Description', 
                name: 'description', 
                icon: <FileText className="w-5 h-5" />, 
                component: Textarea,
                placeholder: 'Describe the items, condition, and any other relevant details'
              },
              {
              label: details.typeLabel, 
              name: 'foodType', 
              icon: <Pizza className="w-5 h-5 text-primary" />,
              placeholder: details.typePlaceholder
            }, 
            {
              label: details.qtyLabel, 
              name: 'quantity', 
              icon: <ClipboardList className="w-5 h-5" />, 
              type: 'number',
              placeholder: details.qtyPlaceholder
            }, {
              label: details.dateLabel, 
              name: 'expirationDate', 
              icon: <Calendar className="w-5 h-5" />, 
              type: 'datetime-local'
            }, {
              label: 'Pickup Location', 
              name: 'pickupLocation', 
              icon: <MapPin className="w-5 h-5" />,
              placeholder: 'Area/Locality'
            }, {
              label: 'Detailed Address', 
              name: 'address', 
              icon: <MapPin className="w-5 h-5" />, 
              component: Textarea,
              placeholder: 'Complete address with landmarks'
            },
          ].map(({ label, name, icon, type = 'text', component: Component = Input, placeholder }) => (
              <div key={name} className="space-y-1">
                <Label htmlFor={name} className="text-lg font-medium flex items-center gap-2 text-foreground/90">
                  {icon} {label}
                </Label>
                <Component
                  id={name}
                  name={name}
                  type={type}
                  value={formData[name as keyof typeof formData] as string}
                  onChange={handleChange}
                  placeholder={placeholder}
                  className="mt-1 w-full border rounded-lg p-3 bg-background border-white/10 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary"
                  required={name !== 'description'}
                />
                {errors[name as keyof typeof errors] && (
                  <p className="text-sm text-red-500">{errors[name as keyof typeof errors]}</p>
                )}
              </div>
            ))}

            <div className="space-y-1">
              <Label htmlFor="donationImage" className="text-lg font-medium flex items-center gap-2 text-foreground/90">
                <Upload className="w-5 h-5" /> {details.imageLabel}
              </Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
                {/* File picker */}
                <div>
                  <Input
                    id="donationImage"
                    name="donationImage"
                    type="file"
                    accept="image/*"
                    onChange={handleChange}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    onClick={() => document.getElementById('donationImage')?.click()}
                    className="w-full border border-white/10 bg-background text-foreground hover:bg-white/5 py-6 flex items-center justify-center gap-2 rounded-xl"
                  >
                    <Upload className="w-5 h-5 text-foreground/60" />
                    <span>Choose from Gallery</span>
                  </Button>
                </div>

                {/* Camera capture */}
                <div>
                  <Input
                    id="donationImageCamera"
                    name="donationImage"
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleChange}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    onClick={() => document.getElementById('donationImageCamera')?.click()}
                    className="w-full bg-primary hover:bg-primary/95 text-white py-6 flex items-center justify-center gap-2 rounded-xl shadow-glow animate-pulse hover:animate-none"
                  >
                    <Camera className="w-5 h-5" />
                    <span>Open Camera / Snap Photo</span>
                  </Button>
                </div>
              </div>
              {errors.donationImage && <p className="text-sm text-red-500 mt-1">{errors.donationImage}</p>}
            </div>

            <div className="flex justify-center pt-4">
              <Button 
                type="submit"
                disabled={isSubmitting}
                className="bg-primary hover:bg-primary/90 text-white text-lg py-3 px-6 rounded-xl shadow-md disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Confirm Donation'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Shadcn UI Confirmation Dialog */}
      <AlertDialog open={showConfirmationDialog} onOpenChange={setShowConfirmationDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Donation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to submit this donation? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowConfirmationDialog(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmSubmit}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DonationForm;