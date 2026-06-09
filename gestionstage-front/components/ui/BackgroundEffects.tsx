'use client';

export default function BackgroundEffects() {
  return (
    <>
      <div className="fixed top-0 left-0 w-full h-full -z-10 overflow-hidden bg-background">
        <div className="absolute top-0 left-0 w-full h-full opacity-50">
          <div className="absolute w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl animate-float" style={{ top: '-10%', right: '-10%' }} />
          <div className="absolute w-[600px] h-[600px] bg-secondary/5 rounded-full blur-3xl animate-float-delayed" style={{ bottom: '-10%', left: '-10%' }} />
        </div>
      </div>
    </>
  );
}
