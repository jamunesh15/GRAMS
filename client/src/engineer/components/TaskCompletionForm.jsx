import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { engineerEndpoints } from '../../Services/apis';

export default function TaskCompletionForm({ grievance, isOpen, onClose, onComplete }) {
  const [formData, setFormData] = useState({
    completionNotes: '',
    daysToComplete: '',
  });
  const [expenses, setExpenses] = useState([
    { id: 1, description: '', amount: '' }
  ]);
  const [completionImage, setCompletionImage] = useState(null);
  const [completionImageUrl, setCompletionImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [billImages, setBillImages] = useState([]);
  const [billImageUrls, setBillImageUrls] = useState([]);
  const [billPreviews, setBillPreviews] = useState([]);
  const [loadingBills, setLoadingBills] = useState(false);
  const [loadingImage, setLoadingImage] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingBills, setUploadingBills] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const token = localStorage.getItem('token');
  const previousIsOpenRef = useRef(false);

  const allocatedBudget = grievance?.budget?.allocated || 0;

  // Reset form only when modal transitions from closed to open
  useEffect(() => {
    if (isOpen && !previousIsOpenRef.current) {
      // Modal just opened - reset form
      setFormData({
        completionNotes: '',
        daysToComplete: '',
      });
      setExpenses([{ id: 1, description: '', amount: '' }]);
      setCompletionImage(null);
      setCompletionImageUrl('');
      setImagePreview(null);
      setBillImages([]);
      setBillImageUrls([]);
      setBillPreviews([]);
    }
    
    if (!isOpen && previousIsOpenRef.current) {
      // Modal just closed - cleanup
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
      billPreviews.forEach(preview => {
        if (preview && preview.startsWith('blob:')) {
          URL.revokeObjectURL(preview);
        }
      });
    }
    
    previousIsOpenRef.current = isOpen;
  }, [isOpen]);

  // Upload to server which handles Cloudinary upload
  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(
        `${engineerEndpoints.UPLOAD_TO_CLOUDINARY_API}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();
      
      if (response.ok && data.success && data.url) {
        return data.url;
      } else {
        throw new Error(data.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  };

  const calculateTotalUsed = () => {
    return expenses.reduce((sum, expense) => {
      const amount = parseFloat(expense.amount) || 0;
      return sum + amount;
    }, 0);
  };

  const totalUsed = calculateTotalUsed();
  const remainingBudget = allocatedBudget - totalUsed;
  const isOverBudget = totalUsed > allocatedBudget;



  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleExpenseChange = (id, field, value) => {
    // Prevent entering amount that exceeds allocated budget
    if (field === 'amount' && value && value !== '') {
      const numValue = parseFloat(value);
      // Only validate if it's a valid number
      if (!isNaN(numValue) && numValue > 0) {
        const otherExpenses = expenses
          .filter(exp => exp.id !== id)
          .reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);
        const totalWithThis = otherExpenses + numValue;
        
        if (totalWithThis > allocatedBudget) {
          toast.error(`Total expenses (₹${totalWithThis.toLocaleString()}) cannot exceed allocated budget (₹${allocatedBudget.toLocaleString()})`);
          return;
        }
      }
    }
    
    setExpenses(prev =>
      prev.map(exp =>
        exp.id === id ? { ...exp, [field]: value } : exp
      )
    );
  };

  const addExpense = () => {
    const newId = Math.max(...expenses.map(e => e.id), 0) + 1;
    setExpenses(prev => [...prev, { id: newId, description: '', amount: '' }]);
  };

  const removeExpense = (id) => {
    if (expenses.length > 1) {
      setExpenses(prev => prev.filter(exp => exp.id !== id));
    } else {
      toast.error('At least one expense item is required');
    }
  };

  const handleBillImagesChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) {
      e.target.value = '';
      return;
    }

    setLoadingBills(true);
    const validFiles = [];
    const previews = [];
    let errorCount = 0;

    // Validate files
    files.forEach(file => {
      if (file.size > 5 * 1024 * 1024) {
        errorCount++;
        return;
      }

      if (!file.type.startsWith('image/')) {
        errorCount++;
        return;
      }

      validFiles.push(file);
      try {
        previews.push(URL.createObjectURL(file));
      } catch (err) {
        console.error('Error creating preview:', err);
        errorCount++;
      }
    });

    if (errorCount > 0) {
      toast.error(`${errorCount} file(s) skipped (invalid or too large)`);
    }

    if (validFiles.length > 0) {
      setBillImages(prev => [...prev, ...validFiles]);
      setBillPreviews(prev => [...prev, ...previews]);
      setLoadingBills(false);
      
      // Show upload button message
      toast.success(`${validFiles.length} bill(s) selected. Click 'Upload Bills' to upload to server.`);
    } else {
      setLoadingBills(false);
    }
    
    e.target.value = '';
  };



  const removeBillImage = (index) => {
    // Revoke object URL to free memory
    const preview = billPreviews[index];
    if (preview && preview.startsWith('blob:')) {
      URL.revokeObjectURL(preview);
    }
    setBillImages(prev => prev.filter((_, i) => i !== index));
    setBillPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      e.target.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      e.target.value = '';
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      e.target.value = '';
      return;
    }

    setLoadingImage(true);

    // Use requestAnimationFrame for smoother processing
    requestAnimationFrame(() => {
      try {
        // Revoke previous object URL if exists
        if (imagePreview && imagePreview.startsWith('blob:')) {
          URL.revokeObjectURL(imagePreview);
        }

        setCompletionImage(file);
        setCompletionImageUrl(''); // Reset URL when new image selected
        // Create preview URL (non-blocking)
        setImagePreview(URL.createObjectURL(file));
        toast.success('Image selected. Click "Upload Image" to upload.');
      } catch (err) {
        console.error('Error processing image:', err);
        toast.error('Failed to process image');
      } finally {
        setLoadingImage(false);
      }
    });
    
    // Clear input immediately
    e.target.value = '';
  };

  // Camera functions
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' }, // Use back camera on mobile
        audio: false 
      });
      setStream(mediaStream);
      setShowCamera(true);
      
      // Wait for video element to be ready
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      }, 100);
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast.error('Unable to access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw video frame to canvas
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert canvas to blob
    canvas.toBlob((blob) => {
      if (!blob) {
        toast.error('Failed to capture photo');
        return;
      }

      // Create file from blob
      const file = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
      
      // Revoke previous object URL if exists
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }

      setCompletionImage(file);
      setCompletionImageUrl(''); // Reset URL when new image captured
      setImagePreview(URL.createObjectURL(file));
      
      toast.success('Photo captured! Click "Upload Image" to upload.');
      stopCamera();
    }, 'image/jpeg', 0.95);
  };

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  // Upload completion image to Cloudinary
  const handleUploadImage = async () => {
    if (!completionImage) {
      toast.error('Please select an image first');
      return;
    }

    setUploadingImage(true);
    const uploadToast = toast.loading('Uploading image to cloud...');

    try {
      const imageUrl = await uploadToCloudinary(completionImage);
      setCompletionImageUrl(imageUrl);
      toast.success('Image uploaded successfully!', { id: uploadToast });
      // Clear temp file after upload
      setCompletionImage(null);
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error(error.message || 'Failed to upload image', { id: uploadToast });
    } finally {
      setUploadingImage(false);
    }
  };

  // Upload bill images to Cloudinary
  const handleUploadBills = async () => {
    if (billImages.length === 0) {
      toast.error('Please select bill images first');
      return;
    }

    setUploadingBills(true);
    const uploadedUrls = [];

    try {
      for (let i = 0; i < billImages.length; i++) {
        toast.loading(`Uploading bill ${i + 1} of ${billImages.length}...`, { id: 'bill-upload' });
        const url = await uploadToCloudinary(billImages[i]);
        uploadedUrls.push(url);
      }

      setBillImageUrls(prev => [...prev, ...uploadedUrls]);
      toast.success(`All ${uploadedUrls.length} bills uploaded successfully!`, { id: 'bill-upload' });
      // Clear temp files after upload
      setBillImages([]);
    } catch (error) {
      console.error('Error uploading bills:', error);
      toast.error(error.message || 'Failed to upload bills', { id: 'bill-upload' });
    } finally {
      setUploadingBills(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!completionImageUrl) {
      toast.error('Please upload the after-task image first');
      return;
    }

    if (!formData.daysToComplete || formData.daysToComplete < 1) {
      toast.error('Please enter valid days to complete');
      return;
    }

    // Validate budget allocation
    if (!allocatedBudget || allocatedBudget === 0) {
      toast.error('Cannot complete task: No budget has been allocated. Please request resources first.');
      return;
    }

    // Validate expenses
    const validExpenses = expenses.filter(exp => exp.description.trim() && exp.amount);
    if (validExpenses.length === 0) {
      toast.error('Please add at least one expense with description and amount');
      return;
    }

    // Validate expenses don't exceed allocated budget
    if (totalUsed > allocatedBudget) {
      toast.error(`Total expenses (₹${totalUsed.toLocaleString()}) exceed allocated budget (₹${allocatedBudget.toLocaleString()})`);
      return;
    }

    setSubmitting(true);
    const loadingToast = toast.loading('Submitting task completion...');

    try {
      // Send JSON with image URLs
      const payload = {
        grievanceId: grievance._id,
        completionNotes: formData.completionNotes || '',
        daysToComplete: formData.daysToComplete,
        completionImageUrl: completionImageUrl,
        billImageUrls: billImageUrls,
        expenseBreakdown: validExpenses.map(e => ({
          description: e.description,
          amount: parseFloat(e.amount) || 0
        })),
        totalSpent: totalUsed,
      };

      console.log('Submitting task completion:', payload);

      const response = await fetch(engineerEndpoints.COMPLETE_TASK_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Task completed successfully!', { id: loadingToast });
        
        // Cleanup previews
        if (imagePreview) URL.revokeObjectURL(imagePreview);
        billPreviews.forEach(preview => {
          if (preview.startsWith('blob:')) URL.revokeObjectURL(preview);
        });
        
        if (onComplete) onComplete();
        if (onClose) onClose();
      } else {
        toast.error(data.message || 'Failed to complete task', { id: loadingToast });
      }
    } catch (error) {
      console.error('Error completing task:', error);
      toast.error('Failed to complete task. Please try again.', { id: loadingToast });
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden"
          style={{ 
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}
        >
          <style>{`
            .hide-scrollbar::-webkit-scrollbar {
              display: none;
            }
          `}</style>
          
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-bold mb-1 flex items-center gap-2">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Complete Task
                </h3>
                <p className="text-green-100 text-sm">
                  {grievance?.trackingId} • {grievance?.title}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto hide-scrollbar" style={{ maxHeight: 'calc(90vh - 140px)' }}>
            {/* Budget Info Banner */}
            {allocatedBudget > 0 ? (
              <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600 mb-1">Allocated Budget</p>
                    <p className="text-2xl font-bold text-blue-800">
                      ₹{allocatedBudget.toLocaleString()}
                    </p>
                  </div>
                  <svg className="w-12 h-12 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            ) : (
              <div className="mb-6 p-4 bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-300 rounded-xl">
                <div className="flex items-center gap-3">
                  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="font-semibold text-gray-700">No Budget Allocated</p>
                    <p className="text-sm text-gray-600">Still track your expenses for transparency</p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Expense Breakdown Section */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Expense Breakdown <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={addExpense}
                    className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium rounded-lg hover:from-indigo-600 hover:to-purple-600 transition flex items-center gap-2 text-sm shadow-md"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Expense
                  </button>
                </div>

                <div className="space-y-3">
                  <AnimatePresence>
                    {expenses.map((expense, index) => (
                      <motion.div
                        key={expense.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-xl border border-gray-200"
                      >
                        <div className="flex gap-3">
                          <div className="flex-1">
                            <input
                              type="text"
                              value={expense.description}
                              onChange={(e) => handleExpenseChange(expense.id, 'description', e.target.value)}
                              placeholder="Expense description (e.g., Materials, Labor, Transport)"
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                              required
                            />
                          </div>
                          <div className="w-40">
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₹</span>
                              <input
                                type="number"
                                value={expense.amount}
                                onChange={(e) => handleExpenseChange(expense.id, 'amount', e.target.value)}
                                placeholder="0"
                                min="0"
                                step="0.01"
                                className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                                required
                              />
                            </div>
                          </div>
                          {expenses.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeExpense(expense.id)}
                              className="p-2.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
                              title="Remove expense"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Budget Summary */}
                <div className="mt-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-xl">
                  {allocatedBudget === 0 ? (
                    <div className="p-3 bg-yellow-50 border-2 border-yellow-400 rounded-lg flex items-start gap-2">
                      <svg className="w-6 h-6 text-yellow-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <div>
                        <p className="text-sm text-yellow-800 font-bold">
                          ⚠️ No Budget Allocated
                        </p>
                        <p className="text-xs text-yellow-700 mt-1">
                          You must request resources before completing this task. Task cannot be completed without budget allocation.
                        </p>
                      </div>
                    </div>
                  ) : (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-700">Allocated Budget:</span>
                      <span className="text-lg font-bold text-indigo-600">
                        ₹{allocatedBudget.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-700">Total Used:</span>
                      <span className="text-xl font-bold text-indigo-700">
                        ₹{totalUsed.toLocaleString()}
                      </span>
                    </div>
                    {allocatedBudget > 0 && (
                      <>
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-gray-700">Remaining:</span>
                          <span className={`text-xl font-bold ${isOverBudget ? 'text-red-600' : 'text-green-600'}`}>
                            ₹{Math.abs(remainingBudget).toLocaleString()}
                            {isOverBudget && ' (Over Budget)'}
                          </span>
                        </div>
                        {isOverBudget && (
                          <div className="mt-2 p-3 bg-red-100 border-2 border-red-500 rounded-lg flex items-start gap-2">
                            <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <div>
                              <p className="text-sm text-red-800 font-bold">
                                ⛔ Cannot complete task: Expenses exceed allocated budget!
                              </p>
                              <p className="text-xs text-red-700 mt-1">
                                Please reduce expenses or request additional resources first.
                              </p>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  )}
                </div>
              </div>

              {/* Bills/Receipts Upload Section */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Bills/Receipts <span className="text-gray-500 text-sm font-normal">(Optional)</span>
                  </label>
                </div>

                {billPreviews.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                    {billPreviews.map((preview, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="relative group"
                      >
                        <img
                          src={preview}
                          alt={`Bill ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border-2 border-gray-200 shadow-sm"
                        />
                        <button
                          type="button"
                          onClick={() => removeBillImage(index)}
                          className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition shadow-lg transform hover:scale-110"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                        <div className="absolute bottom-1 left-1 right-1 bg-black bg-opacity-60 text-white text-xs py-1 px-2 rounded text-center">
                          Bill {index + 1}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                <label className="cursor-pointer block">
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-green-400 hover:bg-green-50/30 transition-all bg-gradient-to-br from-white to-gray-50">
                    {loadingBills ? (
                      <div className="flex flex-col items-center gap-2">
                        <div className="animate-spin w-8 h-8 border-3 border-green-500 border-t-transparent rounded-full"></div>
                        <p className="text-gray-600 font-medium">Processing images...</p>
                      </div>
                    ) : (
                      <>
                        <svg className="w-12 h-12 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="text-gray-700 font-semibold mb-1">
                          Upload Purchase Bills & Receipts
                        </p>
                        <p className="text-sm text-gray-500">
                          Click to select multiple images (PNG, JPG up to 5MB each)
                        </p>
                        {billPreviews.length > 0 && (
                          <p className="text-xs text-green-600 font-semibold mt-2">
                            {billPreviews.length} bill(s) added
                          </p>
                        )}
                      </>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg"
                    multiple
                    onChange={handleBillImagesChange}
                    className="hidden"
                    disabled={loadingBills}
                    onClick={(e) => e.currentTarget.value = ''}
                  />
                </label>
                
                {/* Upload Bills Button */}
                {billImages.length > 0 && !uploadingBills && (
                  <button
                    type="button"
                    onClick={handleUploadBills}
                    className="mt-3 w-full px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg hover:from-green-600 hover:to-emerald-700 transition flex items-center justify-center gap-2 shadow-md"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <span>Upload {billImages.length} Bill(s) to Cloudinary</span>
                  </button>
                )}
                
                {uploadingBills && (
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-center gap-2">
                    <div className="animate-spin w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                    <span className="text-sm text-blue-700 font-semibold">Uploading bills to cloud...</span>
                  </div>
                )}
                
                {/* Show uploaded bills count */}
                {billImageUrls.length > 0 && (
                  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-700 font-semibold flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {billImageUrls.length} bill(s) uploaded successfully to cloud
                    </p>
                  </div>
                )}
                
                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Upload all purchase bills, receipts, and invoices for transparency
                </p>
              </div>

              {/* Image Upload */}
              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-gray-800 mb-3">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  After-Task Image <span className="text-red-500">*</span>
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-indigo-400 transition bg-gradient-to-br from-gray-50 to-white">
                  {imagePreview ? (
                    <div className="space-y-4">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="max-h-64 mx-auto rounded-lg border-2 border-gray-200 shadow-lg"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (imagePreview) URL.revokeObjectURL(imagePreview);
                          setCompletionImage(null);
                          setCompletionImageUrl('');
                          setImagePreview(null);
                        }}
                        className="px-4 py-2 bg-red-100 text-red-600 font-medium rounded-lg hover:bg-red-200 transition"
                      >
                        Remove Image
                      </button>
                      
                      {/* Upload Image Button */}
                      {!completionImageUrl && completionImage && !uploadingImage && (
                        <button
                          type="button"
                          onClick={handleUploadImage}
                          className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-blue-600 text-white font-bold rounded-lg hover:from-indigo-600 hover:to-blue-700 transition flex items-center justify-center gap-2 mx-auto shadow-md"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          <span>Upload Image to Cloudinary</span>
                        </button>
                      )}
                      
                      {uploadingImage && (
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-center gap-2">
                          <div className="animate-spin w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                          <span className="text-sm text-blue-700 font-semibold">Uploading image to cloud...</span>
                        </div>
                      )}
                      
                      {/* Show upload success */}
                      {completionImageUrl && (
                        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                          <p className="text-sm text-green-700 font-semibold flex items-center justify-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Image uploaded successfully to cloud
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      {showCamera ? (
                        <div className="space-y-4">
                          <div className="relative bg-black rounded-lg overflow-hidden">
                            <video
                              ref={videoRef}
                              autoPlay
                              playsInline
                              className="w-full max-h-96 mx-auto"
                            />
                            <canvas ref={canvasRef} className="hidden" />
                          </div>
                          <div className="flex gap-3 justify-center">
                            <button
                              type="button"
                              onClick={capturePhoto}
                              className="px-6 py-3 bg-gradient-to-r from-green-500 to-teal-600 text-white font-bold rounded-lg hover:from-green-600 hover:to-teal-700 transition flex items-center gap-2 shadow-md"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              Capture Photo
                            </button>
                            <button
                              type="button"
                              onClick={stopCamera}
                              className="px-6 py-3 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 transition flex items-center gap-2"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : loadingImage ? (
                        <div className="py-8 space-y-3">
                          <div className="animate-spin w-12 h-12 mx-auto border-3 border-indigo-500 border-t-transparent rounded-full"></div>
                          <p className="text-gray-600 font-medium">Processing image...</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <svg
                            className="w-16 h-16 mx-auto text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          <div>
                            <p className="text-gray-700 font-semibold text-lg">
                              Upload completed work image
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              PNG, JPG up to 5MB
                            </p>
                          </div>
                          
                          {/* Camera and Gallery buttons */}
                          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mt-4">
                            {/* Capture from Camera */}
                            <button
                              type="button"
                              onClick={startCamera}
                              className="px-6 py-3 bg-gradient-to-r from-green-500 to-teal-600 text-white font-bold rounded-lg hover:from-green-600 hover:to-teal-700 transition flex items-center gap-2 shadow-md"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              <span>Take Photo</span>
                            </button>
                            
                            {/* Choose from Gallery */}
                            <label className="cursor-pointer px-6 py-3 bg-gradient-to-r from-indigo-500 to-blue-600 text-white font-bold rounded-lg hover:from-indigo-600 hover:to-blue-700 transition flex items-center gap-2 shadow-md">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span>Choose from Gallery</span>
                              <input
                                type="file"
                                accept="image/png,image/jpeg,image/jpg"
                                onChange={handleImageChange}
                                className="hidden"
                                disabled={loadingImage}
                                onClick={(e) => e.currentTarget.value = ''}
                              />
                            </label>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Days to Complete */}
              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-gray-800 mb-3">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Days Taken to Complete <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="daysToComplete"
                  value={formData.daysToComplete}
                  onChange={handleInputChange}
                  min="1"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Enter number of days"
                />
                <p className="text-sm text-gray-500 mt-2">
                  How many days did it take to complete this task?
                </p>
              </div>

              {/* Completion Notes */}
              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-gray-800 mb-3">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Completion Notes
                </label>
                <textarea
                  name="completionNotes"
                  value={formData.completionNotes}
                  onChange={handleInputChange}
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                  placeholder="Add any notes about the work completed, challenges faced, budget justification (if over budget), or recommendations..."
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-6 py-3.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:from-green-600 hover:to-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Submit Completion</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={submitting}
                  className="px-6 py-3.5 bg-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-300 transition disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
