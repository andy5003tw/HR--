import { useState } from 'react';
import { Users, Grid, Download } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface GroupingProps {
  names: string[];
}

interface Group {
  id: number;
  members: string[];
}

export function Grouping({ names }: GroupingProps) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [method, setMethod] = useState<'bySize' | 'byCount'>('bySize');
  const [value, setValue] = useState(3); // Default 3 people per group

  const handleGroup = () => {
    if (names.length === 0) return;

    // Shuffle names first
    const shuffled = [...names].sort(() => Math.random() - 0.5);
    const newGroups: Group[] = [];

    if (method === 'bySize') {
      const size = Math.max(1, value);
      let groupIndex = 0;
      
      for (let i = 0; i < shuffled.length; i += size) {
        newGroups.push({
          id: groupIndex++,
          members: shuffled.slice(i, i + size)
        });
      }
    } else {
      // By count (number of groups)
      const count = Math.max(1, value);
      // Initialize empty groups
      for (let i = 0; i < count; i++) {
        newGroups.push({ id: i, members: [] });
      }
      // Distribute
      shuffled.forEach((name, idx) => {
        newGroups[idx % count].members.push(name);
      });
    }

    setGroups(newGroups);
  };

  const downloadCSV = () => {
    if (groups.length === 0) return;
    
    // Add BOM \uFEFF to ensure Excel opens it as UTF-8
    let csvContent = "\uFEFFGroup,Member\n";
    
    groups.forEach(group => {
      group.members.forEach(member => {
        // Escape quotes and wrap in quotes if contains comma or quote
        const safeMember = member.includes(',') || member.includes('"') 
          ? `"${member.replace(/"/g, '""')}"` 
          : member;
        csvContent += `Group ${group.id + 1},${safeMember}\n`;
      });
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "grouping_results.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex flex-col md:flex-row items-end md:items-center gap-6">
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-slate-700 mb-2">分組方式</label>
            <div className="flex p-1 bg-slate-100 rounded-xl w-full md:w-fit">
              <button
                onClick={() => setMethod('bySize')}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-all flex-1 md:flex-none",
                  method === 'bySize' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                )}
              >
                依每組人數
              </button>
              <button
                onClick={() => setMethod('byCount')}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-all flex-1 md:flex-none",
                  method === 'byCount' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                )}
              >
                依組別數量
              </button>
            </div>
          </div>

          <div className="w-full md:w-48">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              {method === 'bySize' ? '每組人數' : '組別數量'}
            </label>
            <input
              type="number"
              min="1"
              max={names.length || 100}
              value={value}
              onChange={(e) => setValue(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <button
              onClick={handleGroup}
              disabled={names.length === 0}
              className="flex-1 md:flex-none py-2.5 px-6 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Users className="w-4 h-4" />
              開始分組
            </button>
            {groups.length > 0 && (
               <button
               onClick={downloadCSV}
               className="py-2.5 px-4 border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors"
               title="下載 CSV"
             >
               <Download className="w-4 h-4" />
             </button>
            )}
          </div>
        </div>
      </div>

      {/* Results */}
      {groups.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {groups.map((group, idx) => (
            <motion.div
              key={group.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"
            >
              <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-semibold text-slate-700">第 {group.id + 1} 組</h3>
                <span className="text-xs font-medium bg-white px-2 py-1 rounded border border-slate-200 text-slate-500">
                  {group.members.length}
                </span>
              </div>
              <div className="p-4">
                <ul className="space-y-2">
                  {group.members.map((member, mIdx) => (
                    <li key={mIdx} className="flex items-center gap-2 text-sm text-slate-600">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                      {member}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-slate-400 bg-slate-100/50 rounded-3xl border-2 border-dashed border-slate-200">
          <Grid className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">尚未產生分組</p>
          <p className="text-sm">調整設定並點擊「開始分組」</p>
        </div>
      )}
    </div>
  );
}
