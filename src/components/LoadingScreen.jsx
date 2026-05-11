import { Code2 } from 'lucide-react';

export default function LoadingScreen({ message = 'Loading…' }) {
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-4">
      <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center animate-pulse">
        <Code2 className="w-8 h-8 text-white" />
      </div>
      <p className="text-gray-500 text-sm">{message}</p>
    </div>
  );
}
