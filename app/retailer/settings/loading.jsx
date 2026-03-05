export default function Loading() {
    return (<div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"/>
        <p className="text-white/60 text-sm">Loading settings...</p>
      </div>
    </div>);
}
