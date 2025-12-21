# 蜂巢 - 区块链众筹平台

这是一个基于以太坊区块链的去中心化众筹平台，使用 Next.js 和智能合约构建。

## 🚀 功能特性

- **去中心化众筹**: 基于以太坊智能合约的透明众筹
- **钱包集成**: 支持 MetaMask 等以太坊钱包
- **项目管理**: 创建、浏览和管理众筹项目
- **资金管理**: 安全的资金托管和提取机制
- **投票治理**: 贡献者可以对资金使用进行投票

## 🛠️ 技术栈

- **前端**: Next.js, React, Semantic UI React
- **区块链**: Solidity, Web3.js, Truffle
- **网络**: 以太坊 Sepolia 测试网
- **钱包**: MetaMask 集成

## 📋 环境要求

- Node.js 16.0 或更高版本
- npm 或 yarn
- MetaMask 浏览器扩展
- 以太坊测试网账户（Sepolia）

## 🔧 安装和设置

### 1. 克隆项目
```bash
git clone <项目地址>
cd 蜂巢
```

### 2. 安装依赖
```bash
npm install
```

### 3. 环境配置
创建 `.env.local` 文件并配置以下变量：

```env
# 区块链配置
NEXT_PUBLIC_FACTORY_ADDRESS=你的工厂合约地址
NEXT_PUBLIC_INFURA_PROJECT_ID=你的Infura项目ID
NEXT_PUBLIC_NETWORK=sepolia

# 部署配置（仅部署时需要）
MNEMONIC=你的钱包助记词

# 应用配置
NEXT_PUBLIC_APP_NAME=蜂巢
NEXT_PUBLIC_APP_VERSION=1.0.0
```

### 4. 编译智能合约
```bash
npm run compile
```

### 5. 部署智能合约（可选）
如果需要部署新的合约：
```bash
npm run deploy
```

### 6. 启动开发服务器
```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 📖 使用指南

### 连接钱包
1. 确保安装了 MetaMask 扩展
2. 切换到 Sepolia 测试网络
3. 点击页面右上角的"连接钱包"按钮

### 创建众筹项目
1. 连接钱包后，点击"新建项目"
2. 填写项目信息：
   - 项目标题
   - 项目描述
   - 最小贡献金额（ETH）
3. 提交并确认交易

### 参与众筹
1. 浏览项目列表
2. 点击感兴趣的项目查看详情
3. 输入贡献金额并确认交易

### 项目管理
项目创建者可以：
- 创建资金使用请求
- 查看项目统计数据
- 管理项目状态

## 🏗️ 项目结构

```
蜂巢/
├── components/          # React 组件
│   ├── header.jsx      # 页面头部
│   └── layout.jsx      # 页面布局
├── contexts/           # React Context
│   └── Web3Context.jsx # Web3 状态管理
├── ethereum/           # 区块链相关
│   ├── contract/       # 智能合约源码
│   ├── build/         # 编译后的合约
│   ├── campaign.js    # 项目合约接口
│   ├── factory.js     # 工厂合约接口
│   └── web3.js        # Web3 实例
├── pages/             # Next.js 页面
│   ├── campaigns/     # 项目相关页面
│   └── index.jsx      # 首页
├── scripts/           # 构建脚本
│   ├── compile.js     # 合约编译
│   └── deploy.js      # 合约部署
├── utils/             # 工具函数
│   └── blockchain.js  # 区块链服务
└── .env.local         # 环境变量
```

## 🔗 智能合约

### CampaignFactory
工厂合约，负责：
- 创建新的众筹项目
- 管理所有项目地址
- 提供项目查询接口

### Campaign
项目合约，负责：
- 管理项目资金
- 处理贡献和提取
- 实现投票机制

## 🧪 测试

```bash
# 运行测试
npm test

# 运行测试覆盖率
npm run test:coverage
```

## 📦 构建和部署

```bash
# 构建生产版本
npm run build

# 启动生产服务器
npm start
```

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🆘 常见问题

### Q: 为什么无法连接钱包？
A: 请确保：
- 已安装 MetaMask 扩展
- 已切换到 Sepolia 测试网络
- 浏览器允许网站访问 MetaMask

### Q: 交易失败怎么办？
A: 可能的原因：
- Gas 费用不足
- 网络拥堵
- 合约执行失败
- 检查交易详情获取具体错误信息

### Q: 如何获取测试 ETH？
A: 可以使用以下 Sepolia 测试网水龙头：
- [Sepolia Faucet](https://sepoliafaucet.com/)
- [Alchemy Faucet](https://sepoliafaucet.com/)

## 📞 联系我们

如有问题或建议，请通过以下方式联系：
- 提交 Issue
- 发送邮件
- 加入社区讨论

---

**注意**: 这是一个演示项目，请勿在主网上使用真实资金进行测试。
