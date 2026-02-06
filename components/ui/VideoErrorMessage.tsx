import { AlertTriangle, RefreshCw } from 'lucide-react';

interface VideoErrorMessageProps {
  error: string;
  onRetry?: () => void;
}

export default function VideoErrorMessage({ error, onRetry }: VideoErrorMessageProps) {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
      <div className="flex items-start space-x-3">
        <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-amber-800">Video Playback Issue</h3>
          <p className="text-sm text-amber-700 mt-1">{error}</p>
          
          <div className="mt-3 bg-amber-100 rounded-md p-3">
            <h4 className="text-xs font-semibold text-amber-800 mb-2">🛠️ How to Fix This:</h4>
            
            <div className="mb-3 p-2 bg-amber-50 rounded border-l-2 border-amber-400">
              <p className="text-xs font-semibold text-amber-800 mb-1">🚀 Quick Online Solution:</p>
              <a 
                href="https://cloudconvert.com/mp4-converter" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-block px-3 py-1 text-xs font-medium text-white bg-amber-600 hover:bg-amber-700 rounded transition-colors"
              >
                Convert Online (CloudConvert)
              </a>
              <p className="text-xs text-amber-700 mt-1">
                Select: <span className="font-mono bg-amber-200 px-1">H.264 video codec + AAC audio</span>
              </p>
            </div>
            
            <p className="text-xs font-semibold text-amber-800 mb-1">📱 Or use desktop app:</p>
            <ol className="text-xs text-amber-700 space-y-1 list-decimal list-inside">
              <li>Download <a href="https://handbrake.fr/" target="_blank" rel="noopener noreferrer" className="underline font-medium">HandBrake (free)</a></li>
              <li>Import your video file</li>
              <li>Preset: <span className="font-mono bg-amber-200 px-1">Fast 1080p30</span></li>
              <li>Video tab: Codec = <span className="font-mono bg-amber-200 px-1">H.264 (x264)</span></li>
              <li>Audio tab: Codec = <span className="font-mono bg-amber-200 px-1">AAC</span></li>
              <li>Click "Start Encode"</li>
            </ol>
          </div>

          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-3 inline-flex items-center px-3 py-1 text-xs font-medium text-amber-800 bg-amber-200 rounded-md hover:bg-amber-300 transition-colors"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}