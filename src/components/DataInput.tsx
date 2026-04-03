import React, { useState, useRef, useMemo } from 'react';
import { Upload, FileText, RefreshCw, Trash2, UserPlus, Filter, AlertCircle, Download } from 'lucide-react';
import Papa from 'papaparse';
import { cn, generateMockNames } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface DataInputProps {
  names: string[];
  setNames: (names: string[]) => void;
  setWinners: (winners: string[]) => void;
}

export function DataInput({ names, setNames, setWinners }: DataInputProps) {
  const [inputText, setInputText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'confirm' | 'alert';
    onConfirm: () => void;
  }>({ isOpen: false, title: '', message: '', type: 'confirm', onConfirm: () => {} });

  // Calculate duplicates
  const duplicates = useMemo(() => {
    const counts: Record<string, number> = {};
    const dups: string[] = [];
    names.forEach(name => {
      counts[name] = (counts[name] || 0) + 1;
    });
    for (const [name, count] of Object.entries(counts)) {
      if (count > 1) {
        dups.push(name);
      }
    }
    return dups;
  }, [names]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      complete: (results) => {
        const flatData = results.data.flat().map((item: any) => String(item).trim()).filter(Boolean);
        setNames([...names, ...flatData]);
        if (fileInputRef.current) fileInputRef.current.value = '';
      },
      header: false,
      skipEmptyLines: true,
    });
  };

  const handlePasteAdd = () => {
    if (!inputText.trim()) return;
    const newNames = inputText.split(/[\n,]+/).map(n => n.trim()).filter(Boolean);
    setNames([...names, ...newNames]);
    setInputText('');
  };

  const handleGenerate = () => {
    const newNames = generateMockNames(20, names);
    setNames([...names, ...newNames]);
  };

  const handleRemoveDuplicates = () => {
    const uniqueNames = Array.from(new Set(names));
    const removedCount = names.length - uniqueNames.length;
    if (removedCount > 0) {
      setConfirmDialog({
        isOpen: true,
        title: '移除重複項目',
        message: `發現 ${removedCount} 個重複項目，確定要移除嗎？`,
        type: 'confirm',
        onConfirm: () => {
          setNames(uniqueNames);
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        }
      });
    } else {
      setConfirmDialog({
        isOpen: true,
        title: '提示',
        message: '沒有發現重複項目',
        type: 'alert',
        onConfirm: () => setConfirmDialog(prev => ({ ...prev, isOpen: false }))
      });
    }
  };

  const removeItem = (indexToRemove: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setNames(names.filter((_, i) => i !== indexToRemove));
  };

  const handleDownloadCSV = () => {
    if (names.length === 0) return;
    const csv = Papa.unparse(names.map(name => [name]));
    // 加入 BOM 以確保 Excel 正確解析 UTF-8 中文
    const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "participants.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleClear = () => {
    setConfirmDialog({
      isOpen: true,
      title: '清空名單',
      message: '確定要清空名單嗎？此動作無法復原。',
      type: 'confirm',
      onConfirm: () => {
        setNames([]);
        setWinners([]);
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-indigo-600" />
              新增參與者
            </h2>
            
            <div className="space-y-3">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="在此貼上姓名（使用逗號或換行分隔）..."
                className="w-full h-32 p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none text-sm"
              />
              <button
                onClick={handlePasteAdd}
                disabled={!inputText.trim()}
                className="w-full py-2 px-4 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                從文字新增
              </button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-slate-500">或</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-2 py-2 px-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-sm font-medium"
              >
                <Upload className="w-4 h-4" />
                上傳 CSV
              </button>
              <input
                type="file"
                ref={fileInputRef}
                accept=".csv,.txt"
                className="hidden"
                onChange={handleFileUpload}
              />

              <button
                onClick={handleGenerate}
                className="flex items-center justify-center gap-2 py-2 px-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-sm font-medium"
              >
                <RefreshCw className="w-4 h-4" />
                自動產生範例
              </button>
            </div>
          </div>

          {/* Duplicates Warning Section */}
          <AnimatePresence>
            {duplicates.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-orange-50 border border-orange-200 rounded-2xl p-4 overflow-hidden"
              >
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-orange-800 mb-1">發現重複名單</h3>
                    <p className="text-xs text-orange-600 mb-2">
                      以下姓名重複出現：{duplicates.slice(0, 5).join(', ')}
                      {duplicates.length > 5 && `...等共 ${duplicates.length} 筆`}
                    </p>
                    <button
                      onClick={handleRemoveDuplicates}
                      className="text-xs bg-white border border-orange-200 text-orange-600 px-3 py-1.5 rounded-lg font-medium hover:bg-orange-100 transition-colors flex items-center gap-1"
                    >
                      <Filter className="w-3 h-3" />
                      移除所有重複項目
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* List Preview Section */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col h-[500px]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-600" />
              目前名單
              <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-xs">
                {names.length}
              </span>
            </h2>
            <div className="flex gap-2">
              {names.length > 0 && (
                <button
                  onClick={handleDownloadCSV}
                  className="text-slate-500 hover:text-indigo-600 p-2 hover:bg-indigo-50 rounded-lg transition-colors"
                  title="下載 CSV"
                >
                  <Download className="w-4 h-4" />
                </button>
              )}
              {names.length > 0 && (
                <button
                  onClick={handleRemoveDuplicates}
                  className="text-slate-500 hover:text-indigo-600 p-2 hover:bg-indigo-50 rounded-lg transition-colors"
                  title="移除重複"
                >
                  <Filter className="w-4 h-4" />
                </button>
              )}
              {names.length > 0 && (
                <button
                  onClick={handleClear}
                  className="text-red-500 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-colors"
                  title="清空名單"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
            {names.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-sm">
                <p>目前沒有參與者。</p>
                <p>請新增一些姓名以開始使用！</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {names.map((name, idx) => {
                  // Check if this specific instance is a duplicate (appears more than once in total list)
                  // Actually, we just want to highlight names that are in the duplicates list
                  const isDuplicate = duplicates.includes(name);
                  
                  return (
                    <motion.div
                      key={`${name}-${idx}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        "px-3 py-2 rounded-lg text-sm border flex items-center gap-2 transition-colors",
                        isDuplicate 
                          ? "bg-orange-50 border-orange-200" 
                          : "bg-slate-50 border-slate-100"
                      )}
                    >
                      <div className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                        isDuplicate ? "bg-orange-200 text-orange-700" : "bg-indigo-100 text-indigo-600"
                      )}>
                        {name.charAt(0).toUpperCase()}
                      </div>
                      <span className={cn("truncate", isDuplicate && "text-orange-700 font-medium")}>
                        {name}
                      </span>
                      {isDuplicate && (
                        <span className="text-[10px] bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded ml-auto shrink-0">
                          重複
                        </span>
                      )}
                      <button 
                        onClick={(e) => removeItem(idx, e)}
                        className={cn(
                          "hover:text-red-500 ml-1",
                          isDuplicate ? "text-orange-400" : "text-slate-400"
                        )}
                      >
                        &times;
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            )}
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
                {confirmDialog.type === 'confirm' && (
                  <button
                    onClick={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
                    className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-xl transition-colors"
                  >
                    取消
                  </button>
                )}
                <button
                  onClick={confirmDialog.onConfirm}
                  className={cn(
                    "px-4 py-2 text-white font-medium rounded-xl transition-colors shadow-lg shadow-indigo-200",
                    confirmDialog.type === 'confirm' ? "bg-indigo-600 hover:bg-indigo-700" : "bg-slate-900 hover:bg-slate-800"
                  )}
                >
                  {confirmDialog.type === 'confirm' ? '確定' : '好的'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
