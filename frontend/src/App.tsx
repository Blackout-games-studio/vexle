import { FlagColorGame } from './pages/FlagColorGame.tsx';
import { AddFlagPage } from './components/AddFlagPage';
import { Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage.tsx";
import { ScrambledGamePage } from "./pages/ScrambledGamePage.tsx";
import { CreateCustomGamePage } from "./pages/CreateCustomGamePage.tsx";
import { CustomGameRunner } from "./pages/CustomGameRunner.tsx";

export default function App() {
    return (
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/add" element={<AddFlagPage />} />
            <Route path="/play/daily" element={<FlagColorGame mode="daily" />} />
            <Route path="/play/regular" element={<FlagColorGame mode="regular" />} />
            <Route path="/play/hard" element={<FlagColorGame mode="hard" />} />
            <Route path="/play/random" element={<FlagColorGame mode="random" />} />
            <Route path="/play/scrambled" element={<ScrambledGamePage />} />
            <Route path="/create-custom" element={<CreateCustomGamePage />} />
            <Route path="/play/custom" element={<CustomGameRunner />} />
        </Routes>
    );
}