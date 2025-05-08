import React, { useState, useEffect, useRef } from 'react'
import { Button } from './ui/button'
import { FileText, Info, MessageSquare, Play, Pause, Loader2, Volume2 } from 'lucide-react'
import { Input } from './ui/input'
import { useMutation, useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { toast } from 'sonner'

interface StudiopanelProps {
  spaceId: string
}

function Studiopanel({ spaceId }: StudiopanelProps) {
  const [focusTopic, setFocusTopic] = useState('')
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [transcript, setTranscript] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const audioRef = React.useRef<HTMLAudioElement | null>(null)

  // Query to fetch the latest podcast for this space
  const latestPodcastQuery = useQuery({
    queryKey: ['podcast', spaceId],
    queryFn: async () => {
      const response = await axios.get(`http://127.0.0.1:8001/podcast/${spaceId}`)
      return response.data
    },
  })

  // Use useEffect to update state based on query results
  useEffect(() => {
    if (latestPodcastQuery.data?.data) {
      setAudioUrl(`http://127.0.0.1:8001${latestPodcastQuery.data.data.audio_url}`)
      setTranscript(latestPodcastQuery.data.data.transcript)
    }
  }, [latestPodcastQuery.data])

  const podcastMutation = useMutation({
    mutationFn: async (topic: string) => {
      const response = await axios.post(`http://127.0.0.1:8001/createpodcast/${spaceId}`, {
        focus_topic: topic
      })
      return response.data
    },
    onSuccess: (data) => {
      toast.success("Podcast generated successfully!")
      setAudioUrl(`http://127.0.0.1:8001${data.data.audio_url}`)
      setTranscript(data.data.transcript)
      // Invalidate the query to refetch the latest podcast
      // latestPodcastQuery.refetch()
    },
    onError: (error) => {
      toast.error("Failed to generate podcast")
      console.error('Podcast generation error:', error)
    }
  })

  const handleGeneratePodcast = () => {
    podcastMutation.mutate(focusTopic)
  }

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
    };
  }, [audioUrl]);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  return (
    <div className="border-l border-zinc-800 p-4 space-y-8">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-zinc-100">Audio Overview</h3>
          <Button variant="ghost" size="icon">
            <Info className="h-4 w-4 text-zinc-400" />
          </Button>
        </div>
        <div className="rounded-lg border border-zinc-800 p-4 space-y-4">
          <div className="flex gap-3">
            <div className="h-10 w-10 rounded-lg bg-zinc-800 flex items-center justify-center">
              <MessageSquare className="h-5 w-5 text-zinc-400" />
            </div>
            <div>
              <p className="text-zinc-100">Deep Dive conversation</p>
              <p className="text-sm text-zinc-500">Expert and Novice hosts discussion (English only)</p>
            </div>
          </div>
          
          <Input
            placeholder="Optional focus topic (e.g., 'Key challenges', 'Applications')"
            value={focusTopic}
            onChange={(e) => setFocusTopic(e.target.value)}
            className="bg-zinc-900 border-zinc-700"
          />
          
          <Button 
            className="w-full" 
            onClick={handleGeneratePodcast}
            disabled={podcastMutation.isPending}
          >
            {podcastMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : "Generate Podcast"}
          </Button>
        </div>
      </div>

      {audioUrl && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-zinc-100">Your Podcast</h3>
          <div className="rounded-lg border border-zinc-800 p-4 space-y-4">
            <audio 
              ref={audioRef} 
              src={audioUrl} 
              className="hidden" 
              onEnded={() => setIsPlaying(false)} 
            />
            
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="icon" 
                className="h-10 w-10 rounded-full"
                onClick={togglePlayPause}
              >
                {isPlaying ? (
                  <Pause className="h-5 w-5" />
                ) : (
                  <Play className="h-5 w-5 ml-0.5" />
                )}
              </Button>
              
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between text-xs text-zinc-500">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={duration || 100}
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full h-1.5 appearance-none rounded-full bg-zinc-700 accent-zinc-400"
                />
              </div>
              
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-zinc-400"
              >
                <Volume2 className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="text-sm text-zinc-400 mt-2">
              <p className="font-medium mb-1">A conversation between an Expert and a Novice</p>
              {transcript && (
                <div className="max-h-44 overflow-y-auto text-xs bg-zinc-900 p-3 rounded">
                  {(() => {
                    try {
                      // Try to parse the JSON string
                      const dialogueData = JSON.parse(transcript.replace(/```json|```/g, '').trim());
                      
                      return dialogueData.map((entry: { speaker: string; text: string }, index: number) => {
                        // Normalize speaker to lowercase for comparison
                        const speakerLower = entry.speaker.toLowerCase();
                        const isExpert = speakerLower.includes('expert');
                        const isNovice = speakerLower.includes('novice');
                        
                        return (
                          <div key={index} className="mb-3">
                            <div className={`font-medium mb-1 ${isExpert ? 'text-blue-400' : isNovice ? 'text-green-400' : 'text-purple-400'}`}>
                              {isExpert ? 'Expert' : isNovice ? 'Novice' : entry.speaker}:
                            </div>
                            <p className="text-zinc-300 pl-3 border-l-2 border-zinc-700">{entry.text}</p>
                          </div>
                        );
                      });
                    } catch (e) {
                      // If parsing fails, fall back to displaying the raw text
                      return <p className="text-zinc-500">{transcript}</p>;
                    }
                  })()}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Studiopanel