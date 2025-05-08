import React from 'react'
import { Button } from './ui/button'
import { FileText } from 'lucide-react'
import Uploadmodal from './Uploadmodal'
import axios from 'axios'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'

interface SourcesPanelProps {
    space_id: string,
    documents: string[],
}

const SourcesPanel: React.FC<SourcesPanelProps> = ({ documents, space_id }) => {
  
  const ingestMutation = useMutation({
    mutationFn: async () => {
      return await axios.post(`http://127.0.0.1:8001/ingestion/${space_id}`)
    },
    onSuccess: () => {
      toast.success("Documents ingested successfully!")
    },
    onError: (error) => {
      toast.error("Failed to ingest documents")
      console.error('Ingestion error:', error)
    }
  })

  const handleIngest = () => {
    ingestMutation.mutate()
  }

  return (
    <div className="border-r border-zinc-800 p-4 h-[calc(100vh-73px)] flex flex-col">
      {/* Header */}
     
      <Uploadmodal space_id={space_id}/>

      {/* Scrollable content container */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-2">
        {documents.length === 0 ? (
          <div className="space-y-2 flex items-center flex-col">
            <FileText className="h-12 w-12" />
            <p>Saved sources will appear here</p>
            <p className="text-sm">
              Click Add source above to add PDFs, websites, text, videos, or audio files. Or import a file directly
              from Google Drive.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {documents.map((doc, index) => (
              <div key={index} className="flex items-center gap-2 text-gray-400 border border-zinc-800 p-2 rounded-lg">
                <FileText className="h-6 w-6" />
                <p className='text-sm'>{doc}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Fixed position button at bottom */}
      {documents.length > 0 && (
        <div className="mt-4">
          <Button 
            className="w-full bg-gray-300 hover:bg-gray-400" 
            onClick={handleIngest}
            disabled={ingestMutation.isPending}
          >
            {ingestMutation.isPending ? "Ingesting..." : "Ingest"}
          </Button>
        </div>
      )}
    </div>
  )
}

export default SourcesPanel