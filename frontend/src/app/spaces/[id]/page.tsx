'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import axios from 'axios';
import ChatPanel from '@/components/Chatpanel';
import Studiopanel from '@/components/Studiopanel';
import SourcesPanel from '@/components/SourcesPanel';

export default function SpacePage() {
  const params = useParams(); // Access route parameters

  const spaceId = params.id as string; // Extract the space_id and ensure it's a string
 
  interface SpaceData {
    space_name: string;
    // Add other properties of spaceData here
  }

  const [spaceData, setSpaceData] = useState<SpaceData | null>(null);
  const [documents, setDocuments] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  useEffect(() => {
    // Fetch data for the specific space using spaceId
    axios.get(`http://127.0.0.1:8001/spaces/${spaceId}/documents`)
      .then((response) => {
        setSpaceData(response.data);
        setDocuments(response.data.documents);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [spaceId]); // Re-run effect if spaceId changes

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className='min-h-screen bg-gradient-to-b from-background via-background to-background/80 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950'>
      <header className="border-b border-zinc-800 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-zinc-800"></div>
            <h1 className="text-lg font-medium text-zinc-100"> {spaceData ? spaceData.space_name : 'Loading...'} </h1>
          </div>
          
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-[300px_1fr_300px] h-[calc(100vh-73px)]">
        {/* Sources Panel */}
        <SourcesPanel documents={documents} space_id={spaceId}/>

        {/* Chat Panel */}
        <ChatPanel spaceId={spaceId}/>

        {/* Studio Panel */}
        <Studiopanel spaceId={spaceId}/>
      </div>

    </div>
  );
}