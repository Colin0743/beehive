'use client';

import LayoutSimple from '@/components/LayoutSimple';
import { useState } from 'react';

export default function HelpPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      question: '如何创建一个新项目？',
      answer: '登录后，点击页面右上角的"开始创作"按钮，填写项目信息（标题、描述、时长目标等），然后提交即可创建项目。'
    },
    {
      question: '如何加入别人的项目？',
      answer: '浏览项目列表，找到感兴趣的项目，点击进入项目详情页，然后点击"加入项目"按钮。如果项目有Telegram群组，会自动跳转到群组链接。'
    },
    {
      question: '项目的时长目标是什么意思？',
      answer: '时长目标是项目发起人设定的最终AI视频的预期时长（以分钟为单位）。参与者共同协作，逐步完成视频片段，直到达到目标时长。'
    },
    {
      question: '为什么需要Telegram群组？',
      answer: '蜂巢平台专注于项目展示和发现，实际的协作沟通在Telegram群组中进行。这样可以更高效地分配任务、分享素材和讨论创意。'
    },
    {
      question: '我可以同时参与多个项目吗？',
      answer: '当然可以！你可以根据自己的时间和兴趣，同时参与多个项目。但请确保能够按时完成承诺的任务。'
    },
    {
      question: '如何更新项目进度？',
      answer: '只有项目发起人可以更新项目进度。进入项目编辑页面，修改"当前时长"字段即可更新进度条。'
    },
    {
      question: '项目完成后会怎样？',
      answer: '当项目达到100%进度时，会显示"已完成"标签。发起人可以在项目日志中发布最终作品的链接，供所有参与者观看。'
    },
    {
      question: '遇到问题如何反馈？',
      answer: '你可以通过邮箱 contact@beehive.ai 联系我们，或在项目的Telegram群组中与发起人沟通。'
    }
  ];

  return (
    <LayoutSimple>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-medium text-[#111827] mb-8">帮助中心</h1>
        
        <div className="bg-white rounded-xl border border-neutral-200 p-8">
          <h2 className="text-xl font-medium text-[#111827] mb-6">常见问题</h2>
          
          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div key={index} className="border border-neutral-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full px-5 py-4 text-left flex justify-between items-center hover:bg-neutral-50 transition-colors"
                >
                  <span className="font-medium text-[#111827]">{faq.question}</span>
                  <span className="text-[#6B7280] text-xl">{openFaq === index ? '−' : '+'}</span>
                </button>
                {openFaq === index && (
                  <div className="px-5 pb-4 text-[#4B5563] text-sm leading-relaxed">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-8 p-6 bg-[#FFF9E6] rounded-xl">
            <h3 className="font-medium text-[#111827] mb-2">还有其他问题？</h3>
            <p className="text-sm text-[#4B5563] mb-4">
              如果以上内容没有解答你的疑问，欢迎通过以下方式联系我们：
            </p>
            <div className="flex gap-4 text-sm">
              <a href="mailto:contact@beehive.ai" className="text-[#4A90E2] hover:underline">
                📧 contact@beehive.ai
              </a>
              <a href="https://t.me/beehive_official" target="_blank" rel="noopener noreferrer" className="text-[#4A90E2] hover:underline">
                📱 Telegram
              </a>
            </div>
          </div>
        </div>
      </div>
    </LayoutSimple>
  );
}
