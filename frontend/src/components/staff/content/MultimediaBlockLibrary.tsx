import React from 'react';
import {
  Type,
  Image,
  Video,
  Music,
  HelpCircle,
  Code,
  Minus,
  AlertCircle,
  Table,
} from 'lucide-react';

interface MultimediaBlockLibraryProps {
  onInsert: (blockType: string) => void;
}

interface BlockType {
  type: string;
  label: string;
  icon: React.ReactNode;
  description: string;
  color: string;
}

const BLOCK_TYPES: BlockType[] = [
  {
    type: 'text',
    label: 'Text',
    icon: <Type className="w-5 h-5" />,
    description: 'Rich text paragraph with formatting',
    color: 'text-blue-400',
  },
  {
    type: 'image',
    label: 'Image',
    icon: <Image className="w-5 h-5" />,
    description: 'Upload or embed an image',
    color: 'text-green-400',
  },
  {
    type: 'video',
    label: 'Video',
    icon: <Video className="w-5 h-5" />,
    description: 'Embed video from URL or upload',
    color: 'text-purple-400',
  },
  {
    type: 'audio',
    label: 'Audio',
    icon: <Music className="w-5 h-5" />,
    description: 'Audio clip or podcast embed',
    color: 'text-pink-400',
  },
  {
    type: 'quiz',
    label: 'Quiz',
    icon: <HelpCircle className="w-5 h-5" />,
    description: 'Interactive quiz or assessment block',
    color: 'text-amber-400',
  },
  {
    type: 'code',
    label: 'Code',
    icon: <Code className="w-5 h-5" />,
    description: 'Syntax-highlighted code snippet',
    color: 'text-cyan-400',
  },
  {
    type: 'divider',
    label: 'Divider',
    icon: <Minus className="w-5 h-5" />,
    description: 'Visual separator between sections',
    color: 'text-gray-400 dark:text-white/40',
  },
  {
    type: 'callout',
    label: 'Callout',
    icon: <AlertCircle className="w-5 h-5" />,
    description: 'Highlighted info, tip, or warning box',
    color: 'text-orange-400',
  },
  {
    type: 'table',
    label: 'Table',
    icon: <Table className="w-5 h-5" />,
    description: 'Data table with rows and columns',
    color: 'text-teal-400',
  },
];

const MultimediaBlockLibrary: React.FC<MultimediaBlockLibraryProps> = ({ onInsert }) => {
  return (
    <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-gray-200 dark:border-[#22272B]">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Content Blocks</h3>
        <p className="text-xs text-gray-400 dark:text-white/40 mt-0.5">Click to insert a block</p>
      </div>

      {/* Block Grid */}
      <div className="p-4">
        <div className="grid grid-cols-3 gap-2">
          {BLOCK_TYPES.map((block) => (
            <button
              key={block.type}
              onClick={() => onInsert(block.type)}
              className="group relative flex flex-col items-center gap-2 p-3 rounded-lg border border-gray-200 dark:border-[#22272B] bg-gray-100 dark:bg-[#22272B]/30 hover:bg-gray-100 dark:hover:bg-[#22272B] hover:border-gray-300 dark:hover:border-[#333] transition-all duration-200"
            >
              <span className={`${block.color} transition-transform group-hover:scale-110`}>
                {block.icon}
              </span>
              <span className="text-xs text-gray-600 dark:text-white/70 font-medium">{block.label}</span>

              {/* Hover tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 bg-gray-100 dark:bg-[#22272B] border border-gray-300 dark:border-[#333] rounded-lg text-[10px] text-gray-500 dark:text-white/60 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                {block.description}
                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-[#333]" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MultimediaBlockLibrary;
