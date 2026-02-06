export const WhyConvertVideo = () => (
  <div className="bg-gray-50 border-l-4 border-blue-500 p-4 mb-4">
    <h3 className="text-sm font-semibold text-gray-800 mb-2">🤔 Why Do I Need to Convert My MP4 Video?</h3>
    
    <div className="space-y-3 text-xs text-gray-700">
      <div className="bg-white p-3 rounded border">
        <h4 className="font-semibold text-gray-800 mb-1">📦 Container vs Codec</h4>
        <p><strong>MP4</strong> is just the "container" (like a zip file). Inside, your video might use any of 100+ different codecs.</p>
        
        <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
          <div className="bg-red-50 p-2 rounded">
            <span className="font-semibold text-red-700">❌ Your Video:</span>
            <br />MP4 + Unknown Codec
            <br /><span className="text-red-600">Browser can't decode</span>
          </div>
          <div className="bg-green-50 p-2 rounded">
            <span className="font-semibold text-green-700">✅ What Browsers Need:</span>
            <br />MP4 + H.264 Codec  
            <br /><span className="text-green-600">Universal compatibility</span>
          </div>
        </div>
      </div>
      
      <div className="bg-blue-50 p-3 rounded">
        <h4 className="font-semibold text-blue-800 mb-1">🎯 Real Example</h4>
        <p>Your phone might record in H.265/HEVC codec (smaller file) but browsers only understand H.264 codec reliably.</p>
        <p className="mt-1"><strong>Same MP4 container, different internal "language"!</strong></p>
      </div>
      
      <div className="bg-yellow-50 p-3 rounded">
        <h4 className="font-semibold text-yellow-800 mb-1">⚡ Quick Fix</h4>
        <p>Conversion = Translate your video into browser-friendly "language" (H.264)</p>
        <p>Takes 2-3 minutes online, solves the problem forever!</p>
      </div>
    </div>
  </div>
);