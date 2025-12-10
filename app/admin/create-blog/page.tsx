'use client'; 

import React, { useState } from 'react';
import Link from "next/link";

// Simplified type for Portable Text structure
type SimplePortableText = { _type: "block"; children: { _type: "span"; text: string; }[] }[];

interface BlogSubmissionData {
  title: string;
  metaDesc: string;
  slug: string;
  portableText: SimplePortableText;
  blogImageFile: File | null; 
}

const initialData: BlogSubmissionData = {
  title: '',
  metaDesc: '',
  slug: '',
  portableText: [{
    _type: "block",
    children: [{ _type: "span", text: "" }],
  }],
  blogImageFile: null,
};

export default function CreatePostForm() {
  const [formData, setFormData] = useState<BlogSubmissionData>(initialData);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // 1. Handle File Input (using TypeScript Type Guard)
    if (name === 'blogImageFile') {
        const input = e.target as HTMLInputElement;
        const files = input.files; 
        
        if (files && files.length > 0) {
            setFormData(prev => ({ ...prev, blogImageFile: files[0] }));
        } else {
            setFormData(prev => ({ ...prev, blogImageFile: null }));
        }
        return; 
    }

    // 2. Handle Text Input
    if (name === 'title') {
      // Automatically generate a slug from the title
      const newSlug = value.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-');
      setFormData(prev => ({ ...prev, slug: newSlug, title: value }));
      
    } else if (name === 'content') {
      // Map textarea content to a basic Portable Text block
      setFormData(prev => ({
          ...prev,
          portableText: [{
              _type: "block",
              children: [{ _type: "span", text: value }],
          }],
      }));
      
    } else {
      // Handle metaDesc
      setFormData(prev => ({ ...prev, [name]: value as string }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');
    
    if (!formData.blogImageFile) {
        setStatus('error');
        setMessage('Error: Please select a blog image.');
        return;
    }

    try {
      // 1. Prepare data for server using FormData (required for file uploads)
      const data = new FormData();
      data.append('title', formData.title);
      data.append('metaDesc', formData.metaDesc);
      data.append('slug', formData.slug);
      data.append('portableText', JSON.stringify(formData.portableText)); // Must be stringified
      data.append('blogImageFile', formData.blogImageFile); // Append the actual file

      // 2. Send request to the Route Handler
      const response = await fetch('/api/blog/create', { 
        method: 'POST',
        // IMPORTANT: Omit Content-Type header when using FormData
        body: data, 
      });

      const result = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage(`Success! Post ID: ${result.id}`);
        setFormData(initialData); // Clear form
      } else {
        setStatus('error');
        // Ensure error from Route Handler is displayed
        setMessage(`Error: ${result.message || result.error || 'Unknown server error'}`);
      }
    } catch (error) {
      setStatus('error');
      setMessage(`Network error: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  // Helper function to determine button and message styles
  const buttonClasses = status === 'loading'
    ? 'bg-indigo-400 cursor-not-allowed'
    : 'bg-indigo-600 hover:bg-indigo-700 transition duration-150';

  const messageClasses = status === 'success'
    ? 'text-green-600 bg-green-50 p-3 rounded-md border border-green-200'
    : status === 'error'
      ? 'text-red-600 bg-red-50 p-3 rounded-md border border-red-200'
      : '';

  return (
    <div>
            <Link 
          href="/"
          className="w-30 m-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-150 ease-in-out flex items-center space-x-2"
        >
          <span>🔙 Back</span>
        </Link>
    <div className="flex flex-col justify-center items-center min-h-screen p-4 sm:p-6">

      <div className="w-full max-w-3xl bg-white shadow-xl rounded-lg border border-gray-200 p-6 sm:p-8">
        
        <h1 className="text-3xl font-bold text-gray-800 mb-6">📝 Create New Blog Post</h1>
        
        <form onSubmit={handleSubmit} className="grid gap-4">
          
          {/* Title Input */}
          <input 
            type="text" 
            name="title" 
            value={formData.title} 
            onChange={handleInputChange} 
            placeholder="Blog Title" 
            required 
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-lg font-semibold text-gray-900" 
          />
          
          {/* Slug Input */}
          <div className="relative">
              <input 
                type="text" 
                name="slug" 
                value={formData.slug} 
                onChange={handleInputChange} 
                placeholder="Slug (e.g., my-awesome-post)" 
                required 
                disabled 
                className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-900 cursor-not-allowed"
              />
              <span className="absolute right-3 top-3 text-sm text-gray-400">URL Slug</span>
          </div>
          
          {/* Image Upload Input */}
          <div>
            <label htmlFor="blogImageFile" className="block text-sm font-medium text-gray-700 mb-1">Blog Main Image</label>
            <input 
              type="file" 
              name="blogImageFile" 
              id="blogImageFile"
              onChange={handleInputChange} 
              accept="image/*"
              required
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
          </div>
          
          {/* Meta Description */}
          <textarea 
            name="metaDesc" 
            value={formData.metaDesc} 
            onChange={handleInputChange} 
            placeholder="Meta Description (for SEO)" 
            rows={3}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
          />

          {/* Content Input */}
          <textarea 
            name="content" 
            onChange={handleInputChange} 
            placeholder="Blog Content (Enter your text here)" 
            rows={15}
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 font-mono text-gray-900"
          />

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={status === 'loading'}
            className={`w-full py-3 mt-4 text-white font-semibold rounded-lg shadow-md ${buttonClasses}`}
          >
            {status === 'loading' ? 'Posting...' : '🚀 Publish Post'}
          </button>
        </form>
        
        {/* Status Message */}
        {message && (
          <p className={`mt-5 text-sm ${messageClasses}`}>
            **Status:** {message}
          </p>
        )}
      </div>
    </div>
    </div>
    // Outer container ensures the form block is centered vertically in the viewport

  );
}