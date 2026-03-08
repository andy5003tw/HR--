import React, { useState, useEffect, useMemo } from 'react';
import { Trophy, Shuffle, RotateCcw, Settings2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { cn } from '../lib/utils';

interface LuckyDrawProps {
  names: string[];
  winners: string[];
  setWinners: React.Dispatch<React.SetStateAction<string[]>>;
}

export function LuckyDraw({ names, winners, setWinners }: LuckyDrawProps) {
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentDisplay, setCurrentDisplay] = useState('???');
  const [lastBatch, setLastBatch] = useState<string[]>([]);
  const [settings, setSettings] = useState({
    count: 1,
    allowDuplicates: false,
  });
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ isOpen: false, title: '', message: '', onConfirm: () => {} });

  // Calculate available names correctly handling duplicates
  const availableNames = useMemo(() => {
    if (settings.allowDuplicates) return names;
    
    // Count occurrences of each winner
    const winnerCounts = winners.reduce((acc, name) => {
      acc[name] = (acc[name] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const available: string[] = [];
    const currentWinnerCounts = { ...winnerCounts };

    // Filter names: for each name in source, if it's in winners count, skip it and decrement count
    // otherwise add to available
    for (const name of names) {
      if (currentWinnerCounts[name] && currentWinnerCounts[name] > 0) {
        currentWinnerCounts[name]--;
      } else {
        available.push(name);
      }
    }
    return available;
  }, [names, winners, settings.allowDuplicates]);

  const handleDraw = () => {
    if (availableNames.length === 0) {
      alert('名單已抽完！');
      return;
    }

    setIsDrawing(true);
    setLastBatch([]); // Clear previous batch display
    let duration = 3000; // 3 seconds
    let interval: any;
    const startTime = Date.now();

    // Animation loop
    interval = setInterval(() => {
      const randomName = availableNames[Math.floor(Math.random() * availableNames.length)];
      setCurrentDisplay(randomName);

      if (Date.now() - startTime > duration) {
        clearInterval(interval);
        finalizeDraw();
      }
    }, 50);
  };

  const finalizeDraw = () => {
    // Select actual winners
    const drawCount = Math.min(settings.count, availableNames.length);
    const newWinners: string[] = [];
    let pool = [...availableNames];

    for (let i = 0; i < drawCount; i++) {
      if (pool.length === 0) break;
      const randomIndex = Math.floor(Math.random() * pool.length);
      newWinners.push(pool[randomIndex]);
      // Remove from pool to avoid picking same person twice in ONE batch
      pool.splice(randomIndex, 1);
    }

    setWinners(prev => [...newWinners, ...prev]); // Add to top
    setLastBatch(newWinners);
    setIsDrawing(false);
    
    // Confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const resetWinners = () => {
    setConfirmDialog({
      isOpen: true,
      title: '重置中獎名單',
      message: '確定要重置所有中獎者嗎？此動作無法復原。',
      onConfirm: () => {
        setWinners([]);
        setLastBatch([]);
        setCurrentDisplay('???');
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls & Settings */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
              <Settings2 className="w-5 h-5 text-slate-600" />
              設定
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  每次抽取人數
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={settings.count}
                  onChange={(e) => setSettings({ ...settings, count: Math.max(1, parseInt(e.target.value) || 1) })}
                  className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="allowDuplicates"
                  checked={settings.allowDuplicates}
                  onChange={(e) => setSettings({ ...settings, allowDuplicates: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="allowDuplicates" className="text-sm text-slate-700 select-none">
                  允許重複中獎
                </label>
              </div>

              <div className="pt-4 border-t border-slate-100">
                 <div className="flex justify-between items-center mb-2 text-xs text-slate-500">
                   <span>總人數: <span className="font-mono font-bold text-slate-900">{names.length}</span></span>
                   <span>可抽: <span className="font-mono font-bold text-indigo-600">{availableNames.length}</span></span>
                 </div>
                 <button
                  onClick={handleDraw}
                  disabled={isDrawing || availableNames.length === 0}
                  className="w-full py-3 px-4 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-200 disabled:opacity-50 disabled:shadow-none active:scale-95 flex items-center justify-center gap-2"
                >
                  <Shuffle className="w-5 h-5" />
                  {isDrawing ? '抽籤中...' : '開始抽籤'}
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
             <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-700">中獎名單</h3>
                <button 
                  type="button"
                  onClick={resetWinners}
                  className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" /> 重置
                </button>
             </div>
             <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                <AnimatePresence>
                  {winners.map((winner, idx) => (
                    <motion.div
                      key={`${winner}-${idx}`} // Use idx to allow duplicates in list
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-100 rounded-lg"
                    >
                      <div className="w-8 h-8 rounded-full bg-yellow-200 text-yellow-700 flex items-center justify-center font-bold text-sm shrink-0">
                        #{winners.length - idx}
                      </div>
                      <span className="font-medium text-slate-800 truncate">{winner}</span>
                    </motion.div>
                  ))}
                  {winners.length === 0 && (
                    <p className="text-sm text-slate-400 text-center py-4">尚未有中獎者</p>
                  )}
                </AnimatePresence>
             </div>
          </div>
        </div>

        {/* Stage */}
        <div className="lg:col-span-2 bg-slate-900 rounded-3xl p-8 flex flex-col items-center justify-center min-h-[500px] relative overflow-hidden shadow-2xl">
          {/* Background decoration */}
          <div className="absolute inset-0 opacity-20">
             <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-500 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
             <div className="absolute bottom-0 right-0 w-64 h-64 bg-pink-500 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
          </div>

          <div className="relative z-10 text-center w-full max-w-2xl">
            <motion.div
              animate={isDrawing ? { scale: [1, 1.1, 1] } : { scale: 1 }}
              transition={{ repeat: isDrawing ? Infinity : 0, duration: 0.5 }}
            >
              <Trophy className={cn("w-24 h-24 mx-auto mb-6", isDrawing ? "text-yellow-400" : "text-slate-600")} />
            </motion.div>
            
            <h2 className="text-slate-400 text-xl font-medium mb-4 uppercase tracking-widest">中獎者</h2>
            
            <div className="min-h-[128px] flex items-center justify-center">
              <AnimatePresence mode="wait">
                {isDrawing ? (
                  <motion.div
                    key="drawing"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="text-5xl md:text-7xl font-black text-white tracking-tight text-shadow-lg"
                  >
                    {currentDisplay}
                  </motion.div>
                ) : (
                  lastBatch.length > 0 ? (
                    <motion.div
                      key="result"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex flex-wrap justify-center gap-4"
                    >
                      {lastBatch.map((winner, idx) => (
                        <div 
                          key={idx} 
                          className={cn(
                            "font-bold text-white tracking-tight text-shadow-lg bg-white/10 px-6 py-3 rounded-2xl border border-white/20 backdrop-blur-sm",
                            lastBatch.length === 1 ? "text-5xl md:text-7xl border-none bg-transparent" : "text-3xl md:text-4xl"
                          )}
                        >
                          {winner}
                        </div>
                      ))}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-5xl md:text-7xl font-black text-slate-700 tracking-tight"
                    >
                      ???
                    </motion.div>
                  )
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Confirmation Modal */}
      <AnimatePresence>
        {confirmDialog.isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 overflow-hidden"
            >
              <h3 className="text-lg font-bold text-slate-900 mb-2">{confirmDialog.title}</h3>
              <p className="text-slate-600 mb-6">{confirmDialog.message}</p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
                  className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-xl transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={confirmDialog.onConfirm}
                  className="px-4 py-2 text-white font-medium rounded-xl transition-colors shadow-lg shadow-indigo-200 bg-indigo-600 hover:bg-indigo-700"
                >
                  確定
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
