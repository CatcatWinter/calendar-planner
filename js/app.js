/**
 * Main Application
 * 主应用程序
 */

const App = {
    currentSection: 'calendar',

    /**
     * 初始化应用
     */
    init() {
        this.bindNavigation();
        this.initTheme();
        this.initModules();
        this.initConverter();
        
        // 初始化图标
        lucide.createIcons();
    },

    /**
     * 绑定导航
     */
    bindNavigation() {
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const section = e.currentTarget.dataset.section;
                this.switchSection(section);
            });
        });
    },

    /**
     * 切换区域
     */
    switchSection(sectionId) {
        // 更新导航按钮
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.section === sectionId);
        });

        // 更新区域显示
        document.querySelectorAll('.section').forEach(section => {
            section.classList.toggle('active', section.id === sectionId);
        });

        this.currentSection = sectionId;

        // 重新初始化图标
        lucide.createIcons();
    },

    /**
     * 初始化主题
     */
    initTheme() {
        const savedTheme = Utils.loadFromStorage('theme');
        if (savedTheme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
            this.updateThemeIcon('dark');
        }

        document.getElementById('themeToggle').addEventListener('click', () => {
            this.toggleTheme();
        });
    },

    /**
     * 切换主题
     */
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        if (newTheme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }

        Utils.saveToStorage('theme', newTheme);
        this.updateThemeIcon(newTheme);
        lucide.createIcons();
    },

    /**
     * 更新主题图标
     */
    updateThemeIcon(theme) {
        const icon = document.querySelector('#themeToggle i');
        if (icon) {
            icon.setAttribute('data-lucide', theme === 'dark' ? 'sun' : 'moon');
            lucide.createIcons();
        }
    },

    /**
     * 初始化模块
     */
    initModules() {
        Calendar.init();
        Planner.init();
    },

    /**
     * 初始化转换器
     */
    initConverter() {
        this.initConverterTabs();
        this.initConverterSelects();
        this.initConverterButtons();
        this.initSolarTermsGrid();
    },

    /**
     * 初始化转换器标签
     */
    initConverterTabs() {
        document.querySelectorAll('.converter-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const type = e.currentTarget.dataset.type;
                
                document.querySelectorAll('.converter-tab').forEach(t => {
                    t.classList.toggle('active', t.dataset.type === type);
                });

                document.getElementById('solarToLunarForm').classList.toggle('active', type === 'solar-to-lunar');
                document.getElementById('lunarToSolarForm').classList.toggle('active', type === 'lunar-to-solar');
            });
        });
    },

    /**
     * 初始化转换器选择器
     */
    initConverterSelects() {
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth() + 1;
        const currentDay = new Date().getDate();

        // 阳历年份
        const solarYear = document.getElementById('solarYear');
        for (let year = 1900; year <= 2100; year++) {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year + '年';
            if (year === currentYear) option.selected = true;
            solarYear.appendChild(option);
        }

        // 阳历月份
        const solarMonth = document.getElementById('solarMonth');
        for (let month = 1; month <= 12; month++) {
            const option = document.createElement('option');
            option.value = month;
            option.textContent = month + '月';
            if (month === currentMonth) option.selected = true;
            solarMonth.appendChild(option);
        }

        // 阳历日期
        const solarDay = document.getElementById('solarDay');
        this.updateDayOptions(solarDay, currentYear, currentMonth, currentDay);

        // 阳历月份变化时更新日期选项
        solarMonth.addEventListener('change', () => {
            this.updateDayOptions(
                solarDay,
                parseInt(solarYear.value),
                parseInt(solarMonth.value)
            );
        });

        solarYear.addEventListener('change', () => {
            this.updateDayOptions(
                solarDay,
                parseInt(solarYear.value),
                parseInt(solarMonth.value)
            );
        });

        // 农历年份
        const lunarYear = document.getElementById('lunarYear');
        for (let year = 1900; year <= 2100; year++) {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = Lunar.getLunarYearCN(year);
            if (year === currentYear) option.selected = true;
            lunarYear.appendChild(option);
        }

        // 农历月份
        const lunarMonthSelect = document.getElementById('lunarMonthSelect');
        for (let month = 1; month <= 12; month++) {
            const option = document.createElement('option');
            option.value = month;
            option.textContent = Lunar.lunarMonths[month - 1] + '月';
            lunarMonthSelect.appendChild(option);
        }

        // 农历日期
        const lunarDay = document.getElementById('lunarDay');
        for (let day = 1; day <= 30; day++) {
            const option = document.createElement('option');
            option.value = day;
            option.textContent = Lunar.lunarDays[day - 1];
            lunarDay.appendChild(option);
        }
    },

    /**
     * 更新日期选项
     */
    updateDayOptions(select, year, month, selectedDay = 1) {
        const daysInMonth = Utils.getDaysInMonth(year, month - 1);
        select.innerHTML = '';
        
        for (let day = 1; day <= daysInMonth; day++) {
            const option = document.createElement('option');
            option.value = day;
            option.textContent = day + '日';
            if (day === selectedDay) option.selected = true;
            select.appendChild(option);
        }
    },

    /**
     * 初始化转换按钮
     */
    initConverterButtons() {
        // 阳历转阴历
        document.getElementById('convertToLunarBtn').addEventListener('click', () => {
            const year = parseInt(document.getElementById('solarYear').value);
            const month = parseInt(document.getElementById('solarMonth').value);
            const day = parseInt(document.getElementById('solarDay').value);

            const lunar = Lunar.solarToLunar(year, month, day);
            
            if (lunar) {
                document.getElementById('lunarResultValue').textContent = 
                    `${lunar.yearCN} ${lunar.monthCN}${lunar.dayCN}`;
                document.getElementById('lunarResultExtra').innerHTML = `
                    <span>${lunar.ganzhi}</span><br>
                    <span>生肖: ${lunar.shengxiao}</span>
                `;
                Utils.showToast('转换成功', 'success');
            } else {
                document.getElementById('lunarResultValue').textContent = '无法转换';
                document.getElementById('lunarResultExtra').textContent = '日期超出范围';
                Utils.showToast('日期超出有效范围', 'error');
            }
        });

        // 阴历转阳历
        document.getElementById('convertToSolarBtn').addEventListener('click', () => {
            const year = parseInt(document.getElementById('lunarYear').value);
            const month = parseInt(document.getElementById('lunarMonthSelect').value);
            const day = parseInt(document.getElementById('lunarDay').value);
            const isLeap = document.getElementById('isLeapMonth').checked;

            const solar = Lunar.lunarToSolar(year, month, day, isLeap);
            
            if (solar) {
                const date = new Date(solar.year, solar.month - 1, solar.day);
                document.getElementById('solarResultValue').textContent = 
                    Utils.formatDateCN(date);
                document.getElementById('solarResultExtra').textContent = 
                    Utils.getWeekdayCN(date);
                Utils.showToast('转换成功', 'success');
            } else {
                document.getElementById('solarResultValue').textContent = '无法转换';
                document.getElementById('solarResultExtra').textContent = '请检查日期是否有效';
                Utils.showToast('日期无效或超出范围', 'error');
            }
        });
    },

    /**
     * 初始化节气网格
     */
    initSolarTermsGrid() {
        const grid = document.getElementById('solarTermsGrid');
        const currentYear = new Date().getFullYear();
        const terms = Lunar.getAllSolarTerms(currentYear);

        terms.forEach(term => {
            const item = document.createElement('div');
            item.className = 'solar-term-item';
            item.innerHTML = `
                <div class="solar-term-name">${term.name}</div>
                <div class="solar-term-date">${term.month}月${term.day}日</div>
            `;
            
            // 点击跳转到日历
            item.addEventListener('click', () => {
                Calendar.currentYear = currentYear;
                Calendar.currentMonth = term.month - 1;
                Calendar.render();
                Calendar.selectDate(term.day);
                this.switchSection('calendar');
            });
            
            grid.appendChild(item);
        });
    }
};

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
