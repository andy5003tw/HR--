import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const MOCK_NAMES = [
  "陳小明", "林怡君", "張雅婷", "李志偉", "王淑芬", "吳俊傑", "劉欣怡", "黃家豪", "楊宗翰", "趙婷婷",
  "周志明", "徐佳穎", "孫偉哲", "朱麗君", "馬國強", "胡佩珊", "郭建宏", "何秀英", "羅文傑", "高美玲",
  "鄭雅雯", "謝志豪", "韓信", "唐伯虎", "祝英台", "梁山伯", "賈寶玉", "林黛玉", "孫悟空", "豬八戒",
  "沙悟淨", "唐三藏", "曹操", "劉備", "孫權", "諸葛亮", "關羽", "張飛", "趙雲", "黃忠",
  "陳建宏", "林志玲", "張惠妹", "李白", "杜甫", "王維", "蘇軾", "白居易", "李商隱", "杜牧",
  "歐陽修", "王安石", "曾鞏", "韓愈", "柳宗元", "陸游", "辛棄疾", "李清照", "岳飛", "文天祥",
  "鄭成功", "林則徐", "孫中山", "蔣中正", "李登輝", "陳水扁", "馬英九", "蔡英文", "賴清德", "柯文哲",
  "韓國瑜", "郭台銘", "張忠謀", "黃仁勳", "蘇姿丰", "馬斯克", "賈伯斯", "比爾蓋茲", "巴菲特", "貝佐斯",
  "祖克柏", "庫克", "皮查伊", "納德拉", "奧特曼", "馬雲", "馬化騰", "李嘉誠", "王永慶", "施振榮",
  "林百里", "童子賢", "陳泰銘", "蔡宏圖", "吳東進", "魏應州", "蔡衍明", "尹衍樑", "林書豪", "王建民",
  "戴資穎", "郭婞淳", "楊勇緯", "李智凱", "莊智淵", "林昀儒", "鄭怡靜", "雷千瑩", "湯智鈞", "魏均珩",
  "鄧宇成", "李洋", "王齊麟", "周天成", "王子維", "陳金鋒", "彭政閔", "林智勝", "張泰山", "高國輝"
];

export function generateMockNames(count: number = 20, exclude: string[] = []): string[] {
  // Filter out excluded names from the pool
  const availableNames = MOCK_NAMES.filter(name => !exclude.includes(name));
  
  // If we have enough unique available names, pick from them
  if (count <= availableNames.length) {
    return [...availableNames].sort(() => 0.5 - Math.random()).slice(0, count);
  }
  
  // If not enough unique names, take all available ones first
  const result = [...availableNames];
  
  // Then fill the rest from the full pool (allowing duplicates)
  const remainingCount = count - result.length;
  for (let i = 0; i < remainingCount; i++) {
    const randomName = MOCK_NAMES[Math.floor(Math.random() * MOCK_NAMES.length)];
    result.push(randomName);
  }
  
  return result;
}
