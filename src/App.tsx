/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Users, Gift, Database, LayoutGrid } from 'lucide-react';
import { DataInput } from './components/DataInput';
import { LuckyDraw } from './components/LuckyDraw';
import { Grouping } from './components/Grouping';
import { cn } from './lib/utils';

type Tab = 'data' | 'draw' | 'group';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('data');
  const [names, setNames] = useState<string[]>([]);
  const [winners, setWinners] = useState<string[]>([]);

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
              <LayoutGrid className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Lucky Group</h1>
          </div>
          <div className="text-sm text-slate-500 font-medium">
            {names.length} 位參與者
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-slate-200/50 p-1 rounded-xl mb-8 w-fit mx-auto md:mx-0">
          <button
            onClick={() => setActiveTab('data')}
            className={cn(
              "flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all",
              activeTab === 'data' 
                ? "bg-white text-indigo-600 shadow-sm" 
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
            )}
          >
            <Database className="w-4 h-4" />
            名單管理
          </button>
          <button
            onClick={() => setActiveTab('draw')}
            className={cn(
              "flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all",
              activeTab === 'draw' 
                ? "bg-white text-indigo-600 shadow-sm" 
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
            )}
          >
            <Gift className="w-4 h-4" />
            幸運抽籤
          </button>
          <button
            onClick={() => setActiveTab('group')}
            className={cn(
              "flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all",
              activeTab === 'group' 
                ? "bg-white text-indigo-600 shadow-sm" 
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
            )}
          >
            <Users className="w-4 h-4" />
            自動分組
          </button>
        </div>

        {/* Tab Content */}
        <div className="min-h-[600px]">
          {activeTab === 'data' && (
            <DataInput names={names} setNames={setNames} setWinners={setWinners} />
          )}
          {activeTab === 'draw' && (
            <LuckyDraw names={names} winners={winners} setWinners={setWinners} />
          )}
          {activeTab === 'group' && (
            <Grouping names={names} />
          )}
        </div>
      </main>
    </div>
  );
}

