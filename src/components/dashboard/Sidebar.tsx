// src/components/dashboard/Sidebar.tsx
'use client';

type SidebarProps = {
  activeView: string;
  setActiveView: (view: string) => void;
  onLogout: () => void;
};

const menu = [
  { id: 'dashboard', name: 'Dashboard' },
  { id: 'invitations', name: 'Undangan' },
  { id: 'invoice', name: 'Invoice' },
  { id: 'tutorial', name: 'Tutorial' },
  { id: 'account', name: 'Akun' },
];

export default function Sidebar({ activeView, setActiveView, onLogout }: SidebarProps) {
  return (
    <aside className="w-64 bg-brand-green text-brand-off-white min-h-screen p-4 hidden md:block">
      <h2 className="font-serif text-2xl font-bold mb-6">
        Arumaja<span className="text-brand-gold">.</span>
      </h2>
      <nav className="space-y-2">
        {menu.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveView(item.id)}
            className={
              'w-full text-left px-4 py-2 rounded-lg ' +
              (activeView === item.id ? 'bg-brand-off-white/10 text-brand-gold' : 'hover:text-brand-gold')
            }
          >
            • {item.name}
          </button>
        ))}
      </nav>
      <div className="mt-6 border-t border-white/10 pt-4">
        <button
          type="button"
          onClick={onLogout}
          className="w-full text-left px-4 py-2 rounded-lg hover:text-brand-gold">
          Keluar
        </button>
      </div>
    </aside>
  );
}
