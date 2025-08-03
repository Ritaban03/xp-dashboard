interface XPPopupProps {
  xp: number;
}

export default function XPPopup({ xp }: XPPopupProps) {
  return (
    <div className="absolute left-1/2 top-5 transform -translate-x-1/2 pointer-events-none z-50 animate-xp-gain">
      <div className="bg-xp-gold text-black px-3 py-1 rounded-full font-bold text-lg shadow-lg">
        +{xp} XP
      </div>
    </div>
  );
}
