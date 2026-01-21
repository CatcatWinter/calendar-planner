/**
 * Planner Module
 * 智能计划生成模块
 */

const Planner = {
    selectedHours: 1,
    intensity: 3,

    /**
     * 初始化计划生成器
     */
    init() {
        this.bindEvents();
        this.setDefaultDates();
    },

    /**
     * 绑定事件
     */
    bindEvents() {
        // 时间选项
        document.querySelectorAll('.time-option').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.time-option').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.selectedHours = parseFloat(e.target.dataset.hours);
            });
        });

        // 强度滑块
        document.getElementById('intensitySlider').addEventListener('input', (e) => {
            this.intensity = parseInt(e.target.value);
        });

        // 生成按钮
        document.getElementById('generatePlanBtn').addEventListener('click', () => {
            this.generatePlan();
        });
    },

    /**
     * 设置默认日期
     */
    setDefaultDates() {
        const today = new Date();
        const endDate = Utils.addDays(today, 30);

        document.getElementById('startDate').value = this.formatDateForInput(today);
        document.getElementById('endDate').value = this.formatDateForInput(endDate);
    },

    /**
     * 格式化日期用于input
     */
    formatDateForInput(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    },

    /**
     * 验证输入
     */
    validateInputs() {
        const title = document.getElementById('goalTitle').value.trim();
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;

        if (!title) {
            Utils.showToast('请输入项目或目标名称', 'error');
            return false;
        }

        if (!startDate || !endDate) {
            Utils.showToast('请选择开始和目标日期', 'error');
            return false;
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        if (end <= start) {
            Utils.showToast('目标日期必须晚于开始日期', 'error');
            return false;
        }

        return true;
    },

    /**
     * 生成计划
     */
    async generatePlan() {
        if (!this.validateInputs()) return;

        Utils.showLoading();

        // 模拟异步处理
        await new Promise(resolve => setTimeout(resolve, 1000));

        const title = document.getElementById('goalTitle').value.trim();
        const description = document.getElementById('goalDescription').value.trim();
        const startDate = new Date(document.getElementById('startDate').value);
        const endDate = new Date(document.getElementById('endDate').value);
        const totalDays = Utils.daysBetween(startDate, endDate);
        const totalHours = totalDays * this.selectedHours;

        // 生成计划结构
        const plan = this.createPlanStructure({
            title,
            description,
            startDate,
            endDate,
            totalDays,
            totalHours,
            hoursPerDay: this.selectedHours,
            intensity: this.intensity
        });

        this.renderPlan(plan);
        Utils.hideLoading();
        Utils.showToast('计划生成成功！', 'success');
    },

    /**
     * 创建计划结构
     */
    createPlanStructure(config) {
        const { title, description, startDate, endDate, totalDays, totalHours, hoursPerDay, intensity } = config;

        // 根据项目类型生成阶段
        const phases = this.generatePhases(title, description, totalDays, intensity);

        // 为每个阶段生成任务
        phases.forEach((phase, index) => {
            phase.tasks = this.generateTasks(phase, title, description, hoursPerDay);
            phase.startDate = Utils.addDays(startDate, phase.startDay);
            phase.endDate = Utils.addDays(startDate, phase.endDay);
        });

        return {
            id: Utils.generateId(),
            title,
            description,
            startDate,
            endDate,
            totalDays,
            totalHours,
            hoursPerDay,
            intensity,
            phases,
            createdAt: new Date()
        };
    },

    /**
     * 生成阶段
     */
    generatePhases(title, description, totalDays, intensity) {
        const lowerTitle = title.toLowerCase();
        const lowerDesc = description.toLowerCase();

        // 判断项目类型
        let phaseTemplates;

        if (this.containsKeywords(lowerTitle + lowerDesc, ['学习', '课程', '考试', '认证', '语言', '日语', '英语', '编程'])) {
            phaseTemplates = this.getLearningPhases();
        } else if (this.containsKeywords(lowerTitle + lowerDesc, ['健身', '减肥', '运动', '锻炼', '跑步', '马拉松'])) {
            phaseTemplates = this.getFitnessPhases();
        } else if (this.containsKeywords(lowerTitle + lowerDesc, ['项目', '产品', '开发', '上线', '发布', '创业'])) {
            phaseTemplates = this.getProjectPhases();
        } else if (this.containsKeywords(lowerTitle + lowerDesc, ['写作', '书', '论文', '文章', '博客'])) {
            phaseTemplates = this.getWritingPhases();
        } else if (this.containsKeywords(lowerTitle + lowerDesc, ['技能', '技术', '专业', '提升', '进阶'])) {
            phaseTemplates = this.getSkillPhases();
        } else {
            phaseTemplates = this.getGeneralPhases();
        }

        // 根据天数分配阶段
        const phases = [];
        let currentDay = 0;

        phaseTemplates.forEach((template, index) => {
            const phaseDays = Math.floor(totalDays * template.ratio);
            phases.push({
                number: index + 1,
                title: template.title,
                description: template.description,
                startDay: currentDay,
                endDay: currentDay + phaseDays - 1,
                duration: phaseDays,
                type: template.type
            });
            currentDay += phaseDays;
        });

        // 确保最后一个阶段到达终点
        if (phases.length > 0) {
            phases[phases.length - 1].endDay = totalDays - 1;
            phases[phases.length - 1].duration = totalDays - 1 - phases[phases.length - 1].startDay + 1;
        }

        return phases;
    },

    /**
     * 检查关键词
     */
    containsKeywords(text, keywords) {
        return keywords.some(keyword => text.includes(keyword));
    },

    /**
     * 学习类阶段模板
     */
    getLearningPhases() {
        return [
            { title: '基础入门', description: '建立知识框架，掌握基本概念', ratio: 0.25, type: 'foundation' },
            { title: '系统学习', description: '深入学习核心内容，建立知识体系', ratio: 0.35, type: 'learning' },
            { title: '实践应用', description: '通过练习巩固所学，积累实战经验', ratio: 0.25, type: 'practice' },
            { title: '冲刺提升', description: '查漏补缺，模拟测试，全面提升', ratio: 0.15, type: 'review' }
        ];
    },

    /**
     * 健身类阶段模板
     */
    getFitnessPhases() {
        return [
            { title: '适应期', description: '建立运动习惯，适应训练强度', ratio: 0.2, type: 'adaptation' },
            { title: '提升期', description: '逐步增加强度，提升体能水平', ratio: 0.35, type: 'improvement' },
            { title: '强化期', description: '高强度训练，突破瓶颈', ratio: 0.3, type: 'intensive' },
            { title: '调整期', description: '恢复调整，巩固成果', ratio: 0.15, type: 'recovery' }
        ];
    },

    /**
     * 项目类阶段模板
     */
    getProjectPhases() {
        return [
            { title: '规划阶段', description: '需求分析，制定计划，资源准备', ratio: 0.15, type: 'planning' },
            { title: '开发阶段', description: '核心功能开发，迭代推进', ratio: 0.45, type: 'development' },
            { title: '测试优化', description: '测试验证，问题修复，性能优化', ratio: 0.25, type: 'testing' },
            { title: '上线部署', description: '最终检查，正式发布，监控运营', ratio: 0.15, type: 'launch' }
        ];
    },

    /**
     * 写作类阶段模板
     */
    getWritingPhases() {
        return [
            { title: '素材收集', description: '收集资料，整理思路，确定大纲', ratio: 0.2, type: 'research' },
            { title: '初稿撰写', description: '完成初稿，搭建内容框架', ratio: 0.4, type: 'drafting' },
            { title: '修改润色', description: '反复修改，完善细节，提升质量', ratio: 0.25, type: 'editing' },
            { title: '定稿发布', description: '最终审核，排版发布', ratio: 0.15, type: 'publishing' }
        ];
    },

    /**
     * 技能类阶段模板
     */
    getSkillPhases() {
        return [
            { title: '了解认知', description: '了解领域，明确学习路径', ratio: 0.15, type: 'awareness' },
            { title: '技能习得', description: '系统学习，掌握核心技能', ratio: 0.4, type: 'acquisition' },
            { title: '刻意练习', description: '反复练习，形成肌肉记忆', ratio: 0.3, type: 'practice' },
            { title: '精通掌握', description: '综合运用，达到精通水平', ratio: 0.15, type: 'mastery' }
        ];
    },

    /**
     * 通用阶段模板
     */
    getGeneralPhases() {
        return [
            { title: '准备阶段', description: '明确目标，制定计划，准备资源', ratio: 0.15, type: 'preparation' },
            { title: '执行阶段', description: '按计划推进，持续行动', ratio: 0.5, type: 'execution' },
            { title: '优化阶段', description: '复盘调整，优化方法', ratio: 0.2, type: 'optimization' },
            { title: '收尾阶段', description: '总结成果，完成目标', ratio: 0.15, type: 'completion' }
        ];
    },

    /**
     * 生成任务
     */
    generateTasks(phase, title, description, hoursPerDay) {
        const taskCount = Math.min(Math.max(3, Math.floor(phase.duration / 3)), 8);
        const tasks = [];

        const taskTemplates = this.getTaskTemplates(phase.type, title);

        for (let i = 0; i < taskCount; i++) {
            const template = taskTemplates[i % taskTemplates.length];
            tasks.push({
                id: Utils.generateId(),
                text: template.text,
                tags: template.tags,
                completed: false,
                daysFromStart: Math.floor((i / taskCount) * phase.duration)
            });
        }

        return tasks;
    },

    /**
     * 获取任务模板
     */
    getTaskTemplates(phaseType, title) {
        const templates = {
            foundation: [
                { text: `收集${title}相关学习资料和教程`, tags: ['准备'] },
                { text: '制定详细的学习计划和时间表', tags: ['计划'] },
                { text: '了解核心概念和基本术语', tags: ['学习'] },
                { text: '完成入门级练习和示例', tags: ['练习'] },
                { text: '建立学习笔记体系', tags: ['记录'] },
                { text: '加入相关学习社群', tags: ['社交'] }
            ],
            learning: [
                { text: '系统学习核心章节内容', tags: ['学习'] },
                { text: '完成章节练习和作业', tags: ['练习'] },
                { text: '整理和复习学习笔记', tags: ['复习'] },
                { text: '解决学习中遇到的疑难点', tags: ['问题'] },
                { text: '与他人讨论交流学习心得', tags: ['交流'] },
                { text: '完成阶段性测试和评估', tags: ['测试'] }
            ],
            practice: [
                { text: '完成综合实践项目', tags: ['项目'] },
                { text: '模拟真实场景练习', tags: ['模拟'] },
                { text: '分析和总结常见错误', tags: ['总结'] },
                { text: '寻找实际应用机会', tags: ['应用'] },
                { text: '获取他人反馈和建议', tags: ['反馈'] },
                { text: '记录实践经验和教训', tags: ['记录'] }
            ],
            review: [
                { text: '全面复习所学内容', tags: ['复习'] },
                { text: '完成综合模拟测试', tags: ['测试'] },
                { text: '针对薄弱环节强化', tags: ['强化'] },
                { text: '整理最终复习资料', tags: ['整理'] },
                { text: '调整状态，保持信心', tags: ['心态'] },
                { text: '做好最终准备工作', tags: ['准备'] }
            ],
            adaptation: [
                { text: '进行身体状态评估', tags: ['评估'] },
                { text: '制定个人训练计划', tags: ['计划'] },
                { text: '学习正确的动作要领', tags: ['技巧'] },
                { text: '建立规律的作息习惯', tags: ['习惯'] },
                { text: '完成低强度适应训练', tags: ['训练'] },
                { text: '记录训练数据和感受', tags: ['记录'] }
            ],
            improvement: [
                { text: '逐步增加训练强度', tags: ['训练'] },
                { text: '尝试新的训练方法', tags: ['方法'] },
                { text: '监控身体恢复状态', tags: ['监控'] },
                { text: '优化营养和休息', tags: ['恢复'] },
                { text: '完成阶段性体能测试', tags: ['测试'] },
                { text: '调整训练计划', tags: ['调整'] }
            ],
            intensive: [
                { text: '进行高强度专项训练', tags: ['高强度'] },
                { text: '突破个人记录', tags: ['突破'] },
                { text: '强化薄弱环节', tags: ['强化'] },
                { text: '模拟目标场景训练', tags: ['模拟'] },
                { text: '保持训练节奏和强度', tags: ['坚持'] },
                { text: '注意伤病预防', tags: ['预防'] }
            ],
            recovery: [
                { text: '降低训练强度', tags: ['调整'] },
                { text: '进行恢复性训练', tags: ['恢复'] },
                { text: '总结训练成果', tags: ['总结'] },
                { text: '制定后续计划', tags: ['计划'] },
                { text: '保持基础训练', tags: ['保持'] },
                { text: '庆祝达成目标', tags: ['庆祝'] }
            ],
            planning: [
                { text: '明确项目目标和范围', tags: ['目标'] },
                { text: '进行需求分析和调研', tags: ['调研'] },
                { text: '制定项目里程碑', tags: ['计划'] },
                { text: '评估资源和风险', tags: ['评估'] },
                { text: '建立项目文档', tags: ['文档'] },
                { text: '确定技术方案', tags: ['方案'] }
            ],
            development: [
                { text: '完成核心功能开发', tags: ['开发'] },
                { text: '进行代码审查', tags: ['审查'] },
                { text: '编写技术文档', tags: ['文档'] },
                { text: '处理技术难点', tags: ['攻关'] },
                { text: '完成模块集成', tags: ['集成'] },
                { text: '进行初步测试', tags: ['测试'] }
            ],
            testing: [
                { text: '执行全面测试', tags: ['测试'] },
                { text: '修复发现的问题', tags: ['修复'] },
                { text: '进行性能优化', tags: ['优化'] },
                { text: '完成用户验收测试', tags: ['验收'] },
                { text: '准备上线文档', tags: ['文档'] },
                { text: '进行安全检查', tags: ['安全'] }
            ],
            launch: [
                { text: '完成最终检查', tags: ['检查'] },
                { text: '执行上线部署', tags: ['部署'] },
                { text: '监控系统运行', tags: ['监控'] },
                { text: '收集用户反馈', tags: ['反馈'] },
                { text: '处理紧急问题', tags: ['运维'] },
                { text: '项目复盘总结', tags: ['总结'] }
            ],
            research: [
                { text: '确定写作主题和角度', tags: ['主题'] },
                { text: '收集相关资料', tags: ['资料'] },
                { text: '整理思路和观点', tags: ['思路'] },
                { text: '制定写作大纲', tags: ['大纲'] },
                { text: '准备素材和案例', tags: ['素材'] },
                { text: '阅读参考作品', tags: ['阅读'] }
            ],
            drafting: [
                { text: '完成开篇部分', tags: ['写作'] },
                { text: '推进主体内容', tags: ['写作'] },
                { text: '完成结尾部分', tags: ['写作'] },
                { text: '保持写作节奏', tags: ['坚持'] },
                { text: '初步自我审阅', tags: ['审阅'] },
                { text: '补充遗漏内容', tags: ['补充'] }
            ],
            editing: [
                { text: '通读全文，调整结构', tags: ['结构'] },
                { text: '精炼语言表达', tags: ['润色'] },
                { text: '检查逻辑一致性', tags: ['逻辑'] },
                { text: '校对错字和语法', tags: ['校对'] },
                { text: '寻求他人反馈', tags: ['反馈'] },
                { text: '进行多轮修改', tags: ['修改'] }
            ],
            publishing: [
                { text: '最终审核定稿', tags: ['定稿'] },
                { text: '处理排版格式', tags: ['排版'] },
                { text: '准备发布渠道', tags: ['渠道'] },
                { text: '正式发布上线', tags: ['发布'] },
                { text: '收集读者反馈', tags: ['反馈'] },
                { text: '总结写作经验', tags: ['总结'] }
            ],
            awareness: [
                { text: '了解领域全貌', tags: ['认知'] },
                { text: '明确学习路径', tags: ['路径'] },
                { text: '设定具体目标', tags: ['目标'] },
                { text: '准备学习资源', tags: ['资源'] },
                { text: '建立学习计划', tags: ['计划'] },
                { text: '寻找学习榜样', tags: ['榜样'] }
            ],
            acquisition: [
                { text: '学习核心概念', tags: ['概念'] },
                { text: '掌握基本技能', tags: ['技能'] },
                { text: '完成基础练习', tags: ['练习'] },
                { text: '理解应用场景', tags: ['应用'] },
                { text: '整理学习笔记', tags: ['笔记'] },
                { text: '完成阶段测试', tags: ['测试'] }
            ],
            mastery: [
                { text: '综合运用所学', tags: ['综合'] },
                { text: '完成高难度任务', tags: ['挑战'] },
                { text: '形成个人风格', tags: ['风格'] },
                { text: '分享知识经验', tags: ['分享'] },
                { text: '持续精进提升', tags: ['精进'] },
                { text: '设定新的目标', tags: ['目标'] }
            ],
            preparation: [
                { text: `明确${title}的具体目标`, tags: ['目标'] },
                { text: '制定详细的行动计划', tags: ['计划'] },
                { text: '准备所需资源和工具', tags: ['资源'] },
                { text: '排除可能的障碍', tags: ['准备'] },
                { text: '建立进度跟踪机制', tags: ['跟踪'] },
                { text: '设置提醒和检查点', tags: ['提醒'] }
            ],
            execution: [
                { text: '按计划执行每日任务', tags: ['执行'] },
                { text: '记录进度和成果', tags: ['记录'] },
                { text: '及时解决遇到的问题', tags: ['问题'] },
                { text: '保持行动的持续性', tags: ['坚持'] },
                { text: '定期检视和调整', tags: ['调整'] },
                { text: '庆祝小的胜利', tags: ['激励'] },
                { text: '与他人交流分享', tags: ['交流'] },
                { text: '保持学习和改进', tags: ['学习'] }
            ],
            optimization: [
                { text: '复盘过去的执行情况', tags: ['复盘'] },
                { text: '分析有效和无效的方法', tags: ['分析'] },
                { text: '优化执行策略', tags: ['优化'] },
                { text: '调整资源分配', tags: ['调整'] },
                { text: '弥补之前的不足', tags: ['弥补'] },
                { text: '强化有效的做法', tags: ['强化'] }
            ],
            completion: [
                { text: '完成最后的冲刺', tags: ['冲刺'] },
                { text: '检查所有目标达成情况', tags: ['检查'] },
                { text: '整理成果和文档', tags: ['整理'] },
                { text: '进行全面总结', tags: ['总结'] },
                { text: '分享经验和教训', tags: ['分享'] },
                { text: '规划下一步行动', tags: ['规划'] }
            ]
        };

        return templates[phaseType] || templates.execution;
    },

    /**
     * 渲染计划
     */
    renderPlan(plan) {
        const container = document.getElementById('plannerResultArea');
        
        const lunarStart = Lunar.solarToLunar(
            plan.startDate.getFullYear(),
            plan.startDate.getMonth() + 1,
            plan.startDate.getDate()
        );
        
        const lunarEnd = Lunar.solarToLunar(
            plan.endDate.getFullYear(),
            plan.endDate.getMonth() + 1,
            plan.endDate.getDate()
        );

        const html = `
            <div class="generated-plan" data-plan-id="${plan.id}">
                <div class="plan-header">
                    <h2 class="plan-title">${Utils.escapeHtml(plan.title)}</h2>
                    <div class="plan-meta">
                        <div class="plan-meta-item">
                            <i data-lucide="calendar"></i>
                            <span>${Utils.formatDateCN(plan.startDate)} - ${Utils.formatDateCN(plan.endDate)}</span>
                        </div>
                        <div class="plan-meta-item">
                            <i data-lucide="clock"></i>
                            <span>共${plan.totalDays}天，每日${plan.hoursPerDay}小时</span>
                        </div>
                        <div class="plan-meta-item">
                            <i data-lucide="moon"></i>
                            <span>${lunarStart.monthCN}${lunarStart.dayCN} - ${lunarEnd.monthCN}${lunarEnd.dayCN}</span>
                        </div>
                    </div>
                </div>
                
                <div class="plan-phases">
                    ${plan.phases.map(phase => this.renderPhase(phase)).join('')}
                </div>
                
                <div class="plan-footer">
                    <div class="plan-progress">
                        <span class="progress-text">已完成 <strong id="completedCount-${plan.id}">0</strong> / ${this.getTotalTasks(plan)} 项任务</span>
                    </div>
                    <div class="plan-actions">
                        <button class="plan-action-btn" onclick="Planner.exportPlan('${plan.id}')">
                            <i data-lucide="download"></i>
                            <span>导出</span>
                        </button>
                        <button class="plan-action-btn" onclick="Planner.printPlan('${plan.id}')">
                            <i data-lucide="printer"></i>
                            <span>打印</span>
                        </button>
                        <button class="plan-action-btn" onclick="Planner.savePlan('${plan.id}')">
                            <i data-lucide="save"></i>
                            <span>保存</span>
                        </button>
                    </div>
                </div>
            </div>
        `;

        container.innerHTML = html;
        
        // 保存计划数据
        this.currentPlan = plan;
        
        // 重新初始化图标
        lucide.createIcons();
        
        // 绑定任务复选框事件
        this.bindTaskEvents(plan.id);
    },

    /**
     * 渲染阶段
     */
    renderPhase(phase) {
        const startDateStr = `${phase.startDate.getMonth() + 1}/${phase.startDate.getDate()}`;
        const endDateStr = `${phase.endDate.getMonth() + 1}/${phase.endDate.getDate()}`;

        return `
            <div class="phase">
                <div class="phase-header">
                    <div class="phase-number">${phase.number}</div>
                    <div class="phase-info">
                        <div class="phase-title">${phase.title}</div>
                        <div class="phase-duration">${startDateStr} - ${endDateStr} · ${phase.duration}天</div>
                    </div>
                </div>
                <div class="phase-tasks">
                    ${phase.tasks.map(task => this.renderTask(task)).join('')}
                </div>
            </div>
        `;
    },

    /**
     * 渲染任务
     */
    renderTask(task) {
        return `
            <div class="task-item" data-task-id="${task.id}">
                <div class="task-checkbox" data-task-id="${task.id}"></div>
                <div class="task-content">
                    <div class="task-text">${Utils.escapeHtml(task.text)}</div>
                    <div class="task-tags">
                        ${task.tags.map(tag => `<span class="task-tag">${tag}</span>`).join('')}
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * 获取总任务数
     */
    getTotalTasks(plan) {
        return plan.phases.reduce((total, phase) => total + phase.tasks.length, 0);
    },

    /**
     * 绑定任务事件
     */
    bindTaskEvents(planId) {
        document.querySelectorAll('.task-checkbox').forEach(checkbox => {
            checkbox.addEventListener('click', (e) => {
                const taskId = e.target.dataset.taskId;
                this.toggleTask(taskId, planId);
            });
        });
    },

    /**
     * 切换任务状态
     */
    toggleTask(taskId, planId) {
        const checkbox = document.querySelector(`.task-checkbox[data-task-id="${taskId}"]`);
        const taskItem = checkbox.closest('.task-item');
        
        checkbox.classList.toggle('checked');
        taskItem.classList.toggle('completed');

        // 更新计划数据
        if (this.currentPlan) {
            this.currentPlan.phases.forEach(phase => {
                phase.tasks.forEach(task => {
                    if (task.id === taskId) {
                        task.completed = !task.completed;
                    }
                });
            });
        }

        // 更新完成计数
        this.updateCompletedCount(planId);
    },

    /**
     * 更新完成计数
     */
    updateCompletedCount(planId) {
        const completedCount = document.querySelectorAll('.task-checkbox.checked').length;
        const countElement = document.getElementById(`completedCount-${planId}`);
        if (countElement) {
            countElement.textContent = completedCount;
        }
    },

    /**
     * 导出计划
     */
    exportPlan(planId) {
        if (!this.currentPlan) return;

        const plan = this.currentPlan;
        let markdown = `# ${plan.title}\n\n`;
        markdown += `**时间范围**: ${Utils.formatDateCN(plan.startDate)} - ${Utils.formatDateCN(plan.endDate)}\n\n`;
        markdown += `**总天数**: ${plan.totalDays}天\n\n`;
        markdown += `**每日投入**: ${plan.hoursPerDay}小时\n\n`;
        
        if (plan.description) {
            markdown += `**描述**: ${plan.description}\n\n`;
        }

        markdown += `---\n\n`;

        plan.phases.forEach(phase => {
            markdown += `## 阶段${phase.number}: ${phase.title}\n\n`;
            markdown += `*${phase.startDate.getMonth() + 1}/${phase.startDate.getDate()} - ${phase.endDate.getMonth() + 1}/${phase.endDate.getDate()} · ${phase.duration}天*\n\n`;
            markdown += `${phase.description}\n\n`;

            phase.tasks.forEach(task => {
                const checkbox = task.completed ? '[x]' : '[ ]';
                markdown += `- ${checkbox} ${task.text}\n`;
            });

            markdown += '\n';
        });

        // 创建下载
        const blob = new Blob([markdown], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${plan.title}-计划.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        Utils.showToast('计划已导出为Markdown文件', 'success');
    },

    /**
     * 打印计划
     */
    printPlan(planId) {
        window.print();
    },

    /**
     * 保存计划
     */
    savePlan(planId) {
        if (!this.currentPlan) return;

        // 获取已保存的计划
        let savedPlans = Utils.loadFromStorage('savedPlans') || [];
        
        // 检查是否已存在
        const existingIndex = savedPlans.findIndex(p => p.id === this.currentPlan.id);
        if (existingIndex >= 0) {
            savedPlans[existingIndex] = this.currentPlan;
        } else {
            savedPlans.push(this.currentPlan);
        }

        // 保存到本地存储
        if (Utils.saveToStorage('savedPlans', savedPlans)) {
            Utils.showToast('计划已保存到本地', 'success');
        } else {
            Utils.showToast('保存失败，请重试', 'error');
        }
    }
};
