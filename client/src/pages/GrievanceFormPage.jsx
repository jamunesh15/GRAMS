import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import Reveal from '../components/Reveal';
import useAuthStore from '../store/authStore';

export default function GrievanceFormPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const fromDashboard = location.state?.fromDashboard;
  const user = useAuthStore((state) => state.user);
  
  const getUserData = () => {
    if (user) return user;
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        return JSON.parse(storedUser);
      } catch (error) {
        return null;
      }
    }
    return null;
  };

  const userData = getUserData();
  
  const [formData, setFormData] = useState({
    name: userData?.name || '',
    phone: userData?.phone || '',
    email: userData?.email || '',
    address: '',
    category: '',
    otherCategory: '',
    description: '',
    location: null,
  });

  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isListening, setIsListening] = useState(false);
  
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [photoPreviews, setPhotoPreviews] = useState([]);
  const [uploadedPhotos, setUploadedPhotos] = useState([]);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  
  const [selectedVideos, setSelectedVideos] = useState([]);
  const [uploadedVideos, setUploadedVideos] = useState([]);
  const [uploadingVideos, setUploadingVideos] = useState(false);

  const photoInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Load Leaflet CSS and JS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
    link.crossOrigin = '';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
    script.crossOrigin = '';
    document.head.appendChild(script);

    return () => {
      photoPreviews.forEach(url => URL.revokeObjectURL(url));
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
    };
  }, []);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const selectCategory = (categoryName) => {
    setSelectedCategory(categoryName);
    setFormData(prev => ({ ...prev, category: categoryName.toLowerCase() }));
  };

  const shareLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported');
      return;
    }

    toast.loading('Getting location...');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude.toFixed(6);
        const lon = position.coords.longitude.toFixed(6);
        setFormData(prev => ({ ...prev, location: { lat, lon } }));
        toast.dismiss();
        toast.success('Location captured!');
        
        // Initialize map after a brief delay to ensure DOM is ready
        setTimeout(() => initMap(lat, lon), 100);
      },
      (err) => {
        toast.dismiss();
        toast.error('Unable to get location');
      }
    );
  };

  const initMap = (lat, lon) => {
    const mapContainer = document.getElementById('location-map');
    if (!mapContainer) return;

    // Clear any existing map
    mapContainer.innerHTML = '';

    // Create Leaflet map
    const L = window.L;
    if (!L) {
      console.error('Leaflet not loaded');
      return;
    }

    const map = L.map('location-map', {
      center: [lat, lon],
      zoom: 15,
      scrollWheelZoom: false
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    L.marker([lat, lon]).addTo(map);

    // Make map clickable to open in new tab
    mapContainer.style.cursor = 'pointer';
    mapContainer.onclick = () => {
      window.open(`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=15/${lat}/${lon}`, '_blank');
    };
  };

  // Voice input
  const startVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error('Voice input not supported in your browser');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-IN';

    recognition.onstart = () => {
      setIsListening(true);
      toast.success('Listening... Speak now');
    };

    recognition.onresult = (event) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript + ' ';
        }
      }
      if (finalTranscript) {
        setFormData(prev => ({
          ...prev,
          description: prev.description + finalTranscript
        }));
      }
    };

    recognition.onerror = () => {
      setIsListening(false);
      toast.error('Voice input error');
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopVoiceInput = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  // Image compression
  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          const maxDimension = 1920;
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = (height / width) * maxDimension;
              width = maxDimension;
            } else {
              width = (width / height) * maxDimension;
              height = maxDimension;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          canvas.getContext('2d').drawImage(img, 0, 0, width, height);
          
          canvas.toBlob((blob) => {
            resolve(new File([blob], file.name, { type: 'image/jpeg', lastModified: Date.now() }));
          }, 'image/jpeg', 0.8);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  // Photo handlers
  const handlePhotoSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    
    const validPhotos = files.filter(f => f.type.startsWith('image/'));
    if (validPhotos.length === 0) {
      toast.error('Please select valid image files');
      return;
    }
    
    if (validPhotos.length + selectedPhotos.length > 5) {
      toast.error('Maximum 5 photos allowed');
      return;
    }

    const toastId = toast.loading('Compressing images...');
    const compressed = await Promise.all(validPhotos.map(compressImage));
    toast.dismiss(toastId);
    
    setSelectedPhotos(prev => [...prev, ...compressed]);
    const previews = compressed.map(f => URL.createObjectURL(f));
    setPhotoPreviews(prev => [...prev, ...previews]);
    
    e.target.value = '';
  };

  const removeSelectedPhoto = (index) => {
    URL.revokeObjectURL(photoPreviews[index]);
    setSelectedPhotos(prev => prev.filter((_, i) => i !== index));
    setPhotoPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const uploadPhotos = async () => {
    if (selectedPhotos.length === 0) {
      toast.error('No photos selected');
      return;
    }

    setUploadingPhotos(true);
    const toastId = toast.loading(`Uploading ${selectedPhotos.length} photo(s)...`);

    try {
      const token = localStorage.getItem('token');
      const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
      
      const formData = new FormData();
      selectedPhotos.forEach(photo => formData.append('files', photo));

      const response = await fetch(`${BASE_URL}/upload/multiple`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        setUploadedPhotos(prev => [...prev, ...result.data]);
        setSelectedPhotos([]);
        setPhotoPreviews([]);
        toast.success(`${result.data.length} photo(s) uploaded!`, { id: toastId });
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      toast.error(error.message || 'Upload failed', { id: toastId });
    } finally {
      setUploadingPhotos(false);
    }
  };

  const removeUploadedPhoto = (index) => {
    setUploadedPhotos(prev => prev.filter((_, i) => i !== index));
  };

  // Video handlers
  const handleVideoSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) {
      e.target.value = '';
      return;
    }
    
    if (files.length + selectedVideos.length > 2) {
      toast.error('Maximum 2 videos allowed');
      e.target.value = '';
      return;
    }

    const tooLarge = files.some(f => f.size > 50 * 1024 * 1024);
    if (tooLarge) {
      toast.error('Videos must be under 50MB');
      e.target.value = '';
      return;
    }

    setSelectedVideos(prev => [...prev, ...files]);
    e.target.value = '';
  };

  const removeSelectedVideo = (index) => {
    setSelectedVideos(prev => prev.filter((_, i) => i !== index));
  };

  const uploadVideos = async () => {
    if (selectedVideos.length === 0) {
      toast.error('No videos selected');
      return;
    }

    setUploadingVideos(true);
    const toastId = toast.loading(`Uploading ${selectedVideos.length} video(s)...`);

    try {
      const token = localStorage.getItem('token');
      const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
      
      const formData = new FormData();
      selectedVideos.forEach(video => formData.append('files', video));

      const response = await fetch(`${BASE_URL}/upload/multiple`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        setUploadedVideos(prev => [...prev, ...result.data]);
        setSelectedVideos([]);
        toast.success(`${result.data.length} video(s) uploaded!`, { id: toastId });
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      toast.error(error.message || 'Upload failed', { id: toastId });
    } finally {
      setUploadingVideos(false);
    }
  };

  const removeUploadedVideo = (index) => {
    setUploadedVideos(prev => prev.filter((_, i) => i !== index));
  };

  // Camera capture
  const capturePhoto = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
      
      const video = document.createElement('video');
      video.srcObject = stream;
      video.autoplay = true;
      video.playsInline = true;
      
      const canvas = document.createElement('canvas');
      const overlay = document.createElement('div');
      overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.95);z-index:9999;display:flex;flex-direction:column;justify-content:center;align-items:center;';
      
      video.style.cssText = 'max-width:90%;max-height:70vh;border-radius:12px;';
      
      const captureBtn = document.createElement('button');
      captureBtn.textContent = '📸 Capture';
      captureBtn.style.cssText = 'margin-top:20px;padding:15px 40px;background:#10b981;color:white;border:none;border-radius:12px;font-size:18px;font-weight:bold;cursor:pointer;';
      
      const closeBtn = document.createElement('button');
      closeBtn.textContent = '✕ Close';
      closeBtn.style.cssText = 'margin-top:10px;padding:10px 30px;background:#ef4444;color:white;border:none;border-radius:8px;cursor:pointer;';
      
      overlay.appendChild(video);
      overlay.appendChild(captureBtn);
      overlay.appendChild(closeBtn);
      document.body.appendChild(overlay);
      
      const cleanup = () => {
        stream.getTracks().forEach(track => track.stop());
        document.body.removeChild(overlay);
      };
      
      captureBtn.onclick = async () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0);
        
        canvas.toBlob(async (blob) => {
          const file = new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
          const compressed = await compressImage(file);
          
          setSelectedPhotos(prev => [...prev, compressed]);
          setPhotoPreviews(prev => [...prev, URL.createObjectURL(compressed)]);
          
          cleanup();
          toast.success('Photo captured!');
        }, 'image/jpeg', 0.8);
      };
      
      closeBtn.onclick = cleanup;
      
    } catch (err) {
      toast.error('Camera access denied');
    }
  };

  const recordVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: true });
      
      let mediaRecorder;
      let chunks = [];
      
      const video = document.createElement('video');
      video.srcObject = stream;
      video.autoplay = true;
      video.muted = true;
      video.playsInline = true;
      
      const overlay = document.createElement('div');
      overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.95);z-index:9999;display:flex;flex-direction:column;justify-content:center;align-items:center;';
      
      video.style.cssText = 'max-width:90%;max-height:70vh;border-radius:12px;';
      
      const startBtn = document.createElement('button');
      startBtn.textContent = '🔴 Start Recording';
      startBtn.style.cssText = 'margin-top:20px;padding:15px 40px;background:#ef4444;color:white;border:none;border-radius:12px;font-size:18px;font-weight:bold;cursor:pointer;';
      
      const stopBtn = document.createElement('button');
      stopBtn.textContent = '⏹️ Stop';
      stopBtn.style.cssText = 'margin-top:10px;padding:15px 40px;background:#f59e0b;color:white;border:none;border-radius:12px;font-size:18px;font-weight:bold;cursor:pointer;display:none;';
      
      const closeBtn = document.createElement('button');
      closeBtn.textContent = '✕ Close';
      closeBtn.style.cssText = 'margin-top:10px;padding:10px 30px;background:#6b7280;color:white;border:none;border-radius:8px;cursor:pointer;';
      
      const timer = document.createElement('div');
      timer.style.cssText = 'color:white;font-size:24px;font-weight:bold;margin-top:10px;display:none;';
      
      overlay.appendChild(video);
      overlay.appendChild(startBtn);
      overlay.appendChild(stopBtn);
      overlay.appendChild(timer);
      overlay.appendChild(closeBtn);
      document.body.appendChild(overlay);
      
      let interval;
      let seconds = 0;
      
      const cleanup = () => {
        stream.getTracks().forEach(track => track.stop());
        if (interval) clearInterval(interval);
        document.body.removeChild(overlay);
      };
      
      startBtn.onclick = () => {
        mediaRecorder = new MediaRecorder(stream);
        chunks = [];
        
        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunks.push(e.data);
        };
        
        mediaRecorder.onstop = () => {
          const blob = new Blob(chunks, { type: 'video/webm' });
          const file = new File([blob], `video-${Date.now()}.webm`, { type: 'video/webm' });
          
          if (file.size > 50 * 1024 * 1024) {
            toast.error('Video too large (max 50MB)');
          } else {
            setSelectedVideos(prev => [...prev, file]);
            toast.success('Video recorded!');
          }
          
          cleanup();
        };
        
        mediaRecorder.start();
        startBtn.style.display = 'none';
        stopBtn.style.display = 'block';
        timer.style.display = 'block';
        
        interval = setInterval(() => {
          seconds++;
          const mins = Math.floor(seconds / 60);
          const secs = seconds % 60;
          timer.textContent = `⏱️ ${mins}:${secs.toString().padStart(2, '0')}`;
        }, 1000);
      };
      
      stopBtn.onclick = () => {
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
          mediaRecorder.stop();
        }
      };
      
      closeBtn.onclick = cleanup;
      
    } catch (err) {
      toast.error('Camera access denied');
    }
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone || !formData.address || !formData.category || !formData.description) {
      toast.error('Please fill all required fields');
      return;
    }

    if (formData.category === 'other' && !formData.otherCategory) {
      toast.error('Please specify category');
      return;
    }

    if (selectedPhotos.length > 0 || selectedVideos.length > 0) {
      toast.error('Please upload all selected files before submitting');
      return;
    }

    setLoading(true);
    const toastId = toast.loading('Submitting grievance...');

    try {
      const token = localStorage.getItem('token');
      const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

      const grievanceData = {
        title: formData.description.substring(0, 50),
        description: formData.description,
        category: formData.category === 'other' ? formData.otherCategory : formData.category,
        priority: 'medium',
        location: formData.location?.lat ? `${formData.location.lat}, ${formData.location.lon}` : formData.address,
        uploadedAttachments: [
          ...uploadedPhotos.map(p => ({ url: p.url, publicId: p.publicId, type: 'image' })),
          ...uploadedVideos.map(v => ({ url: v.url, publicId: v.publicId, type: 'video' }))
        ]
      };

      const response = await fetch(`${BASE_URL}/grievances`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(grievanceData)
      });

      const result = await response.json();

      if (result.success) {
        const trackingId = result.data.trackingId || result.data._id?.slice(-6) || 'PENDING';
        toast.success(`Submitted! Tracking ID: ${trackingId}`, { id: toastId, duration: 5000 });
        
        setTimeout(() => navigate('/dashboard'), 2000);
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      toast.error(error.message || 'Submission failed', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { name: 'Water', icon: '💧' },
    { name: 'Waste', icon: '🗑️' },
    { name: 'Roads', icon: '🛣️' },
    { name: 'Electric', icon: '⚡' },
    { name: 'Other', icon: '📋' },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f0fdf4' }}>
      {/* Header */}
      <div className="pt-24 pb-8 text-center">
        <div className="inline-block bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-xs font-bold uppercase mb-4">
          REPORT AN ISSUE
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">File New Grievance</h1>
        <p className="text-gray-600 max-w-2xl mx-auto px-4">
          Help us serve you better. Report civic issues with photos and location for faster resolution.
        </p>
      </div>

      {/* Form Container */}
      <div className="max-w-3xl mx-auto px-4 pb-20">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          
          {/* Form Header */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 flex items-center justify-between border-b">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg">📝</span>
              </div>
              <div>
                <h2 className="font-bold text-lg text-gray-800">New Complaint Form</h2>
                <p className="text-xs text-gray-500">Fields marked with * are required</p>
              </div>
            </div>
            <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              Ready
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-8">
            
            {/* 1. Your Information */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-lg">👤</span>
                </div>
                <h3 className="text-base font-bold text-gray-800">1. Your Information</h3>
              </div>

              <div className="space-y-3">
                <div className="grid md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Full Name *</label>
                    <input
                      type="text"
                      id="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-100 focus:outline-none text-sm"
                      placeholder="Jamunesh Sheta"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Phone Number *</label>
                    <input
                      type="tel"
                      id="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-100 focus:outline-none text-sm"
                      placeholder="+91 98765 43210"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Email Address (Optional)</label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-100 focus:outline-none text-sm"
                    placeholder="jsheta15@gmail.com"
                  />
                  <p className="text-xs text-gray-400 mt-1">We'll send updates to your email if provided</p>
                </div>
              </div>
            </div>

            {/* 2. Select Category */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <span className="text-lg">📁</span>
                </div>
                <h3 className="text-base font-bold text-gray-800">2. Select Category *</h3>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3">
                {categories.map((cat) => (
                  <button
                    key={cat.name}
                    type="button"
                    onClick={() => selectCategory(cat.name)}
                    className={`p-3 sm:p-4 rounded-xl border-2 transition-all text-center ${
                      selectedCategory === cat.name
                        ? 'border-green-500 bg-green-50 shadow-md'
                        : 'border-gray-200 hover:border-green-300 bg-white'
                    }`}
                  >
                    <div className="text-2xl sm:text-3xl mb-1">{cat.icon}</div>
                    <div className="text-[10px] sm:text-xs font-semibold text-gray-700">{cat.name}</div>
                  </button>
                ))}
              </div>

              {selectedCategory === 'Other' && (
                <input
                  type="text"
                  id="otherCategory"
                  value={formData.otherCategory}
                  onChange={handleInputChange}
                  placeholder="Specify category"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-100 focus:outline-none text-sm mt-3"
                />
              )}
            </div>

            {/* 3. Add Photos & Videos */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-lg">📷</span>
                </div>
                <h3 className="text-base font-bold text-gray-800">3. Add Photos & Videos</h3>
                <span className="text-xs text-gray-400">(Optional)</span>
              </div>

              {/* Photos Section */}
              <div className="mb-6">
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  📷 Upload Photos (Max 5)
                </label>
                
                {/* Selected Photos */}
                {selectedPhotos.length > 0 && (
                  <div className="mb-3 p-3 bg-gray-50 rounded-xl">
                    <div className="flex flex-wrap gap-2 mb-2">
                      {photoPreviews.map((preview, idx) => (
                        <div key={idx} className="relative group">
                          <img src={preview} alt="" className="w-16 h-16 object-cover rounded-lg border-2 border-gray-200" />
                          <button
                            type="button"
                            onClick={() => removeSelectedPhoto(idx)}
                            className="absolute -top-1 -right-1 bg-red-500 text-white w-5 h-5 rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={uploadPhotos}
                      disabled={uploadingPhotos}
                      className="w-full bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 disabled:opacity-50 transition"
                    >
                      {uploadingPhotos ? '⏳ Uploading...' : '☁️ Upload Photos'}
                    </button>
                  </div>
                )}

                {/* Upload Buttons */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={capturePhoto}
                    className="flex-1 bg-blue-500 text-white py-2.5 px-4 rounded-xl text-sm font-semibold hover:bg-blue-600 transition flex items-center justify-center gap-2"
                  >
                    📸 Capture Photo
                  </button>
                  <label className="flex-1 bg-green-500 text-white py-2.5 px-4 rounded-xl text-sm font-semibold hover:bg-green-600 transition cursor-pointer flex items-center justify-center gap-2">
                    🖼️ Browse Photos
                    <input
                      ref={photoInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handlePhotoSelect}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Uploaded Photos */}
                {uploadedPhotos.length > 0 && (
                  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-xl">
                    <p className="text-xs font-semibold text-green-700 mb-2">✅ Uploaded Photos ({uploadedPhotos.length})</p>
                    <div className="flex flex-wrap gap-2">
                      {uploadedPhotos.map((photo, idx) => (
                        <div key={idx} className="relative group">
                          <img src={photo.url} alt="" className="w-14 h-14 object-cover rounded-lg border border-green-300" />
                          <button
                            type="button"
                            onClick={() => removeUploadedPhoto(idx)}
                            className="absolute -top-1 -right-1 bg-red-500 text-white w-4 h-4 rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <p className="text-xs text-gray-400 mt-2">
                  Supported: JPG, PNG, GIF • Max 5 photos • Photos are compressed automatically
                </p>
              </div>

              {/* Videos Section */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  🎥 Upload Videos (Max 2, 50MB each)
                </label>
                
                {/* Selected Videos */}
                {selectedVideos.length > 0 && (
                  <div className="mb-3 p-3 bg-gray-50 rounded-xl space-y-2">
                    {selectedVideos.map((video, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-white p-2 rounded-lg border border-gray-200">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">🎥</span>
                          <div>
                            <p className="text-xs font-medium text-gray-700">{video.name}</p>
                            <p className="text-xs text-gray-400">{(video.size / (1024 * 1024)).toFixed(1)} MB</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeSelectedVideo(idx)}
                          className="text-red-500 hover:text-red-700 text-xs font-bold"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={uploadVideos}
                      disabled={uploadingVideos}
                      className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-purple-700 disabled:opacity-50 transition"
                    >
                      {uploadingVideos ? '⏳ Uploading...' : '☁️ Upload Videos'}
                    </button>
                  </div>
                )}

                {/* Upload Buttons */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={recordVideo}
                    className="flex-1 bg-red-500 text-white py-2.5 px-4 rounded-xl text-sm font-semibold hover:bg-red-600 transition flex items-center justify-center gap-2"
                  >
                    🎬 Record Video
                  </button>
                  <label className="flex-1 bg-purple-500 text-white py-2.5 px-4 rounded-xl text-sm font-semibold hover:bg-purple-600 transition cursor-pointer flex items-center justify-center gap-2">
                    📹 Browse Videos
                    <input
                      ref={videoInputRef}
                      type="file"
                      multiple
                      onChange={handleVideoSelect}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Uploaded Videos */}
                {uploadedVideos.length > 0 && (
                  <div className="mt-3 p-3 bg-purple-50 border border-purple-200 rounded-xl">
                    <p className="text-xs font-semibold text-purple-700 mb-2">✅ Uploaded Videos ({uploadedVideos.length})</p>
                    <div className="space-y-2">
                      {uploadedVideos.map((video, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-white p-2 rounded-lg border border-purple-200">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">📹</span>
                            <p className="text-xs font-medium text-gray-700">{video.filename}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeUploadedVideo(idx)}
                            className="text-red-500 hover:text-red-700 text-xs font-bold"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <p className="text-xs text-gray-400 mt-2">
                  Any video format • Max 2 videos, 50MB each
                </p>
              </div>
            </div>

            {/* 4. Voice Note / Describe Issue */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-lg">🎙️</span>
                </div>
                <h3 className="text-base font-bold text-gray-800">4. Voice Note / Describe Issue *</h3>
              </div>

              <div className="relative">
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="5"
                  placeholder="Describe the problem, location, and details (minimum 20 characters) or use voice note..."
                  className="w-full px-3 py-3 pr-12 border border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-100 focus:outline-none text-sm resize-none"
                  required
                />
                <button
                  type="button"
                  onClick={isListening ? stopVoiceInput : startVoiceInput}
                  className={`absolute bottom-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition ${
                    isListening ? 'bg-red-500 animate-pulse' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  <span className={isListening ? 'text-white' : 'text-gray-600'}>🎤</span>
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {formData.description.length} / 500 characters
              </p>
            </div>

            {/* 5. Location Details */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <span className="text-lg">📍</span>
                </div>
                <h3 className="text-base font-bold text-gray-800">5. Location Details</h3>
              </div>

              <button
                type="button"
                onClick={shareLocation}
                className="w-full bg-gradient-to-r from-orange-400 to-yellow-400 text-white py-3 px-4 rounded-xl text-sm font-bold hover:from-orange-500 hover:to-yellow-500 transition mb-3 flex items-center justify-center gap-2"
              >
                📍 Share Live Location
              </button>
              <p className="text-xs text-gray-400 mb-3">Click to auto-detect your current location</p>

              {/* Location Captured Display */}
              {formData.location && (
                <div className="mb-4 p-4 bg-green-50 border-2 border-green-200 rounded-xl">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-lg">✓</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-sm text-green-700 mb-1">LOCATION CAPTURED</h4>
                      <p className="text-sm text-green-600 mb-2">Your location has been captured successfully!</p>
                      <p className="text-xs text-green-600 font-mono">
                        Lat: {formData.location.lat}, Lon: {formData.location.lon}
                      </p>
                    </div>
                  </div>
                  
                  {/* Map Container */}
                  <div 
                    id="location-map" 
                    className="w-full h-64 rounded-lg border-2 border-green-300 overflow-hidden mb-2"
                    style={{ background: '#f0f0f0' }}
                  ></div>
                  
                  <p className="text-xs text-green-600 flex items-center gap-1">
                    📍 Click on the map to open in full view. Verify the location before submitting.
                  </p>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Address / Landmark *</label>
                <input
                  type="text"
                  id="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Near Govt School, Sector 4, Main Road"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-100 focus:outline-none text-sm"
                  required
                />
              </div>
            </div>

            {/* Need Help Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-bold">ℹ️</span>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-blue-900 mb-1">Need Help?</h4>
                  <p className="text-xs text-blue-700">
                    After submission, you'll receive a unique Ticket ID via SMS. Use it to track your complaint status in real-time.
                  </p>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 bg-white border-2 border-gray-200 text-gray-700 py-3 rounded-xl text-sm font-bold hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-green-600 text-white py-3 rounded-xl text-sm font-bold hover:bg-green-700 disabled:opacity-50 transition flex items-center justify-center gap-2"
              >
                {loading ? '⏳ Submitting...' : '📤 Submit Complaint'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
