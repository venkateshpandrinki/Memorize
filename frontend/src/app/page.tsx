'use client';

import { FC } from 'react';
import { BookCopy, BookMarked, BookOpen, Headphones, Search, FileUp, Bot } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { ThemeToggle } from '@/components/theme-toggle';
import Link from 'next/link';
import { motion } from 'framer-motion';

const Page: FC = () => {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.3
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  // Feature items with icons, titles, and descriptions
  const features = [
    {
      icon: FileUp,
      color: "text-indigo-500 dark:text-indigo-400",
      title: "Multi-format Upload",
      description: "Upload PDFs, PPTs, and Word documents to build your knowledge base"
    },
    {
      icon: Search,
      color: "text-rose-500 dark:text-rose-400",
      title: "Hybrid Search & Q&A",
      description: "Chat with your documents and find information with precision"
    },
    {
      icon: Headphones,
      color: "text-amber-500 dark:text-amber-400",
      title: "Podcast Generation",
      description: "Transform text into natural-sounding audio with Kokoro TTS"
    },
    {
      icon: Bot,
      color: "text-emerald-500 dark:text-emerald-400",
      title: "AI-Powered Analysis",
      description: "Leverage LLMs and hybrid RAG pipeline for intelligent responses"
    }
  ];

  return (
    <div className="min-h-screen overflow-hidden bg-gradient-to-b from-background via-background to-background/80 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Header */}
      <header className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-rose-500 dark:from-indigo-400 dark:to-rose-400">
            Memorize
          </h1>
          <ThemeToggle />
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-4 py-16 md:py-24 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-6"
        >
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-rose-500 dark:from-indigo-400 dark:to-rose-400">
              AI-Powered Knowledge Assistant
            </span>
          </h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto text-slate-700 dark:text-slate-300">
            Transform your documents into interactive and spoken content with the power of AI
          </p>
          
          <div className="pt-8">
            <Link href="/spaces" passHref>
              <Button className="px-8 py-6 text-lg rounded-xl bg-gradient-to-r from-indigo-500 to-rose-500 dark:from-indigo-400 dark:to-rose-400 hover:opacity-90 transition-all duration-300 shadow-lg hover:shadow-xl text-white dark:text-slate-900 font-medium">
                Start Building Your Knowledge Space
              </Button>
            </Link>
          </div>

          <div className="pt-6 text-sm text-slate-600 dark:text-slate-400">
            Powered by LlamaIndex, Gemini, and ChromaDB
          </div>
        </motion.div>
      </section>

      {/* Floating Icons Animation */}
      <div className="relative max-w-5xl mx-auto h-24 mb-16">
        <motion.div 
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="absolute left-1/4 top-0"
        >
          <BookCopy size={40} className="text-indigo-500 dark:text-indigo-400" />
        </motion.div>
        <motion.div 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 0.7 }}
          className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2"
        >
          <BookMarked size={40} className="text-rose-500 dark:text-rose-400" />
        </motion.div>
        <motion.div 
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 0.9 }}
          className="absolute right-1/4 top-0"
        >
          <BookOpen size={40} className="text-amber-500 dark:text-amber-400" />
        </motion.div>
      </div>

      {/* Features Section */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <motion.h2 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-3xl font-bold text-center mb-16 bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-rose-500 dark:from-indigo-400 dark:to-rose-400"
        >
          ✨ Key Features
        </motion.h2>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid gap-8 md:grid-cols-2 lg:grid-cols-4"
        >
          {features.map((feature, index) => (
            <motion.div 
              key={index}
              variants={itemVariants}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-rose-500/20 dark:from-indigo-500/10 dark:to-rose-500/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative p-6 rounded-2xl backdrop-blur-sm bg-white/10 dark:bg-slate-800/50 border border-slate-200/20 dark:border-slate-700/50 hover:border-slate-300/30 dark:hover:border-slate-600/50 transition-all duration-300">
                <div className={`${feature.color} mb-4`}>
                  <feature.icon size={40} />
                </div>
                <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="max-w-5xl mx-auto px-4 py-20 text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="p-10 rounded-3xl bg-gradient-to-r from-indigo-500/10 to-rose-500/10 dark:from-indigo-500/5 dark:to-rose-500/5 border border-slate-200/20 dark:border-slate-700/30"
        >
          <h2 className="text-3xl font-bold mb-6">Ready to transform your documents?</h2>
          <p className="text-xl max-w-2xl mx-auto mb-8 text-slate-700 dark:text-slate-300">
            Unlock the knowledge in your files and create interactive, voice-enabled content in minutes.
          </p>
          <Link href="/spaces" passHref>
            <Button className="px-8 py-6 text-lg rounded-xl bg-gradient-to-r from-indigo-500 to-rose-500 dark:from-indigo-400 dark:to-rose-400 hover:opacity-90 transition-all duration-300 shadow-lg hover:shadow-xl text-white dark:text-slate-900 font-medium">
              Get Started Now
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 py-8 border-t border-slate-200/10 dark:border-slate-800/50 text-center text-slate-600 dark:text-slate-400">
        <p>© {new Date().getFullYear()} Memorize. AI-powered knowledge transformation.</p>
      </footer>
    </div>
  );
};

export default Page;