import { useNavigate } from 'react-router-dom';

interface GameMode {
    id: string;
    title: string;
    description: string;
    path: string;
    accentBg: string;
    hoverBorder: string;
}

export default function HomePage() {
    const navigate = useNavigate();

    const standardModes: GameMode[] = [
        {
            id: 'regular',
            title: 'Regular Mode',
            description: 'Match standard colors to the desaturated flag.',
            accentBg: 'bg-emerald-500',
            hoverBorder: 'hover:border-emerald-500',
            path: '/play/regular'
        },
        {
            id: 'hard',
            title: 'Hard Mode',
            description: 'Standard game, but the country name is hidden.',
            accentBg: 'bg-rose-500',
            hoverBorder: 'hover:border-rose-500',
            path: '/play/hard'
        },
        {
            id: 'random',
            title: 'Random Color Mode',
            description: 'Regions start with completely random colors.',
            accentBg: 'bg-purple-500',
            hoverBorder: 'hover:border-purple-500',
            path: '/play/random'
        },
        {
            id: 'scrambled',
            title: 'Scrambled Mode',
            description: 'Colors are correct, but shuffled across regions.',
            accentBg: 'bg-amber-500',
            hoverBorder: 'hover:border-amber-500',
            path: '/play/scrambled'
        }
    ];

    return (
        <div className="min-h-screen bg-[#121212] text-[#e5e5e5] flex flex-col items-center justify-center p-6 relative">
            <button
                onClick={() => navigate('/add')}
                className="absolute top-4 right-4 text-xs px-3 py-1.5 rounded-lg border border-neutral-800 bg-[#181818] text-neutral-400 hover:text-white hover:border-neutral-700 transition-colors flex items-center gap-1.5"
            >
                Debug: Add Flag
            </button>

            <div className="max-w-4xl w-full space-y-10">
                <header className="text-center space-y-3">
                    <h1 className="text-5xl font-black tracking-wider text-white">VEXLE</h1>
                    <p className="text-neutral-400 font-medium">Test your vexillology knowledge</p>
                </header>

                <div className="space-y-4">
                    <button
                        onClick={() => navigate('/play/daily')}
                        className="w-full group relative overflow-hidden p-6 rounded-2xl bg-[#1a1a1a] border border-neutral-800 text-left transition-all duration-200 hover:border-blue-500 hover:bg-[#222222] active:scale-[0.99] flex flex-col justify-between shadow-xl"
                    >
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500" />
                        <div className="space-y-2 pl-2">
                            <h2 className="text-2xl font-bold text-white group-hover:text-neutral-100">
                                Daily Flag
                            </h2>
                            <p className="text-sm text-neutral-400 font-normal leading-relaxed">
                                One flag a day. Compare your solution with players worldwide.
                            </p>
                        </div>
                    </button>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {standardModes.map((mode) => (
                            <button
                                key={mode.id}
                                onClick={() => navigate(mode.path)}
                                className={`group relative overflow-hidden p-6 rounded-2xl bg-[#1a1a1a] border border-neutral-800 text-left transition-all duration-200 ${mode.hoverBorder} hover:bg-[#222222] active:scale-[0.99] flex flex-col justify-between shadow-xl`}
                            >
                                <div className={`absolute top-0 left-0 w-1.5 h-full ${mode.accentBg}`} />
                                <div className="space-y-2 pl-2">
                                    <h2 className="text-xl font-bold text-white group-hover:text-neutral-100">
                                        {mode.title}
                                    </h2>
                                    <p className="text-sm text-neutral-400 font-normal leading-relaxed">
                                        {mode.description}
                                    </p>
                                </div>
                            </button>
                        ))}
                    </div>

                    <div className="pt-2 flex justify-center">
                        <button
                            onClick={() => navigate('/create-custom')}
                            className="group relative overflow-hidden px-5 py-3 rounded-xl bg-[#161616] border border-neutral-800 text-left transition-all duration-200 hover:border-indigo-500 hover:bg-[#1a1a1a] flex items-center gap-3 shadow-md"
                        >
                            <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
                            <div className="pl-2">
                                <h2 className="text-sm font-semibold text-neutral-300 group-hover:text-white">
                                    Custom Mode
                                </h2>
                                <p className="text-xs text-neutral-500">
                                    Create and play custom game, with optional timer.
                                </p>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};