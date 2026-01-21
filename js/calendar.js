/**
 * Calendar Module
 * 日历模块
 */

const Calendar = {
    currentYear: new Date().getFullYear(),
    currentMonth: new Date().getMonth(),
    selectedDate: null,

    /**
     * 初始化日历
     */
    init() {
        this.bindEvents();
        this.initSelectors();
        this.render();
    },

    /**
     * 绑定事件
     */
    bindEvents() {
        document.getElementById('prevMonth').addEventListener('click', () => this.prevMonth());
        document.getElementById('nextMonth').addEventListener('click', () => this.nextMonth());
        document.getElementById('todayBtn').addEventListener('click', () => this.goToToday());
        document.getElementById('closePanelBtn').addEventListener('click', () => this.closeDetailPanel());

        document.getElementById('yearSelect').addEventListener('change', (e) => {
            this.currentYear = parseInt(e.target.value);
            this.render();
        });

        document.getElementById('monthSelect').addEventListener('change', (e) => {
            this.currentMonth = parseInt(e.target.value);
            this.render();
        });
    },

    /**
     * 初始化年月选择器
     */
    initSelectors() {
        const yearSelect = document.getElementById('yearSelect');
        const currentYear = new Date().getFullYear();

        // 填充年份选项 (1900-2100)
        for (let year = 1900; year <= 2100; year++) {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year + '年';
            if (year === currentYear) {
                option.selected = true;
            }
            yearSelect.appendChild(option);
        }

        // 设置当前月份
        document.getElementById('monthSelect').value = new Date().getMonth();
    },

    /**
     * 渲染日历
     */
    render() {
        this.renderHeader();
        this.renderGrid();
        this.updateSelectors();
    },

    /**
     * 渲染头部
     */
    renderHeader() {
        const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月',
                           '七月', '八月', '九月', '十月', '十一月', '十二月'];
        
         document.getElementById('currentMonth').textContent = `${this.currentYear}年 ${monthNames[this.currentMonth]}`;

        // 获取农历月份
        const firstDayLunar = Lunar.solarToLunar(this.currentYear, this.currentMonth + 1, 1);
        if (firstDayLunar) {
            document.getElementById('lunarMonth').textContent = `${firstDayLunar.yearCN} ${firstDayLunar.monthCN}`;
        }
    },

    /**
     * 渲染日历网格
     */
    renderGrid() {
        const grid = document.getElementById('calendarGrid');
        grid.innerHTML = '';

        const firstDay = new Date(this.currentYear, this.currentMonth, 1);
        const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);
        const startDay = firstDay.getDay();
        const totalDays = lastDay.getDate();

        const today = new Date();

        // 填充空白日期
        for (let i = 0; i < startDay; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.className = 'calendar-day empty';
            grid.appendChild(emptyCell);
        }

        // 填充日期
        for (let day = 1; day <= totalDays; day++) {
            const dateInfo = Lunar.getDateInfo(this.currentYear, this.currentMonth + 1, day);
            const cell = this.createDayCell(day, dateInfo, today);
            grid.appendChild(cell);
        }
    },

    /**
     * 创建日期单元格
     */
    createDayCell(day, dateInfo, today) {
        const cell = document.createElement('div');
        cell.className = 'calendar-day';
        cell.dataset.day = day;

        // 检查是否是今天
        const isToday = today.getFullYear() === this.currentYear &&
                        today.getMonth() === this.currentMonth &&
                        today.getDate() === day;

        if (isToday) {
            cell.classList.add('today');
        }

        // 检查是否是选中日期
        if (this.selectedDate &&
            this.selectedDate.year === this.currentYear &&
            this.selectedDate.month === this.currentMonth &&
            this.selectedDate.day === day) {
            cell.classList.add('selected');
        }

        // 检查是否是周末
        const currentDate = new Date(this.currentYear, this.currentMonth, day);
        if (currentDate.getDay() === 0 || currentDate.getDay() === 6) {
            cell.classList.add('weekend');
        }

        // 检查是否有节日或节气
        if (dateInfo) {
            if (dateInfo.lunarFestival || dateInfo.solarFestival) {
                cell.classList.add('has-festival');
            }
            if (dateInfo.solarTerm) {
                cell.classList.add('has-solar-term');
            }
        }

        // 日期数字
        const dayNumber = document.createElement('span');
        dayNumber.className = 'day-number';
        dayNumber.textContent = day;
        cell.appendChild(dayNumber);

        // 农历日期
        const dayLunar = document.createElement('span');
        dayLunar.className = 'day-lunar';
        dayLunar.textContent = dateInfo ? dateInfo.displayText : '';
        cell.appendChild(dayLunar);

        // 点击事件
        cell.addEventListener('click', () => this.selectDate(day));

        return cell;
    },

    /**
     * 选择日期
     */
    selectDate(day) {
        // 移除之前选中的
        const prevSelected = document.querySelector('.calendar-day.selected');
        if (prevSelected) {
            prevSelected.classList.remove('selected');
        }

        // 添加新选中
        const cells = document.querySelectorAll('.calendar-day:not(.empty)');
        cells.forEach(cell => {
            if (parseInt(cell.dataset.day) === day) {
                cell.classList.add('selected');
            }
        });

        this.selectedDate = {
            year: this.currentYear,
            month: this.currentMonth,
            day: day
        };

        this.showDetailPanel(day);
    },

    /**
     * 显示日期详情面板
     */
    showDetailPanel(day) {
        const panel = document.getElementById('dateDetailPanel');
        const dateInfo = Lunar.getDateInfo(this.currentYear, this.currentMonth + 1, day);

        if (!dateInfo) return;

        const date = new Date(this.currentYear, this.currentMonth, day);

        // 更新面板内容
        document.getElementById('detailDay').textContent = day;
        document.getElementById('detailSolarDate').textContent = Utils.formatDateCN(date);
        document.getElementById('detailWeekday').textContent = Utils.getWeekdayCN(date);

        document.getElementById('detailLunarDate').textContent =
            `农历${dateInfo.lunar.monthCN}${dateInfo.lunar.dayCN}`;
        document.getElementById('detailGanzhi').textContent = dateInfo.lunar.ganzhi;

        // 节气
        const solarTermRow = document.getElementById('detailSolarTermRow');
        if (dateInfo.solarTerm) {
            document.getElementById('detailSolarTerm').textContent = dateInfo.solarTerm;
            solarTermRow.style.display = 'flex';
        } else {
            solarTermRow.style.display = 'none';
        }

        // 节日
        const festivalRow = document.getElementById('detailFestivalRow');
        const festivals = [];
        if (dateInfo.lunarFestival) festivals.push(dateInfo.lunarFestival);
        if (dateInfo.solarFestival) festivals.push(dateInfo.solarFestival);

        if (festivals.length > 0) {
            document.getElementById('detailFestival').textContent = festivals.join('、');
            festivalRow.style.display = 'flex';
        } else {
            festivalRow.style.display = 'none';
        }

        panel.classList.add('visible');
        lucide.createIcons();
    },

    /**
     * 关闭详情面板
     */
    closeDetailPanel() {
        document.getElementById('dateDetailPanel').classList.remove('visible');
    },

    /**
     * 上一月
     */
    prevMonth() {
        this.currentMonth--;
        if (this.currentMonth < 0) {
            this.currentMonth = 11;
            this.currentYear--;
        }
        this.render();
    },

    /**
     * 下一月
     */
    nextMonth() {
        this.currentMonth++;
        if (this.currentMonth > 11) {
            this.currentMonth = 0;
            this.currentYear++;
        }
        this.render();
    },

    /**
     * 回到今天
     */
    goToToday() {
        const today = new Date();
        this.currentYear = today.getFullYear();
        this.currentMonth = today.getMonth();
        this.render();
        this.selectDate(today.getDate());
    },

    /**
     * 更新选择器
     */
    updateSelectors() {
        document.getElementById('yearSelect').value = this.currentYear;
        document.getElementById('monthSelect').value = this.currentMonth;
    }
};
