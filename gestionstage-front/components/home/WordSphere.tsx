export default function WordSphere() {
  return (
    <div className="relative w-full h-[500px] flex items-center justify-center perspective-1000">
      {/* Background ambient glow */}
      <div className="absolute w-64 h-64 bg-primary/10 rounded-full blur-[80px]" />
    </div>
  );
}
