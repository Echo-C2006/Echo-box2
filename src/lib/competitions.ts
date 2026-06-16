export interface CompetitionSeed {
  name: string;
  category: string;
  description: string;
}

export const defaultCompetitions: CompetitionSeed[] = [
  { name: "全国大学生数学建模竞赛", category: "数学建模", description: "高教社杯全国大学生数学建模竞赛，每年9月举行。" },
  { name: "美国大学生数学建模竞赛 (MCM/ICM)", category: "数学建模", description: "国际级数学建模赛事，每年1-2月举行。" },
  { name: "挑战杯全国大学生课外学术科技作品竞赛", category: "创新创业", description: "共青团中央主办的全国性大学生科技创新竞赛。" },
  { name: "互联网+大学生创新创业大赛", category: "创新创业", description: "教育部主办的国家级创新创业大赛。" },
  { name: "ACM-ICPC 国际大学生程序设计竞赛", category: "程序设计", description: "国际计算机学会主办的年度竞赛。" },
  { name: "中国大学生计算机设计大赛", category: "程序设计", description: "教育部高等学校计算机类专业教指委主办。" },
  { name: "蓝桥杯全国软件和信息技术专业人才大赛", category: "程序设计", description: "工信部人才交流中心主办，含省赛和国赛。" },
  { name: "全国大学生电子设计竞赛", category: "电子工程", description: "教育部高等教育司主办，两年一届。" },
  { name: "RoboMaster 机甲大师赛", category: "机器人", description: "大疆创新主办的机器人对抗赛。" },
  { name: "全国大学生智能汽车竞赛", category: "电子工程", description: "教育部高等学校自动化类专业教指委主办。" },
  { name: "外研社·国才杯全国英语演讲/写作/阅读大赛", category: "英语", description: "外语教学与研究出版社主办。" },
  { name: "全国大学生广告艺术大赛", category: "艺术设计", description: "教育部高等教育司指导的文科竞赛。" },
  { name: "全国大学生机械创新设计大赛", category: "机械工程", description: "教育部高等学校机械学科教指委主办。" },
  { name: "全国大学生结构设计竞赛", category: "土木工程", description: "教育部高等学校土木工程专业教指委主办。" },
  { name: "中国研究生数学建模竞赛", category: "数学建模", description: "面向研究生的数学建模赛事。" },
];
