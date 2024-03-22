'use client'

import React, { useState } from 'react';

interface FormData {
  title: string | undefined;
  image?: File;
}

const ImageForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    title: ''
  });

 
  const fileToBase64 = async(file: File) => {
    return new Promise((resolve, reject) => {
      // Create a new FileReader instance
      const reader = new FileReader();
  
      // Set up onload event handler to resolve the promise with the Base64 string
      reader.onload = () => {
        // The result attribute contains the data as a base64-encoded string
        resolve(reader.result);
      };
  
      // Set up onerror event handler to reject the promise in case of an error
      reader.onerror = (error) => {
        reject(error);
      };
  
      // Read the file as a data URL (which will be Base64 encoded)
      reader.readAsDataURL(file);
    });
    
  }  

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    // Handle image file state correctly, react won't set it properly by default
    if (type === 'file') {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        setFormData((prevFormData) => ({
          ...prevFormData,
          [name]: file,
        }));          
      }
    } else {
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    let imageUrl = null;

    // if image is provided, upload to google bucket
    if (formData.image) {
      const imageFile = formData.image;
      const imageBase64 = await fileToBase64(imageFile);
      const fileExtension = (imageFile.name.split('.').pop())!;
     
      const fileName = formData.title! + "." + fileExtension;

      try {
        const response = await fetch('/api/uploadimg', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            imageData: imageBase64,
            fileName: fileName
          }),
        });
        
        const responseData = await response.json();
  
        if (response.ok) {
          imageUrl = responseData.imageUrl;
          console.log(`Image url is ${imageUrl}`);
        } else {
        }
    
      } catch (error) {
      }
    }


    setFormData({
      title: '',
      image: undefined
    });
  };
  
  return (
      <div className="overflow-y-auto max-h-[90vh] sm:max-h-[85vh] md:max-h-[80vh] lg:max-h-[75vh] px-4 py-2">
        <div className="flex items-center justify-center max-h-0.9">
          <div className="fixed inset-0 bg-gray-800 opacity-50"></div>
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full relative">
            <form onSubmit={handleSubmit} className="max-w-xl mx-auto">
              <div className="mb-4">
                <label htmlFor="title" className="block text-gray-700 font-bold mb-2">Title</label>
                <input type="text" id="title" name="title" value={formData.title} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
              </div>
              <div className="mb-4">
                <label htmlFor="image" className="block text-gray-700 font-bold mb-2">Image</label>
                <input type="file" id="image" name="image" required accept="image/*" onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
              </div>              
              <div className="flex justify-between">
                <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Submit</button>
              </div>
            </form>
          </div>
        </div>
      </div>
  );
};

export default ImageForm;