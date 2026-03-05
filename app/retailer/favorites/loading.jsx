export default function Loading() {
    return (<div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mb-4 mx-auto"/>
        <p className="text-white/60">Loading favorites...</p>
      </div>
    </div>);
}
