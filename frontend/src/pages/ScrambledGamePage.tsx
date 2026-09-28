import { useNavigate } from 'react-router-dom';
import { useScrambledGame } from '../hooks/useScrambledGame';
import { FlagDisplay } from '../components/FlagDisplay';
import PageName from "../components/PageName.tsx";
import { ScrambledColorSelector } from '../components/ScrambledColorSelector';

export const ScrambledGamePage: React.FC = () => {
    const navigate = useNavigate();
    const {
        flagData,
        selectedColors,
        loading,
        error,
        evaluation,
        swapTiles,
        submit,
        loadGame,
    } = useScrambledGame();

    if (loading) {
        return (
            <div className="w-full min-h-screen flex justify-center items-center font-medium bg-[#121212] text-[#a3a3a3]">
                Loading Scrambled Mode...
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

    if (!flagData) return null;

    const flagDisplayEvaluation = evaluation
        ? {
            correctColorsMap: flagData.correctColors,
            overallScore: evaluation.scorePercentage,
            regions: evaluation.regions.map((r: any) => ({
                regionId: r.regionId,
                userColor: r.userColor,
                correctColor: r.correctColor,
                scorePercentage: r.isCorrect ? 100 : 0,
                deltaE: r.isCorrect ? 0 : 10,
            })),
        }
        : null;

    return (
        <div className="w-full min-h-screen p-4 sm:p-6 bg-[#121212] text-[#e5e5e5] flex flex-col items-center justify-start">
            <div className="w-full max-w-7xl space-y-4">
                <header className="w-full flex justify-between items-center p-4 rounded-xl border border-[#2e2e2e] bg-[#1e1e1e]">
                    <PageName mode="Scrambled" />
                    <div className="flex items-center gap-2">
                        <button
                            onClick={loadGame}
                            className="px-4 py-2 rounded-lg hover:bg-[#333333] transition font-medium text-xs border border-[#3a3a3a] bg-[#2a2a2a] text-[#e5e5e5]"
                        >
                            Skip Flag
                        </button>
                    </div>
                </header>

                <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
                    <div className="md:col-span-2 flex flex-col">
                        <FlagDisplay
                            countryName={flagData.name}
                            svgContent={flagData.svg}
                            selectedColors={selectedColors}
                            evaluation={flagDisplayEvaluation}
                        />
                    </div>

                    <ScrambledColorSelector
                        regionIds={flagData.regionIds}
                        selectedColors={selectedColors}
                        evaluation={evaluation}
                        onSwapTiles={swapTiles}
                        onSubmit={submit}
                        onNextFlag={loadGame}
                    />
                </div>
            </div>
        </div>
    );
};