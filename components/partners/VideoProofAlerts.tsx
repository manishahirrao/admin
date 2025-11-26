'use client';

import React, { useState } from 'react';
import { AlertTriangle, Upload, X, Video } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

interface PendingVideo {
  id: string;
  ritual_name: string;
  devotee_name: string;
  scheduled_time: string;
  hours_overdue: number;
}

interface VideoProofAlertsProps {
  pendingVideos: PendingVideo[];
  onUpload: () => void;
}

export function VideoProofAlerts({ pendingVideos, onUpload }: VideoProofAlertsProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  const handleUploadClick = async (videoId: string) => {
    setUploadingId(videoId);
    // Open file picker
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'video/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        await uploadVideo(videoId, file);
      }
      setUploadingId(null);
    };
    input.click();
  };

  const uploadVideo = async (videoId: string, file: File) => {
    try {
      // Create form data
      const formData = new FormData();
      formData.append('video', file);
      formData.append('bookingId', videoId);

      // Upload to API
      const response = await fetch('/api/orders/video-proof', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      // Refresh data
      onUpload();
    } catch (error) {
      console.error('Error uploading video:', error);
      alert('Failed to upload video. Please try again.');
    }
  };

  if (pendingVideos.length === 0) return null;

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg">
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-red-100 rounded-full">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="font-semibold text-red-900">
              Pending Video Proofs
            </h3>
            <p className="text-sm text-red-700">
              {pendingVideos.length} ritual{pendingVideos.length !== 1 ? 's' : ''} awaiting video upload (>48 hours)
            </p>
          </div>
        </div>
        <button
          className="p-1 hover:bg-red-100 rounded transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
        >
          <X className={`w-5 h-5 text-red-600 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-red-200 p-4 space-y-3">
          {pendingVideos.map((video) => (
            <div
              key={video.id}
              className="bg-white rounded-lg p-4 border border-red-200 flex items-center justify-between"
            >
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <Video className="w-4 h-4 text-gray-400" />
                  <h4 className="font-medium text-gray-900">{video.ritual_name}</h4>
                </div>
                <p className="text-sm text-gray-600">
                  Devotee: {video.devotee_name}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Scheduled: {format(new Date(video.scheduled_time), 'MMM dd, yyyy hh:mm a')}
                </p>
                <p className="text-xs text-red-600 font-medium mt-1">
                  Overdue by {video.hours_overdue} hours
                </p>
              </div>

              <button
                onClick={() => handleUploadClick(video.id)}
                disabled={uploadingId === video.id}
                className="ml-4 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {uploadingId === video.id ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>Upload Video</span>
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
