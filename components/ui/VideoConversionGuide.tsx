export const VideoConversionGuide = () => (
  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
    <h3 className="text-sm font-semibold text-blue-800 mb-2">🎬 Video Format Requirements</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
      <div>
        <h4 className="font-semibold text-blue-700 mb-1">✅ Supported Formats:</h4>
        <ul className="space-y-1 text-blue-600">
          <li>• MP4 with H.264 video codec</li>
          <li>• WebM with VP8/VP9 codec</li>
          <li>• Maximum: 50MB, 1080p</li>
        </ul>
      </div>
      <div>
        <h4 className="font-semibold text-blue-700 mb-1">🔧 Need to Convert?</h4>
        <div className="space-y-1">
          <a 
            href="https://cloudconvert.com/mp4-converter" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-block px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Convert Online
          </a>
          <p className="text-blue-600">Select: H.264 + AAC codecs</p>
        </div>
      </div>
    </div>
  </div>
);