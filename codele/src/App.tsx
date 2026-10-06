import { GameProvider } from './context/GameContext';
import { Header } from './components/Header';
import { Board } from './components/Board';
import { Keyboard } from './components/Keyboard';
import { Toast } from './components/Toast';
import { ResultModal } from './components/ResultModal';
import { StatsModal } from './components/StatsModal';

function AppInner() {
  return (
    <div className="min-h-screen bg-[#111111] flex flex-col items-center">
      <Header />
      <main className="flex flex-col items-center flex-1 w-full max-w-[500px] px-2 py-2">
        <Board />
        <Keyboard />
      </main>

      {/* オーバーレイ */}
      <Toast />
      <ResultModal />
      <StatsModal />
    </div>
  );
}

function App() {
  return (
    <GameProvider>
      <AppInner />
    </GameProvider>
  );
}

export default App;
