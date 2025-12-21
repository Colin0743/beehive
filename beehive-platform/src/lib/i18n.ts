import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// 英文资源
const enResources = {
  common: {
    // Navigation
    login: 'Login',
    register: 'Register',
    logout: 'Logout',
    startCreating: 'Start Creating',
    appName: 'Bee Studio AI',
    appFullName: 'Bee AI Movie Studio',
    searchPlaceholder: 'Search projects...',
    
    // Categories
    all: 'All',
    sciFi: 'Sci-Fi',
    animation: 'Animation',
    documentary: 'Documentary',
    education: 'Education',
    other: 'Other',
    
    // Hero Section
    heroTitle: 'Let Creativity Bloom in the Bee Studio',
    heroSubtitle: 'Bee Studio is a collaboration platform for AI video creators. Join the Bee Studio and work with excellent creators to complete AI video works',
    
    // Project Cards
    supporters: 'supporters',
    completed: 'completed',
    days: 'days',
    minutes: 'minutes',
    target: 'Target',
    completedBadge: 'Completed',
    
    // Project Actions
    joinProject: '📱 Join Project',
    noTelegramGroup: 'This project has no group link',
    
    // Pagination
    previousPage: 'Previous',
    nextPage: 'Next',
    
    // Empty States
    noProjects: 'No projects yet',
    noCategoryProjects: 'No projects in this category',
    tryOtherCategories: 'Try viewing other categories',
    firstProjectCTA: 'Be the first creator to create an AI video project on the Bee Studio!',
    createFirstProject: 'Create First Project',
    
    // Featured Projects
    featuredProjects: 'Featured Projects',
    categoryProjects: '{{category}} Projects',
    
    // Footer
    footerDescription: 'AI video creators collaboration platform, let creativity bloom in the Bee Studio',
    quickLinks: 'Quick Links',
    aboutUs: 'About Us',
    howItWorks: 'How It Works',
    creationGuide: 'Creation Guide',
    helpCenter: 'Help Center',
    projectCategories: 'Project Categories',
    community: 'Community',
    blog: 'Blog',
    creatorStories: 'Creator Stories',
    partners: 'Partners',
    contactUs: 'Contact Us',
    allRightsReserved: '© 2025 Bee Studio AI. All rights reserved.',
    privacyPolicy: 'Privacy Policy',
    termsOfService: 'Terms of Service',
    cookieSettings: 'Cookie Settings',
    
    // Loading
    loading: 'Loading...',
    
    // Common Actions
    save: 'Save',
    cancel: 'Cancel',
    confirm: 'Confirm',
    delete: 'Delete',
    edit: 'Edit',
    view: 'View',
    share: 'Share',
    
    // Search Page
    searchResults: 'Search Results',
    searchResultsFor: 'Search results for "{{keyword}}"',
    noSearchResults: 'No search results',
    noSearchResultsDesc: 'Try different keywords or browse all projects',
    browseAllProjects: 'Browse All Projects',
    
    // Project Detail Page
    projectDetails: 'Project Details',
    projectDescription: 'Project Description',
    projectProgress: 'Project Progress',
    projectCreator: 'Project Creator',
    createdOn: 'Created on',
    targetDuration: 'Target Duration',
    currentDuration: 'Current Duration',
    participantsCount: 'Participants',
    daysRemaining: 'Days Remaining',
    projectCompleted: 'Project Completed',
    projectNotFound: 'Project Not Found',
    projectNotFoundDesc: 'This project may have been deleted or the link is invalid',
    backToHome: 'Back to Home',
    editProject: 'Edit Project',
    createdBy: 'Created by',
    aboutThisProject: 'About This Project',
    projectUpdates: 'Project Updates',
    publishUpdate: '+ Publish Update',
    noUpdatesYet: 'No project updates yet',
    clickToPublishFirst: 'Click the button above to publish the first update',
    milestone: 'Milestone',
    announcement: 'Announcement',
    progressUpdate: 'Progress Update',
    completedStatus: 'completed',
    stillNeed: 'Still need',
    participants: 'participants',
    people: 'people',
    publishProjectUpdate: 'Publish Project Update',
    shareProgressDesc: 'Share project progress with participants',
    updateType: 'Update Type',
    updateContent: 'Update Content',
    shareProgressPlaceholder: 'Share project progress, achievements or important announcements...',
    publishUpdateButton: 'Publish Update',
    
    // Language
    language: 'Language',
    english: 'English',
    chinese: '中文',
    
    // Process Comic (How It Works)
    processStep1Title: 'Creator Starts a Project',
    processStep1Desc: 'Propose a creative blueprint, set video duration goals, attract bees to join',
    processStep2Title: 'Bees Join the Project',
    processStep2Desc: 'Browse projects, follow interesting ones, join as a bee and contribute computing power',
    processStep3Title: 'Collaborate to Complete',
    processStep3Desc: 'Receive tasks in Telegram group, generate AI video clips, creator integrates the final work',
    previousStep: 'Previous step',
    nextStep: 'Next step',
    goToStep: 'Go to step {{step}}',
    
    // Login Page
    welcomeBack: 'Welcome Back to Hive',
    continueJourney: 'Continue your AI video creation journey',
    email: 'Email',
    emailPlaceholder: 'Enter your email',
    password: 'Password',
    passwordPlaceholder: 'Enter your password',
    loggingIn: 'Logging in...',
    noAccount: "Don't have an account?",
    registerNow: 'Register Now',
    emailRequired: 'Please enter your email',
    invalidEmail: 'Please enter a valid email address',
    passwordRequired: 'Please enter your password',
    loginFailed: 'Login failed, please try again',
    wrongCredentials: 'Wrong email or password',
    loginSuccess: 'Login successful',
    
    // Register Page
    joinHive: 'Join the Hive',
    startJourney: 'Start your AI video creation journey',
    name: 'Name',
    namePlaceholder: 'Enter your name',
    confirmPassword: 'Confirm Password',
    confirmPasswordPlaceholder: 'Enter password again',
    registering: 'Registering...',
    hasAccount: 'Already have an account?',
    loginNow: 'Login Now',
    nameRequired: 'Please enter your name',
    nameMinLength: 'Name must be at least 2 characters',
    passwordMinLength: 'Password must be at least 6 characters',
    confirmPasswordRequired: 'Please confirm your password',
    passwordMismatch: 'Passwords do not match',
    emailExists: 'This email is already registered',
    registerFailed: 'Registration failed, please try again',
    registerSuccess: 'Registration successful',
    
    // Profile Page
    createdProjectsTab: 'Created Projects',
    participatedProjectsTab: 'Participated Projects',
    projects: 'projects',
    participations: 'participations',
    viewDetails: 'View Details',
    noCreatedProjects: 'You have not created any projects yet',
    noParticipatedProjects: 'You have not participated in any projects yet',
    startFirstProject: 'Start creating your first project',
    createProject: 'Create Project',
    
    // New Project Page
    createNewProject: 'Create New Project',
    projectTitle: 'Project Title',
    projectTitlePlaceholder: 'e.g., Sci-Fi Short: Future City',
    projectDescriptionLabel: 'Project Description',
    projectDescriptionHelp: 'Use the rich text editor to add headings, sections, bold text and images',
    projectDescriptionPlaceholder: 'Describe your project idea, goals and requirements in detail...',
    projectDescriptionTip: 'Tip: Supports headings, bold, lists, images and more. Images are automatically compressed.',
    projectCategory: 'Project Category',
    selectCategory: 'Select a category',
    targetDurationLabel: 'Target Duration (minutes)',
    targetDurationPlaceholder: 'e.g., 5',
    coverImage: 'Cover Image',
    clickToUpload: 'Click to upload',
    orDragFile: 'or drag file here',
    imageFormats: 'Supports JPG, PNG, GIF formats, max 5MB',
    projectVideo: 'Project Video (optional)',
    videoFormats: 'Supports MP4, MOV, AVI formats, recommended under 10MB',
    videoStorageWarning: '⚠️ Due to localStorage limits, large files may not be saved',
    telegramGroupLabel: 'Telegram Group Link (optional)',
    telegramGroupPlaceholder: 'https://t.me/your_group',
    creating: 'Creating...',
    titleRequired: 'Please enter project title',
    titleMinLength: 'Title must be at least 5 characters',
    descriptionRequired: 'Please enter project description',
    descriptionMinLength: 'Description must be at least 20 characters (excluding formatting)',
    categoryRequired: 'Please select a category',
    durationRequired: 'Please enter target duration',
    invalidDuration: 'Please enter a valid duration (minutes)',
    coverRequired: 'Please upload a cover image',
    createFailed: 'Failed to create project, please try again',
    createSuccess: 'Project created successfully',
    removeFile: 'Remove',
    imageUploadError: 'Please upload JPG, PNG or GIF format image',
    videoUploadError: 'Please upload MP4, MOV or AVI format video',
    imageSizeError: 'Image size cannot exceed 5MB',
    videoSizeError: 'Video size cannot exceed 20MB (localStorage limit)',
    fileProcessError: 'File processing failed, please try again',
    storageFullError: 'Storage space is full, please clear browser storage',
    storageFullVideoConfirm: 'Storage space is insufficient. Create project without saving video?',
    
    // Edit Project Page
    editProjectTitle: 'Edit Project',
    currentDurationLabel: 'Current Duration (minutes)',
    currentDurationError: 'Please enter a valid current duration',
    currentDurationExceedsTarget: 'Current duration cannot exceed target duration',
    updateFailed: 'Failed to update project, please try again',
    updateSuccess: 'Project updated successfully',
    saving: 'Saving...',
    saveChanges: 'Save Changes',
    coverUploadSuccess: 'Cover image uploaded successfully',
    videoUploadSuccess: 'Video uploaded successfully',
  }
};

// 中文资源
const zhResources = {
  common: {
    // Navigation
    login: '登录',
    register: '注册',
    logout: '退出',
    startCreating: '开始创作',
    appName: '蜜蜂制片厂AI',
    appFullName: '蜜蜂AI电影制片厂',
    searchPlaceholder: '搜索项目...',
    
    // Categories
    all: '全部',
    sciFi: '科幻',
    animation: '动画',
    documentary: '纪录片',
    education: '教育',
    other: '其他',
    
    // Hero Section
    heroTitle: '让创意在蜜蜂AI电影制片厂中绽放',
    heroSubtitle: '蜜蜂AI电影制片厂是AI视频创作者的协作平台，加入蜜蜂AI电影制片厂，与优秀创作者一起完成AI视频作品',
    
    // Project Cards
    supporters: '支持者',
    completed: '完成',
    days: '天',
    minutes: '分钟',
    target: '目标',
    completedBadge: '已完成',
    
    // Project Actions
    joinProject: '📱 加入项目',
    noTelegramGroup: '该项目暂无群组链接',
    
    // Pagination
    previousPage: '上一页',
    nextPage: '下一页',
    
    // Empty States
    noProjects: '还没有项目',
    noCategoryProjects: '该分类暂无项目',
    tryOtherCategories: '尝试查看其他分类',
    firstProjectCTA: '成为第一个在蜜蜂AI电影制片厂创建AI视频项目的创作者！',
    createFirstProject: '创建第一个项目',
    
    // Featured Projects
    featuredProjects: '精选项目',
    categoryProjects: '{{category}}项目',
    
    // Footer
    footerDescription: 'AI视频创作者的协作平台，让创意在蜜蜂AI电影制片厂中绽放',
    quickLinks: '快速链接',
    aboutUs: '关于我们',
    howItWorks: '如何运作',
    creationGuide: '创作指南',
    helpCenter: '帮助中心',
    projectCategories: '项目分类',
    community: '社区',
    blog: '博客',
    creatorStories: '创作者故事',
    partners: '合作伙伴',
    contactUs: '联系我们',
    allRightsReserved: '© 2025 蜂巢平台. All rights reserved.',
    privacyPolicy: '隐私政策',
    termsOfService: '服务条款',
    cookieSettings: 'Cookie设置',
    
    // Loading
    loading: '加载中...',
    
    // Common Actions
    save: '保存',
    cancel: '取消',
    confirm: '确认',
    delete: '删除',
    edit: '编辑',
    view: '查看',
    share: '分享',
    
    // Search Page
    searchResults: '搜索结果',
    searchResultsFor: '"{{keyword}}" 的搜索结果',
    noSearchResults: '没有搜索结果',
    noSearchResultsDesc: '尝试不同的关键词或浏览所有项目',
    browseAllProjects: '浏览所有项目',
    
    // Project Detail Page
    projectDetails: '项目详情',
    projectDescription: '项目描述',
    projectProgress: '项目进度',
    projectCreator: '项目创建者',
    createdOn: '创建于',
    targetDuration: '目标时长',
    currentDuration: '当前时长',
    participantsCount: '参与人数',
    daysRemaining: '剩余天数',
    projectCompleted: '项目已完成',
    projectNotFound: '项目不存在',
    projectNotFoundDesc: '该项目可能已被删除或链接无效',
    backToHome: '返回首页',
    editProject: '编辑项目',
    createdBy: '由',
    aboutThisProject: '关于这个项目',
    projectUpdates: '项目动态',
    publishUpdate: '+ 发布更新',
    noUpdatesYet: '还没有项目动态',
    clickToPublishFirst: '点击上方按钮发布第一条更新',
    milestone: '里程碑',
    announcement: '公告',
    progressUpdate: '进度更新',
    completedStatus: '已完成',
    stillNeed: '还需',
    participants: '参与者',
    people: '人',
    publishProjectUpdate: '发布项目更新',
    shareProgressDesc: '与参与者分享项目进展',
    updateType: '更新类型',
    updateContent: '更新内容',
    shareProgressPlaceholder: '分享项目进展、成果或重要通知...',
    publishUpdateButton: '发布更新',
    
    // Language
    language: '语言',
    english: 'English',
    chinese: '中文',
    
    // Process Comic (How It Works)
    processStep1Title: '发起人创建项目',
    processStep1Desc: '提出创意蓝图，设定视频时长目标，吸引工蜂加入',
    processStep2Title: '工蜂加入项目',
    processStep2Desc: '浏览项目，关注感兴趣的项目，以工蜂身份加入并提供算力支持',
    processStep3Title: '协作完成作品',
    processStep3Desc: '在Telegram群组中接收任务，生成AI视频片段，发起人整合完成最终作品',
    previousStep: '上一个步骤',
    nextStep: '下一个步骤',
    goToStep: '跳转到步骤 {{step}}',
    
    // Login Page
    welcomeBack: '欢迎回到蜜蜂AI电影制片厂',
    continueJourney: '继续你的AI视频创作之旅',
    email: '邮箱',
    emailPlaceholder: '请输入您的邮箱',
    password: '密码',
    passwordPlaceholder: '请输入您的密码',
    loggingIn: '登录中...',
    noAccount: '还没有账户？',
    registerNow: '立即注册',
    emailRequired: '请输入邮箱',
    invalidEmail: '请输入有效的邮箱地址',
    passwordRequired: '请输入密码',
    loginFailed: '登录失败，请重试',
    wrongCredentials: '邮箱或密码错误',
    loginSuccess: '登录成功',
    
    // Register Page
    joinHive: '加入蜜蜂AI电影制片厂',
    startJourney: '开始你的AI视频创作之旅',
    name: '姓名',
    namePlaceholder: '请输入您的姓名',
    confirmPassword: '确认密码',
    confirmPasswordPlaceholder: '请再次输入密码',
    registering: '注册中...',
    hasAccount: '已有账户？',
    loginNow: '立即登录',
    nameRequired: '请输入姓名',
    nameMinLength: '姓名至少需要2个字符',
    passwordMinLength: '密码至少需要6个字符',
    confirmPasswordRequired: '请确认密码',
    passwordMismatch: '两次输入的密码不一致',
    emailExists: '该邮箱已被注册',
    registerFailed: '注册失败，请重试',
    registerSuccess: '注册成功',
    
    // Profile Page
    createdProjectsTab: '发起的项目',
    participatedProjectsTab: '参与的项目',
    projects: '个项目',
    participations: '次参与',
    viewDetails: '查看详情',
    noCreatedProjects: '你还没有发起任何项目',
    noParticipatedProjects: '你还没有参与任何项目',
    startFirstProject: '开始创建你的第一个项目吧',
    createProject: '创建项目',
    
    // New Project Page
    createNewProject: '创建新项目',
    projectTitle: '项目标题',
    projectTitlePlaceholder: '例如：科幻短片：未来城市',
    projectDescriptionLabel: '项目描述',
    projectDescriptionHelp: '使用富文本编辑器添加标题、章节、加粗文字和图片，让项目描述更加丰富生动',
    projectDescriptionPlaceholder: '详细描述你的项目创意、目标和需求...',
    projectDescriptionTip: '提示：支持标题、加粗、列表、图片等功能。图片会自动压缩并嵌入到内容中。',
    projectCategory: '项目分类',
    selectCategory: '请选择分类',
    targetDurationLabel: '目标时长（分钟）',
    targetDurationPlaceholder: '例如：5',
    coverImage: '项目封面图片',
    clickToUpload: '点击上传',
    orDragFile: '或拖拽文件到此处',
    imageFormats: '支持JPG、PNG、GIF格式，最大5MB',
    projectVideo: '项目视频（可选）',
    videoFormats: '支持MP4、MOV、AVI格式，建议小于10MB',
    videoStorageWarning: '⚠️ 由于localStorage限制，大文件可能无法保存',
    telegramGroupLabel: 'Telegram群组链接（可选）',
    telegramGroupPlaceholder: 'https://t.me/your_group',
    creating: '创建中...',
    titleRequired: '请输入项目标题',
    titleMinLength: '标题至少需要5个字符',
    descriptionRequired: '请输入项目描述',
    descriptionMinLength: '描述至少需要20个字符（不包括格式）',
    categoryRequired: '请选择项目分类',
    durationRequired: '请输入目标时长',
    invalidDuration: '请输入有效的时长（分钟）',
    coverRequired: '请上传项目封面图片',
    createFailed: '创建项目失败，请重试',
    createSuccess: '项目创建成功',
    removeFile: '删除',
    imageUploadError: '请上传JPG、PNG或GIF格式的图片',
    videoUploadError: '请上传MP4、MOV或AVI格式的视频',
    imageSizeError: '图片大小不能超过5MB',
    videoSizeError: '视频大小不能超过20MB（localStorage限制）',
    fileProcessError: '文件处理失败，请重试',
    storageFullError: '存储空间不足，请清理浏览器存储后重试',
    storageFullVideoConfirm: '存储空间不足。是否创建项目但不保存视频文件？',
    
    // Edit Project Page
    editProjectTitle: '编辑项目',
    currentDurationLabel: '当前时长（分钟）',
    currentDurationError: '请输入有效的当前时长',
    currentDurationExceedsTarget: '当前时长不能超过目标时长',
    updateFailed: '更新项目失败，请重试',
    updateSuccess: '项目更新成功',
    saving: '保存中...',
    saveChanges: '保存更改',
    coverUploadSuccess: '封面图片上传成功',
    videoUploadSuccess: '视频上传成功',
  }
};

// 只在客户端初始化 i18n
if (typeof window !== 'undefined') {
  i18n
    .use(initReactI18next)
    .init({
      resources: {
        en: enResources,
        zh: zhResources,
      },
      lng: 'en', // 默认语言设置为英文
      fallbackLng: 'en',
      
      detection: {
        // 禁用浏览器语言检测，始终使用默认语言或用户选择的语言
        order: ['localStorage', 'cookie'],
        caches: ['localStorage', 'cookie'],
      },
      
      interpolation: {
        escapeValue: false,
      },
    });
}

export default i18n;