'use client'
import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog'
import { Button } from './ui/button'
import { toast } from "sonner"
import { Plus, UploadIcon } from 'lucide-react'
import axios from 'axios'

interface UploadModalProps {
  space_id: string // Receive space_id from parent
}

const UploadModal = ({ space_id }: UploadModalProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a file first")
      return
    }
    
    setIsLoading(true)
    try {
      const formData = new FormData()
      formData.append('files', file) // "files" matches backend parameter name

      const response = await axios.post(
        `http://127.0.0.1:8001/upload/?space_id=${space_id}`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' }
        }
      )

      toast.success("File uploaded successfully!")
      setIsOpen(false)
    } catch (error) {
      toast.error("Upload failed - check console for details")
      console.error('Upload error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <Button 
        variant="outline" 
        className="w-full justify-start gap-2 bg-gray-300 hover:bg-gray-500 text-black mb-4"
        onClick={() => setIsOpen(true)}
      >
        <Plus className="h-4 w-4" />
        Add source
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload a File</DialogTitle>
            <DialogDescription>
              Select a file to upload and click the submit button.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex items-center justify-center w-full mt-4">
            <label
              htmlFor="dropzone-file"
              className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <UploadIcon className="w-10 h-10 text-gray-400" />
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">PDF, DOCX, PPTX (MAX 50 MB)</p>
              </div>
              <input 
                id="dropzone-file" 
                type="file" 
                className="hidden" 
                onChange={handleFileChange} 
              />
            </label>
          </div>

          {file && (
            <div className="flex items-center justify-between mt-4">
              <div>
                <p className="font-medium">{file.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(file.size / 1024).toFixed(2)} KB
                </p>
              </div>
              <Button 
                onClick={handleUpload} 
                disabled={isLoading}
                className="bg-blue-500 hover:bg-blue-600"
              >
                {isLoading ? 'Uploading...' : 'Upload'}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default UploadModal