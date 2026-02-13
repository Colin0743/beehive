# 需求文档：任务系统

## 简介

任务系统是蜜蜂AI电影制片厂平台的核心协作机制。项目创建者可以在项目中发布任务（包含提示词、参考图片、需求说明），其他用户通过"接受任务"获取任务信息并通过邮件提交作品。系统还包含任务大厅（聚合展示所有已发布任务）、站内通知、成就记录，以及个人资料页和项目详情页的相应改造。本功能替代原有的"加入项目"机制，所有数据存储在 localStorage 中。

## 术语表

- **Task_System**: 任务系统的整体模块，负责任务的创建、编辑、发布、接受、完成等全生命周期管理
- **Task**: 项目中的单个任务实体，包含提示词文本、参考图片、任务需求、创建者邮箱等字段
- **Task_Status**: 任务的状态枚举，包括 draft（草稿）、published（已发布/进行中）、completed（已完成）
- **Task_Hall**: 任务大厅页面，聚合展示平台所有已发布状态的任务
- **Notification_System**: 站内通知系统，通过铃铛图标展示未读通知数量和通知列表
- **Achievement_Record**: 成就记录，记录已完成任务的编号和贡献者名称
- **Project_Creator**: 项目创建者，拥有在项目中创建和管理任务的权限
- **Contributor**: 贡献者，接受任务并提交作品被采纳的用户
- **Storage_Layer**: 基于 localStorage 的数据持久化层

## 需求

### 需求 1：任务 CRUD 操作

**用户故事：** 作为项目创建者，我希望能在项目中创建、编辑、发布和删除任务，以便组织和分配视频制作工作。

#### 验收标准

1. WHEN a Project_Creator creates a task, THE Task_System SHALL store the task with fields: prompt text, reference images (as base64 strings), task requirements, creator email, task status (default: draft), and creation timestamp
2. WHEN a Project_Creator edits a task, THE Task_System SHALL update the specified fields and persist the changes to the Storage_Layer
3. WHEN a Project_Creator deletes a task, THE Task_System SHALL remove the task from the project and from the Storage_Layer
4. WHEN a Project_Creator attempts to create a task in a project that already contains 10 tasks, THE Task_System SHALL reject the creation and display an error message indicating the maximum limit has been reached
5. WHEN a Project_Creator reorders tasks, THE Task_System SHALL update the display order of all tasks in the project and persist the new order
6. THE Task_System SHALL allow editing of tasks in any Task_Status (draft, published, or completed)

### 需求 2：任务状态管理

**用户故事：** 作为项目创建者，我希望能管理任务的状态流转，以便跟踪任务的进展。

#### 验收标准

1. WHEN a Project_Creator publishes a draft task, THE Task_System SHALL change the Task_Status from draft to published
2. WHEN a Project_Creator marks a published task as completed, THE Task_System SHALL prompt for the Contributor name, change the Task_Status to completed, and record the Contributor name
3. WHEN a task is marked as completed with a Contributor name, THE Task_System SHALL create an Achievement_Record containing the task identifier, Contributor name, project identifier, and completion timestamp
4. THE Task_System SHALL persist all Task_Status changes to the Storage_Layer immediately

### 需求 3：任务接受流程

**用户故事：** 作为登录用户，我希望能接受已发布的任务并获取创建者的联系方式，以便提交我的作品。

#### 验收标准

1. WHEN a logged-in user clicks the accept-task button on a published task, THE Task_System SHALL record the user's acceptance (user ID, task ID, timestamp) in the Storage_Layer and copy the Project_Creator's email to the clipboard
2. WHEN a user who is not logged in attempts to accept a task, THE Task_System SHALL redirect the user to the login page
3. THE Task_System SHALL allow multiple users to accept the same published task simultaneously without conflict
4. WHEN a user has already accepted a task, THE Task_System SHALL display the task as already accepted and still allow copying the creator's email

### 需求 4：任务大厅

**用户故事：** 作为平台用户，我希望能在一个集中的页面浏览所有已发布的任务，以便发现感兴趣的协作机会。

#### 验收标准

1. THE Task_Hall SHALL display all tasks with Task_Status equal to published, aggregated from all projects across the platform
2. WHEN a user selects a category filter (Sci-Fi, Animation, Documentary, Education, Other), THE Task_Hall SHALL display only published tasks belonging to projects in the selected category
3. THE Task_Hall SHALL display each task with: task title/prompt preview, project name, project category, and creator name
4. THE Task_Hall SHALL be accessible from the main navigation bar as an independent page route

### 需求 5：首页任务大厅模块

**用户故事：** 作为平台用户，我希望在首页看到最新的任务预览，以便快速发现新的协作机会。

#### 验收标准

1. THE Homepage SHALL display a Task_Hall preview module on the right side, positioned below the "My Works" section, parallel with "Featured Projects" on the left
2. THE Task_Hall preview module SHALL show the most recent published tasks (limited to a preview count)
3. THE Task_Hall preview module SHALL include a "View All Tasks" link that navigates to the full Task_Hall page

### 需求 6：站内通知系统

**用户故事：** 作为平台用户，我希望收到任务相关的通知，以便及时了解任务的完成情况和我的贡献是否被采纳。

#### 验收标准

1. THE Notification_System SHALL display a bell icon in the navigation area showing the count of unread notifications for the current user
2. WHEN a user clicks the bell icon, THE Notification_System SHALL display a dropdown list of notifications sorted by creation time (newest first)
3. WHEN a task is marked as completed, THE Notification_System SHALL create a notification for ALL users who accepted that task, with the message containing the task name and the Contributor name
4. WHEN a task is marked as completed, THE Notification_System SHALL create a special congratulatory notification for the specific Contributor whose name was entered
5. THE Notification_System SHALL persist all notifications in the Storage_Layer, keyed by user ID
6. WHEN a user views a notification, THE Notification_System SHALL mark the notification as read and update the unread count

### 需求 7：成就系统

**用户故事：** 作为平台用户，我希望能看到任务完成的历史记录和贡献者信息，以便了解项目进展和个人贡献。

#### 验收标准

1. WHEN a task is completed, THE Task_System SHALL store an Achievement_Record containing: task identifier, task name, Contributor name, project identifier, project name, and completion timestamp
2. THE Project_Detail_Page SHALL display an achievements section listing all Achievement_Records for that project, showing task name, Contributor name, and completion date
3. THE Profile_Page SHALL display an achievements tab listing all Achievement_Records where the current user is the named Contributor

### 需求 8：个人资料页改造

**用户故事：** 作为平台用户，我希望在个人资料页看到我的成就记录而非参与项目列表，以便更好地展示我的贡献。

#### 验收标准

1. THE Profile_Page SHALL remove the "Participated Projects" tab and replace it with an "Achievements" tab
2. THE Profile_Page SHALL display the "Created Projects" tab and the "Achievements" tab
3. WHEN the Achievements tab is active, THE Profile_Page SHALL display a list of Achievement_Records where the current user is the named Contributor, showing task name, project name, and completion date
4. WHEN the user has no Achievement_Records, THE Profile_Page SHALL display an empty state message encouraging the user to accept tasks

### 需求 9：移除"加入项目"机制

**用户故事：** 作为平台维护者，我希望移除旧的"加入项目"机制，以便用户通过任务系统进行协作。

#### 验收标准

1. THE Project_Detail_Page SHALL remove the "Join Project" button and related participation tracking UI
2. THE Task_System SHALL not use the participateInProject, isParticipating, or getParticipatedProjectIds functions from the Storage_Layer
3. THE Project_Detail_Page SHALL retain the Telegram group link as an optional communication channel

### 需求 10：项目详情页任务展示

**用户故事：** 作为平台用户，我希望在项目详情页看到该项目的所有任务和成就记录，以便了解项目的任务分配和完成情况。

#### 验收标准

1. THE Project_Detail_Page SHALL display a "Tasks" section listing all tasks for the project with their current Task_Status
2. WHEN the current user is the Project_Creator, THE Project_Detail_Page SHALL display task management controls (create, edit, delete, publish, complete)
3. WHEN the current user is not the Project_Creator, THE Project_Detail_Page SHALL display task details with an "Accept Task" button for published tasks
4. THE Project_Detail_Page SHALL display an "Achievements" section listing completed tasks and their Contributors

### 需求 11：国际化支持

**用户故事：** 作为平台用户，我希望任务系统的所有文本都支持中英文切换，以便不同语言的用户都能使用。

#### 验收标准

1. THE Task_System SHALL provide English and Chinese translations for all user-facing text through the i18n system
2. WHEN the user switches language, THE Task_System SHALL immediately display all task-related text in the selected language

### 需求 12：数据持久化

**用户故事：** 作为平台用户，我希望所有任务相关数据都能可靠地存储和读取，以便数据不会丢失。

#### 验收标准

1. THE Storage_Layer SHALL serialize Task data, Notification data, Achievement_Record data, and Task_Acceptance data to JSON format for localStorage persistence
2. THE Storage_Layer SHALL deserialize stored JSON data back into typed objects when reading
3. IF the Storage_Layer encounters corrupted or invalid JSON data during deserialization, THEN THE Storage_Layer SHALL return an error result with a descriptive message instead of crashing
4. FOR ALL valid Task objects, serializing to JSON then deserializing SHALL produce an equivalent Task object (round-trip property)
