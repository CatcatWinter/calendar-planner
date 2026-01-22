/**
 * Lunar Calendar Calculation Module
 * 农历计算模块 - 支持1900-2100年
 */

const Lunar = {
    // 农历数据表 (1900-2100)
    lunarInfo: [
        0x04bd8, 0x04ae0, 0x0a570, 0x054d5, 0x0d260, 0x0d950, 0x16554, 0x056a0, 0x09ad0, 0x055d2,
        0x04ae0, 0x0a5b6, 0x0a4d0, 0x0d250, 0x1d255, 0x0b540, 0x0d6a0, 0x0ada2, 0x095b0, 0x14977,
        0x04970, 0x0a4b0, 0x0b4b5, 0x06a50, 0x06d40, 0x1ab54, 0x02b60, 0x09570, 0x052f2, 0x04970,
        0x06566, 0x0d4a0, 0x0ea50, 0x06e95, 0x05ad0, 0x02b60, 0x186e3, 0x092e0, 0x1c8d7, 0x0c950,
        0x0d4a0, 0x1d8a6, 0x0b550, 0x056a0, 0x1a5b4, 0x025d0, 0x092d0, 0x0d2b2, 0x0a950, 0x0b557,
        0x06ca0, 0x0b550, 0x15355, 0x04da0, 0x0a5b0, 0x14573, 0x052b0, 0x0a9a8, 0x0e950, 0x06aa0,
        0x0aea6, 0x0ab50, 0x04b60, 0x0aae4, 0x0a570, 0x05260, 0x0f263, 0x0d950, 0x05b57, 0x056a0,
        0x096d0, 0x04dd5, 0x04ad0, 0x0a4d0, 0x0d4d4, 0x0d250, 0x0d558, 0x0b540, 0x0b6a0, 0x195a6,
        0x095b0, 0x049b0, 0x0a974, 0x0a4b0, 0x0b27a, 0x06a50, 0x06d40, 0x0af46, 0x0ab60, 0x09570,
        0x04af5, 0x04970, 0x064b0, 0x074a3, 0x0ea50, 0x06b58, 0x05ac0, 0x0ab60, 0x096d5, 0x092e0,
        0x0c960, 0x0d954, 0x0d4a0, 0x0da50, 0x07552, 0x056a0, 0x0abb7, 0x025d0, 0x092d0, 0x0cab5,
        0x0a950, 0x0b4a0, 0x0baa4, 0x0ad50, 0x055d9, 0x04ba0, 0x0a5b0, 0x15176, 0x052b0, 0x0a930,
        0x07954, 0x06aa0, 0x0ad50, 0x05b52, 0x04b60, 0x0a6e6, 0x0a4e0, 0x0d260, 0x0ea65, 0x0d530,
        0x05aa0, 0x076a3, 0x096d0, 0x04afb, 0x04ad0, 0x0a4d0, 0x1d0b6, 0x0d250, 0x0d520, 0x0dd45,
        0x0b5a0, 0x056d0, 0x055b2, 0x049b0, 0x0a577, 0x0a4b0, 0x0aa50, 0x1b255, 0x06d20, 0x0ada0,
        0x14b63, 0x09370, 0x049f8, 0x04970, 0x064b0, 0x168a6, 0x0ea50, 0x06b20, 0x1a6c4, 0x0aae0,
        0x0a2e0, 0x0d2e3, 0x0c960, 0x0d557, 0x0d4a0, 0x0da50, 0x05d55, 0x056a0, 0x0a6d0, 0x055d4,
        0x052d0, 0x0a9b8, 0x0a950, 0x0b4a0, 0x0b6a6, 0x0ad50, 0x055a0, 0x0aba4, 0x0a5b0, 0x052b0,
        0x0b273, 0x06930, 0x07337, 0x06aa0, 0x0ad50, 0x14b55, 0x04b60, 0x0a570, 0x054e4, 0x0d160,
        0x0e968, 0x0d520, 0x0daa0, 0x16aa6, 0x056d0, 0x04ae0, 0x0a9d4, 0x0a2d0, 0x0d150, 0x0f252,
        0x0d520
    ],

    // 天干
    tianGan: ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'],
    
    // 地支
    diZhi: ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'],
    
    // 生肖
    shengXiao: ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'],
    
    // 农历月份
    lunarMonths: ['正', '二', '三', '四', '五', '六', '七', '八', '九', '十', '冬', '腊'],
    
    // 农历日期
    lunarDays: [
        '初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
        '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
        '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十'
    ],

    // 24节气
    solarTerms: [
        '小寒', '大寒', '立春', '雨水', '惊蛰', '春分',
        '清明', '谷雨', '立夏', '小满', '芒种', '夏至',
        '小暑', '大暑', '立秋', '处暑', '白露', '秋分',
        '寒露', '霜降', '立冬', '小雪', '大雪', '冬至'
    ],

    // 节气日期偏移数据
    solarTermInfo: [
        0, 21208, 42467, 63836, 85337, 107014, 128867, 150921, 173149, 195551,
        218072, 240693, 263343, 285989, 308563, 331033, 353350, 375494, 397447,
        419210, 440795, 462224, 483532, 504758
    ],

    // 农历节日
    lunarFestivals: {
        '1-1': '春节',
        '1-15': '元宵节',
        '2-2': '龙抬头',
        '5-5': '端午节',
        '7-7': '七夕节',
        '7-15': '中元节',
        '8-15': '中秋节',
        '9-9': '重阳节',
        '12-8': '腊八节',
        '12-23': '小年',
        '12-30': '除夕'
    },

    // 公历节日
    solarFestivals: {
        '1-1': '元旦',
        '2-14': '情人节',
        '3-8': '妇女节',
        '3-12': '植树节',
        '4-1': '愚人节',
        '5-1': '劳动节',
        '5-4': '青年节',
        '6-1': '儿童节',
        '7-1': '建党节',
        '8-1': '建军节',
        '9-10': '教师节',
        '10-1': '国庆节',
        '12-25': '圣诞节'
    },

    /**
     * 获取农历年份的总天数
     */
    getLunarYearDays(year) {
        let sum = 348;
        for (let i = 0x8000; i > 0x8; i >>= 1) {
            sum += (this.lunarInfo[year - 1900] & i) ? 1 : 0;
        }
        return sum + this.getLeapDays(year);
    },

    /**
     * 获取闰月的天数
     */
    getLeapDays(year) {
        if (this.getLeapMonth(year)) {
            return (this.lunarInfo[year - 1900] & 0x10000) ? 30 : 29;
        }
        return 0;
    },

    /**
     * 获取闰月月份 (0表示无闰月)
     */
    getLeapMonth(year) {
        return this.lunarInfo[year - 1900] & 0xf;
    },

    /**
     * 获取农历月份的天数
     */
    getLunarMonthDays(year, month) {
        return (this.lunarInfo[year - 1900] & (0x10000 >> month)) ? 30 : 29;
    },

    /**
     * 公历转农历
     */
    solarToLunar(year, month, day) {
        if (year < 1900 || year > 2100) {
            return null;
        }

        let offset = Math.floor((Date.UTC(year, month - 1, day) - Date.UTC(1900, 0, 31)) / 86400000);
        
        let lunarYear = 1900;
        let temp = 0;

        // 计算农历年
        for (lunarYear = 1900; lunarYear < 2101 && offset > 0; lunarYear++) {
            temp = this.getLunarYearDays(lunarYear);
            offset -= temp;
        }

        if (offset < 0) {
            offset += temp;
            lunarYear--;
        }

        // 闰月
        const leapMonth = this.getLeapMonth(lunarYear);
        let isLeap = false;

        // 计算农历月
        let lunarMonth = 1;
        for (lunarMonth = 1; lunarMonth < 13 && offset > 0; lunarMonth++) {
            if (leapMonth > 0 && lunarMonth === (leapMonth + 1) && !isLeap) {
                --lunarMonth;
                isLeap = true;
                temp = this.getLeapDays(lunarYear);
            } else {
                temp = this.getLunarMonthDays(lunarYear, lunarMonth);
            }

            if (isLeap && lunarMonth === (leapMonth + 1)) {
                isLeap = false;
            }
            offset -= temp;
        }

        if (offset === 0 && leapMonth > 0 && lunarMonth === leapMonth + 1) {
            if (isLeap) {
                isLeap = false;
            } else {
                isLeap = true;
                --lunarMonth;
            }
        }

        if (offset < 0) {
            offset += temp;
            --lunarMonth;
        }

        const lunarDay = offset + 1;

        return {
            year: lunarYear,
            month: lunarMonth,
            day: lunarDay,
            isLeap: isLeap,
            yearCN: this.getLunarYearCN(lunarYear),
            monthCN: (isLeap ? '闰' : '') + this.lunarMonths[lunarMonth - 1] + '月',
            dayCN: this.lunarDays[lunarDay - 1],
            ganzhi: this.getGanZhi(lunarYear, lunarMonth, lunarDay),
            shengxiao: this.getShengXiao(lunarYear)
        };
    },

    /**
     * 农历转公历
     */
    lunarToSolar(year, month, day, isLeap = false) {
        if (year < 1900 || year > 2100) {
            return null;
        }

        const leapMonth = this.getLeapMonth(year);
        
        // 检查闰月有效性
        if (isLeap && month !== leapMonth) {
            return null;
        }

        // 计算从1900年1月31日到目标日期的天数
        let offset = 0;

        // 加上之前年份的天数
        for (let i = 1900; i < year; i++) {
            offset += this.getLunarYearDays(i);
        }

        // 加上当年之前月份的天数
        for (let i = 1; i < month; i++) {
            offset += this.getLunarMonthDays(year, i);
            if (i === leapMonth) {
                offset += this.getLeapDays(year);
            }
        }

        // 如果是闰月后面的月份
        if (isLeap) {
            offset += this.getLunarMonthDays(year, month);
        }

        // 加上当月的天数
        offset += day - 1;

        // 计算公历日期
        const baseDate = new Date(1900, 0, 31);
        const targetDate = new Date(baseDate.getTime() + offset * 86400000);

        return {
            year: targetDate.getFullYear(),
            month: targetDate.getMonth() + 1,
            day: targetDate.getDate()
        };
    },

    /**
     * 获取农历年的中文表示
     */
    getLunarYearCN(year) {
        const tianGanIndex = (year - 4) % 10;
        const diZhiIndex = (year - 4) % 12;
        return this.tianGan[tianGanIndex] + this.diZhi[diZhiIndex] + '年';
    },

/**
 * 获取干支（修复版）
 * @param {number} lunarYear - 农历年
 * @param {number} lunarMonth - 农历月
 * @param {number} lunarDay - 农历日
 */
getGanZhi(lunarYear, lunarMonth, lunarDay) {
    // ========== 年干支 ==========
    // 以立春为界，这里简化处理，使用农历年
    const yearGan = (lunarYear - 4) % 10;
    const yearZhi = (lunarYear - 4) % 12;
    const yearGanZhi = this.tianGan[yearGan] + this.diZhi[yearZhi] + '年';

    // ========== 月干支 ==========
    // 月干公式：年干决定月干起点
    const monthZhi = (lunarMonth + 1) % 12; // 寅月=1月，卯月=2月...
    
    // 根据年干确定正月（寅月）的月干
    const yearGanIndex = (lunarYear - 4) % 10;
    let monthGanStart;
    switch (yearGanIndex) {
        case 0: // 甲
        case 5: // 己
            monthGanStart = 2; // 丙
            break;
        case 1: // 乙
        case 6: // 庚
            monthGanStart = 4; // 戊
            break;
        case 2: // 丙
        case 7: // 辛
            monthGanStart = 6; // 庚
            break;
        case 3: // 丁
        case 8: // 壬
            monthGanStart = 8; // 壬
            break;
        case 4: // 戊
        case 9: // 癸
            monthGanStart = 0; // 甲
            break;
        default:
            monthGanStart = 0;
    }
    const monthGan = (monthGanStart + lunarMonth - 1) % 10;
    const monthGanZhi = this.tianGan[monthGan] + this.diZhi[monthZhi] + '月';

    // ========== 日干支 ==========
    // 关键修复：需要先将农历转换为公历，再计算日干支
    const solarDate = this.lunarToSolar(lunarYear, lunarMonth, lunarDay, false);
    
    if (!solarDate) {
        return yearGanZhi + ' ' + monthGanZhi + ' 未知';
    }
    
    // 计算从1900年1月1日到目标公历日期的天数
    const baseDate = Date.UTC(1900, 0, 1); // 1900年1月1日
    const targetDate = Date.UTC(solarDate.year, solarDate.month - 1, solarDate.day);
    const daysDiff = Math.floor((targetDate - baseDate) / 86400000);
    
    // 1900年1月1日是甲戌日：天干=0(甲)，地支=10(戌)
    const baseDayGan = 0;  // 甲
    const baseDayZhi = 10; // 戌
    
    const dayGan = (baseDayGan + daysDiff) % 10;
    const dayZhi = (baseDayZhi + daysDiff) % 12;
    const dayGanZhi = this.tianGan[dayGan] + this.diZhi[dayZhi] + '日';

    return yearGanZhi + ' ' + monthGanZhi + ' ' + dayGanZhi;
},


    /**
     * 获取生肖
     */
    getShengXiao(year) {
        return this.shengXiao[(year - 4) % 12];
    },

    /**
     * 获取节气
     */
    getSolarTerm(year, month, day) {
        const date = new Date(year, month - 1, day);
        
        for (let i = 0; i < 24; i++) {
            const termDate = this.getSolarTermDate(year, i);
            if (termDate.getMonth() === date.getMonth() && termDate.getDate() === date.getDate()) {
                return this.solarTerms[i];
            }
        }
        return null;
    },

    /**
     * 获取节气日期
     */
    getSolarTermDate(year, n) {
        const base = Date.UTC(1900, 0, 6, 2, 5, 0);
        const offset = 31556925974.7 * (year - 1900) + this.solarTermInfo[n] * 60000;
        return new Date(base + offset);
    },

    /**
     * 获取某年所有节气
     */
    getAllSolarTerms(year) {
        const terms = [];
        for (let i = 0; i < 24; i++) {
            const date = this.getSolarTermDate(year, i);
            terms.push({
                name: this.solarTerms[i],
                date: date,
                month: date.getMonth() + 1,
                day: date.getDate()
            });
        }
        return terms;
    },

    /**
     * 获取农历节日
     */
    getLunarFestival(month, day) {
        const key = `${month}-${day}`;
        return this.lunarFestivals[key] || null;
    },

    /**
     * 获取公历节日
     */
    getSolarFestival(month, day) {
        const key = `${month}-${day}`;
        return this.solarFestivals[key] || null;
    },

    /**
     * 获取日期完整信息
     */
    getDateInfo(year, month, day) {
        const lunar = this.solarToLunar(year, month, day);
        if (!lunar) return null;

        const solarTerm = this.getSolarTerm(year, month, day);
        const lunarFestival = this.getLunarFestival(lunar.month, lunar.day);
        const solarFestival = this.getSolarFestival(month, day);

        return {
            solar: { year, month, day },
            lunar: lunar,
            solarTerm: solarTerm,
            lunarFestival: lunarFestival,
            solarFestival: solarFestival,
            festival: lunarFestival || solarFestival,
            displayText: solarTerm || lunarFestival || solarFestival || lunar.dayCN
        };
    }
};
