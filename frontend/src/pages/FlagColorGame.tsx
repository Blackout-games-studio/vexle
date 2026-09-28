import { useNavigate } from 'react-router-dom';
import { useMultiModeGame, type GameMode } from '../hooks/useMultiModeGame.ts';
import { FlagDisplay } from '../components/FlagDisplay.tsx';
import { ColorSelector } from '../components/ColorSelector.tsx';
import { EvaluationSummary } from '../components/EvaluationSummary.tsx';
import PageName from "../components/PageName.tsx";

interface FlagColorGameProps {
    mode: GameMode;
}

export const FlagColorGame: React.FC<FlagColorGameProps> = ({ mode }) => {
    const navigate = useNavigate();
    const {
        flag,
        loading,
        error,
        regionIds,
        selectedColors,
        isSubmitting,
        evaluation,
        loadNewGame,
        submitAnswer,
        updateColor,
    } = useMultiModeGame(mode);

    const handleNextAction = () => {
        if (mode === 'daily') {
            navigate('/');
        } else {
            loadNewGame();
        }
    };

    if (loading) {
        return (
            <div className="w-full min-h-screen flex justify-center items-center font-medium bg-[#121212] text-[#a3a3a3]">
                Loading {mode} game...
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full min-h-screen flex items-center justify-center p-4 bg-[#121212]">
                <div className="p-6 max-w-lg w-full text-red-400 rounded-xl text-center border border-[#333333] bg-[#1e1e1e]">
                    <p className="font-semibold">{error}</p>
                    <button
                        onClick={() => navigate('/')}
                        className="mt-4 px-4 py-2 bg-neutral-700 text-white rounded-lg hover:bg-neutral-600 transition font-medium text-sm"
                    >
                        Back to Home
                    </button>
                </div>
            </div>
        );
    }

    if (!flag) return null;

    const displayCountryName = (mode === 'hard' && !evaluation) ? '???' : flag.name;

    return (
        <div className="w-full min-h-screen p-4 sm:p-6 bg-[#121212] text-[#e5e5e5] flex flex-col items-center justify-start">
            <div className="w-full max-w-7xl space-y-4">
                <header className="w-full flex justify-between items-center p-4 rounded-xl border border-[#2e2e2e] bg-[#1e1e1e]">
                    <PageName mode={mode} />
                    <div className="flex items-center gap-2">
                        {mode !== 'daily' && (
                            <button
                                onClick={handleNextAction}
                                className="px-4 py-2 rounded-lg hover:bg-[#333333] transition font-medium text-xs border border-[#3a3a3a] bg-[#161616] text-[#e5e5e5]"
                            >
                                Skip Flag
                            </button>
                        )}
                    </div>
                </header>

                <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
                    <div className="md:col-span-2 flex flex-col">
                        <FlagDisplay
                            countryName={displayCountryName}
                            svgContent={flag.svg}
                            selectedColors={selectedColors}
                            evaluation={evaluation}
                        />
                    </div>

                    <div className="p-4 rounded-xl border border-[#2e2e2e] bg-[#1e1e1e] w-full h-full flex flex-col justify-between">
                        {!evaluation ? (
                            <ColorSelector
                                regionIds={regionIds}
                                selectedColors={selectedColors}
                                isSubmitting={isSubmitting}
                                onUpdateColor={updateColor}
                                onSubmit={submitAnswer}
                            />
                        ) : (
                            <div className="flex flex-col h-full justify-between gap-4">
                                <EvaluationSummary
                                    evaluation={evaluation}
                                    onNextFlag={handleNextAction}
                                    isDaily={mode === 'daily'}
                                />
                                {mode === 'daily' && (
                                    <button onClick={() => navigate('/')} className="w-full py-3 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg transition font-semibold text-sm shadow-md mt-auto flex-shrink-0">
                                        Back to Home
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};