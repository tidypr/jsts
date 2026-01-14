'use client';

type TTabs = { id: string; label: string }[];

export default function Tabs({
  disabled,
  tabs,
  activeTab,
  setActiveTab,
}: {
  disabled?: boolean;
  tabs: TTabs;
  activeTab: string;
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
}) {
  return (
    <div className='sticky top-0 z-10 mx-auto max-w-md py-2 transition-all duration-300'>
      <div className='flex gap-2 rounded-full bg-muted p-1'>
        {tabs.map((tab) => (
          <button
            disabled={disabled}
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`h-8 w-16 flex-1 rounded-full py-1 font-medium transition-all duration-300 ${
              activeTab === tab.id ? 'bg-[#22c55e]' : 'text-gray-400'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
