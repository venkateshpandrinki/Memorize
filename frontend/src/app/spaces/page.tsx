'use client';

import { useState, useEffect } from 'react';
import { BookCopy, BookMarked, BookOpen, Plus } from 'lucide-react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from '@/components/theme-toggle';
import { z } from 'zod';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';


const SpaceSchema = z.object({
  space_id: z.number(),  // Change from string to number
  space_name: z.string(),
})

const ApiResponseSchema = z.object({
  spaces: z.array(SpaceSchema), // Expecting an object with a 'spaces' key
})

type Space = z.infer<typeof SpaceSchema>

export default function Home() {
  const [isOpen, setIsOpen] = useState(false);
  const [newSpaceName, setNewSpaceName] = useState('');
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Array of book icons to randomly assign with vibrant colors
  const bookIcons = [
    { icon: BookCopy, color: "text-indigo-500 dark:text-indigo-400" },
    { icon: BookMarked, color: "text-rose-500 dark:text-rose-400" },
    { icon: BookOpen, color: "text-amber-500 dark:text-amber-400" }
  ];

  useEffect(() => {
    axios.get('http://127.0.0.1:8001/spaces/')
      .then((response) => {
        const parsedData = ApiResponseSchema.safeParse(response.data)
        if (parsedData.success) {
          setSpaces(parsedData.data.spaces) // ✅ Extracting 'spaces' correctly
        } else {
          console.error('Invalid API response:', parsedData.error.errors)
        }
      })
      .catch((error) => console.error('API error:', error))
  }, [])

  const handleSubmit = () => {
    if (newSpaceName.trim()) {
      setLoading(true);
      axios.post('http://127.0.0.1:8001/createspace/', null, {
        params: {
          space_name: newSpaceName.trim()
        }
      })
      .then((response) => {
        const newSpace = {
          space_id: response.data.space_id,
          space_name: response.data.space_name
        };
        setSpaces([...spaces, newSpace]);
        setNewSpaceName('');
        setIsOpen(false);
        router.push(`/spaces/${newSpace.space_id}`);
      })
      .catch((error) => {
        console.error('Error creating space:', error);
      })
      .finally(() => {
        setLoading(false);
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-background/80 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-rose-500 dark:from-indigo-400 dark:to-rose-400">
             Your Spaces
          </h2>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Button
              onClick={() => setIsOpen(true)}
              className="bg-gradient-to-r from-indigo-500 to-rose-500 dark:from-indigo-400 dark:to-rose-400 hover:opacity-90 transition-opacity text-white dark:text-black"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Space
            </Button>
          </div>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {spaces.map((space, index) => {
            const IconComponent = bookIcons[index % bookIcons.length].icon;
            const iconColor = bookIcons[index % bookIcons.length].color;
            
            return (
              <Link href={`/spaces/${space.space_id}`} passHref key={space.space_id}>
                <Card className="group p-6 hover:shadow-xl transition-all duration-300 backdrop-blur-sm bg-white/5 dark:bg-slate-800/50 border border-slate-200/10 dark:border-slate-700/50 hover:border-slate-300/20 dark:hover:border-slate-600/50">
                  <div className="flex gap-6">
                    <div className={`${iconColor} transition-transform duration-300 group-hover:scale-110`}>
                      <IconComponent size={50} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-xl capitalize text-slate-800 dark:text-slate-100">
                        {space.space_name} 
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        created at: {space.space_id}
                      </p>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="sm:max-w-[425px] dark:bg-slate-900 dark:border-slate-800">
            <DialogHeader>
              <DialogTitle className="text-slate-800 dark:text-slate-100">Create New Space</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right text-slate-700 dark:text-slate-300">
                  Name
                </Label>
                <Input
                  id="name"
                  value={newSpaceName}
                  onChange={(e) => setNewSpaceName(e.target.value)}
                  className="col-span-3 dark:bg-slate-800 dark:border-slate-700 dark:placeholder-slate-400"
                  placeholder="Enter space name"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={handleSubmit}
                className="bg-gradient-to-r from-indigo-500 to-rose-500 dark:from-indigo-400 dark:to-rose-400 hover:opacity-90 transition-opacity text-white"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Space'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}